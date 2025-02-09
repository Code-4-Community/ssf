import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantriesTable1737906317154 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pantries 
            ADD COLUMN activities TEXT NOT NULL,
            ADD COLUMN questions TEXT,
            ADD COLUMN items_in_stock TEXT NOT NULL,
            ADD COLUMN need_more_options TEXT NOT NULL;
        `);

    await queryRunner.query(`
            ALTER TABLE pantries 
            ALTER COLUMN dedicated_allergy_friendly TYPE VARCHAR(255);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pantries 
            ALTER COLUMN dedicated_allergy_friendly TYPE VARCHAR(25);
        `);
    await queryRunner.query(`
            ALTER TABLE pantries 
            DROP COLUMN activities,
            DROP COLUMN questions,
            DROP COLUMN items_in_stock,
            DROP COLUMN need_more_options;
        `);
  }
}
