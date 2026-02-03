import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDonationRecurranceFields1770080947285 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE donation_recurrance_enum AS ENUM (
                'once',
                'weekly',
                'monthly',
                'yearly'
            );
        `);
        
        await queryRunner.query(`
            ALTER TABLE donations
            ADD COLUMN recurrance donation_recurrance_enum NOT NULL DEFAULT 'once',
            ADD COLUMN recurrance_value INTEGER,
            ADD COLUMN next_donation_dates TIMESTAMP WITH TIME ZONE[],
            ADD COLUMN occurances INTEGER;
        `);

        await queryRunner.query(`
            ALTER TABLE donations
            ADD CONSTRAINT recurrance_fields_not_null CHECK (
            (recurrance = 'once'
                AND recurrance_value IS NULL
                AND next_donation_dates IS NULL
                AND occurances IS NULL)
            OR
            (recurrance != 'once'
                AND recurrance_value IS NOT NULL
                AND next_donation_dates IS NOT NULL
                AND occurances IS NOT NULL)
            );
        `);
    }


    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE donations
            DROP CONSTRAINT recurrance_fields_not_null,
            DROP COLUMN recurrance,
            DROP COLUMN recurrance_value,
            DROP COLUMN next_donation_dates,
            DROP COLUMN occurances;

            DROP TYPE donation_recurrance_enum;
        `);
    }
}
