import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantriesTable1739056029076 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pantries
                ADD COLUMN date_applied TIMESTAMP NOT NULL DEFAULT NOW()
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pantries
                DROP COLUMN date_applied
        `);
  }
}
