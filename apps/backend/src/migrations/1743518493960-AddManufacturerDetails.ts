import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManufacturerDetails1743518493960 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE food_manufacturers
                ADD COLUMN industry VARCHAR(255),
                ADD COLUMN email VARCHAR(255),
                ADD COLUMN phone VARCHAR(255),
                ADD COLUMN address VARCHAR(255),
                ADD COLUMN signup_date TIMESTAMP NOT NULL DEFAULT NOW();
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE food_manufacturers
                DROP COLUMN industry,
                DROP COLUMN email,
                DROP COLUMN phone,
                DROP COLUMN address,
                DROP COLUMN signup_date;
            `);
  }
}
