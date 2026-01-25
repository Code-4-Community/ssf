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
                ADD COLUMN pantry_id INT NOT NULL,
                ADD CONSTRAINT fk_pantry FOREIGN KEY(pantry_id) REFERENCES pantries(pantry_id);
        `);
  }
}
