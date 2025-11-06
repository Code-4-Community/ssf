import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantryFields1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE pantries
        ADD COLUMN accept_food_deliveries boolean NOT NULL DEFAULT false,
        ADD COLUMN delivery_window_instructions text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pantries" 
        DROP COLUMN delivery_window_instructions,
        DROP COLUMN accept_food_deliveries
    `);
  }
}
