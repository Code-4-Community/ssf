import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrdersTable1740367964915 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE orders
                    ADD COLUMN donation_id INT NOT NULL
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE orders
                    DROP COLUMN donation_id
            `);
  }
}
