import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVolunteerPantryUniqueConstraint1760033134668
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE volunteer_assignments DROP COLUMN assignment_id;

            ALTER TABLE volunteer_assignments
            ADD PRIMARY KEY (volunteer_id, pantry_id);

            ALTER TABLE volunteer_assignments DROP CONSTRAINT IF EXISTS fk_volunteer_id;

            ALTER TABLE volunteer_assignments DROP CONSTRAINT IF EXISTS fk_pantry_id;

            ALTER TABLE volunteer_assignments
            ADD CONSTRAINT fk_volunteer_id FOREIGN KEY (volunteer_id) REFERENCES users(user_id) ON DELETE CASCADE,
            ADD CONSTRAINT fk_pantry_id FOREIGN KEY (pantry_id) REFERENCES pantries(pantry_id) ON DELETE CASCADE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE volunteer_assignments DROP CONSTRAINT fk_volunteer_id;

            ALTER TABLE volunteer_assignments DROP CONSTRAINT fk_pantry_id;

            ALTER TABLE volunteer_assignments DROP CONSTRAINT volunteer_assignments_pkey;

            ALTER TABLE volunteer_assignments ADD COLUMN assignment_id SERIAL PRIMARY KEY;
        `);
  }
}
