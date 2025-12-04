import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveMultipleVolunteerTypes1764811878152 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            DROP COLUMN role;
            DROP TYPE IF EXISTS users_role_enum;

            CREATE TYPE "users_role_enum" AS ENUM (
                'admin',
                'volunteer',
                'pantry',
                'food_manufacturer'
            );

            ALTER TABLE users
            ADD COLUMN role users_role_enum NOT NULL DEFAULT 'volunteer';
        `);


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            DROP COLUMN role;
            DROP TYPE IF EXISTS users_role_enum;

            CREATE TYPE "users_role_enum" AS ENUM (
                'admin',
                'lead_volunteer',
                'standard_volunteer',
                'pantry',
                'food_manufacturer'
            );

            ALTER TABLE users
            ADD COLUMN role users_role_enum NOT NULL DEFAULT 'standard_volunteer';
        `);
    }

}
