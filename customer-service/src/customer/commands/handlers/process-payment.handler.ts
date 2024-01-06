import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ProcessPaymentCommand } from '../impl';
import { CustomerEntity } from '../../../entities';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentCommandHandler
  implements ICommandHandler<ProcessPaymentCommand>
{
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async execute({ customerId, totalAmount }: ProcessPaymentCommand): Promise<boolean> {
    const manager = this.customerRepository.manager;
    const queryRunner = manager.connection.createQueryRunner();

    try {
      await queryRunner.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
      await queryRunner.startTransaction();
      const customer = await queryRunner.query(
        'SELECT * FROM customer_entity WHERE id = ? FOR UPDATE',
        [customerId]
      );
      if (!customer || customer[0].balance < totalAmount) {
        Logger.error('Cannot process payment due to insufficient balance or invalid customer');
        await queryRunner.rollbackTransaction();
        return false;
      }
      const newBalance = customer[0].balance - totalAmount;
      await queryRunner.query(
        'UPDATE customer_entity SET balance = ? WHERE id = ?',
        [newBalance, customerId]
      ); 
      await queryRunner.commitTransaction();
      Logger.log('Successfully processed payment');
      return true;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      Logger.error(`Failed to process payment due to error: ${error.message}`);
      return false;

    } finally {
      await queryRunner.release();
    }
  }

}
