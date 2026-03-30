import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrdersVolunteerActions1774883880543 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            ALTER TABLE orders
            ADD COLUMN confirm_donation_receipt boolean NOT NULL DEFAULT false,
            ADD COLUMN notify_pantry boolean NOT NULL DEFAULT false
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            ALTER TABLE orders
            DROP COLUMN confirm_donation_receipt,
            DROP COLUMN notify_pantry
        `);
  }
}
