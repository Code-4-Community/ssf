import { MigrationInterface, QueryRunner } from 'typeorm';

export class PantryIDNullable1743439379596 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE volunteer_assignments
            ALTER COLUMN pantry_id DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE volunteer_assignments
            ALTER COLUMN pantry_id SET NOT NULL
        `);
  }
}
