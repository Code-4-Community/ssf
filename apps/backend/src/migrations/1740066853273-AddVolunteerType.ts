import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVolunteerType1740066853273 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE volunteer_type_enum AS ENUM ('lead_volunteer', 'non_pantry_volunteer', 'standard_volunteer')
        `);

    await queryRunner.query(`
            ALTER TABLE volunteer_assignments
            ADD COLUMN volunteer_type volunteer_type_enum NOT NULL DEFAULT 'non_pantry_volunteer'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE volunteer_assignments DROP COLUMN volunteer_type`,
    );
    await queryRunner.query(`DROP TYPE volunteer_type_enum`);
  }
}
