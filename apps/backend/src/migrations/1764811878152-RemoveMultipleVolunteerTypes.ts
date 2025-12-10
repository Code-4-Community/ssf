import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMultipleVolunteerTypes1764811878152
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

      CREATE TYPE "users_role_enum_new" AS ENUM (
        'admin',
        'volunteer',
        'pantry',
        'food_manufacturer'
      );

      ALTER TABLE users
      ALTER COLUMN role
      TYPE users_role_enum_new
      USING role::text::users_role_enum_new;
      DROP TYPE users_role_enum;
      ALTER TYPE users_role_enum_new
      RENAME TO users_role_enum;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

      CREATE TYPE "users_role_enum_old" AS ENUM (
        'admin',
        'lead_volunteer',
        'standard_volunteer',
        'pantry',
        'food_manufacturer'
      );

      ALTER TABLE users
      ALTER COLUMN role
      TYPE users_role_enum_old
      USING role::text::users_role_enum_old;
      DROP TYPE users_role_enum;
      ALTER TYPE users_role_enum_old
      RENAME TO users_role_enum;
    `);
  }
}
