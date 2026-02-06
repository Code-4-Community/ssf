import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDonationRecurrenceFields1770080947285
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE donation_recurrence_enum AS ENUM (
                'none',
                'weekly',
                'monthly',
                'yearly'
            );
        `);

    await queryRunner.query(`
            ALTER TABLE donations
            ADD COLUMN recurrence donation_recurrence_enum NOT NULL DEFAULT 'none',
            ADD COLUMN recurrence_freq INTEGER,
            ADD COLUMN next_donation_dates TIMESTAMP WITH TIME ZONE[],
            ADD COLUMN occurences_remaining INTEGER;
        `);

    await queryRunner.query(`
            ALTER TABLE donations
            ADD CONSTRAINT recurrence_fields_not_null CHECK (
            (recurrence = 'none'
                AND recurrence_freq IS NULL
                AND next_donation_dates IS NULL
                AND occurences_remaining IS NULL)
            OR
            (recurrence != 'none'
                AND recurrence_freq IS NOT NULL
                AND next_donation_dates IS NOT NULL
                AND occurences_remaining IS NOT NULL)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donations
            DROP CONSTRAINT recurrence_fields_not_null,
            DROP COLUMN recurrence,
            DROP COLUMN recurrence_freq,
            DROP COLUMN next_donation_dates,
            DROP COLUMN occurences_remaining;

            DROP TYPE donation_recurrence_enum;
        `);
  }
}
