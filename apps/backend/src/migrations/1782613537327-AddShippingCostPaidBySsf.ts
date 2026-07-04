import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShippingCostPaidBySsf1782613537327
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ADD COLUMN shipping_cost_paid_by_ssf boolean NOT NULL DEFAULT false;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        DROP COLUMN shipping_cost_paid_by_ssf;
    `);
  }
}
