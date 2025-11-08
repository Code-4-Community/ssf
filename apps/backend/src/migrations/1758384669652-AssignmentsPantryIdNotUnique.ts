import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignmentsPantryIdNotUnique1758384669652
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE volunteer_assignments
            DROP CONSTRAINT unique_pantry_id
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE volunteer_assignments
            ADD CONSTRAINT unique_pantry_id UNIQUE (pantry_id)
        `);
  }
}
