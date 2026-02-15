import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderEntity1769990652833 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS tracking_link VARCHAR(255),
            ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2);

            UPDATE orders
            SET tracking_link = 'www.samplelink/samplelink',
                shipping_cost = 20.00
                WHERE status = 'delivered' OR status = 'shipped' AND shipped_at IS NOT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE orders
            DROP COLUMN IF EXISTS tracking_link,
            DROP COLUMN IF EXISTS shipping_cost;
        `);
  }
}
