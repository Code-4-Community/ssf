import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveNonPantryVolunteer1758118972420
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE volunteer_assignments
            SET volunteer_type = 'standard_volunteer'
            WHERE volunteer_type = 'non_pantry_volunteer'
        `);

    await queryRunner.query(`
            ALTER TABLE volunteer_assignments ALTER COLUMN volunteer_type DROP DEFAULT
        `);

    await queryRunner.query(`
            CREATE TYPE volunteer_type_enum_new AS ENUM ('lead_volunteer', 'standard_volunteer')
        `);

    await queryRunner.query(`
            ALTER TABLE volunteer_assignments
            ALTER COLUMN volunteer_type TYPE volunteer_type_enum_new
            USING volunteer_type::text::volunteer_type_enum_new
        `);

    await queryRunner.query(`DROP TYPE volunteer_type_enum`);

    await queryRunner.query(
      `ALTER TYPE volunteer_type_enum_new RENAME TO volunteer_type_enum`,
    );

    await queryRunner.query(`
            ALTER TABLE volunteer_assignments ALTER COLUMN volunteer_type SET DEFAULT 'standard_volunteer'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE volunteer_assignments ALTER COLUMN volunteer_type DROP DEFAULT
        `);

    await queryRunner.query(`
            CREATE TYPE volunteer_type_enum_new AS ENUM ('lead_volunteer', 'non_pantry_volunteer', 'standard_volunteer')
        `);

    await queryRunner.query(`
            ALTER TABLE volunteer_assignments
            ALTER COLUMN volunteer_type TYPE volunteer_type_enum_new
            USING volunteer_type::text::volunteer_type_enum_new
        `);

    await queryRunner.query(`DROP TYPE volunteer_type_enum`);

    await queryRunner.query(
      `ALTER TYPE volunteer_type_enum_new RENAME TO volunteer_type_enum`,
    );

    await queryRunner.query(`
            ALTER TABLE volunteer_assignments ALTER COLUMN volunteer_type SET DEFAULT 'non_pantry_volunteer'
        `);
  }
}
