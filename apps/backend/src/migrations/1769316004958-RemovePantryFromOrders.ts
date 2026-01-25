import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePantryFromOrders1769316004958 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE orders
                DROP CONSTRAINT IF EXISTS fk_pantry,
                DROP COLUMN IF EXISTS pantry_id;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE orders
                ADD COLUMN pantry_id INT;
            UPDATE orders o
                SET pantry_id = fr.pantry_id
                FROM food_requests fr
                WHERE o.request_id = fr.request_id;
            ALTER TABLE orders
                ALTER COLUMN pantry_id SET NOT NULL,
                ADD CONSTRAINT fk_pantry FOREIGN KEY(pantry_id) REFERENCES pantries(pantry_id);
        `);
  }
}
