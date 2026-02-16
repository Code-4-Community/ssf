import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameDonationMatchingStatus1771260403657
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donations
              ALTER COLUMN status DROP DEFAULT;

            CREATE TYPE donations_status_enum_new AS ENUM (
              'available',
              'matched',
              'fulfilled'
            );

            ALTER TABLE donations
              ALTER COLUMN status
              TYPE donations_status_enum_new
              USING (
                CASE
                  WHEN status = 'matching'
                    THEN 'matched'
                  ELSE status::text
                END
              )::donations_status_enum_new;

            DROP TYPE donations_status_enum;

            ALTER TYPE donations_status_enum_new
              RENAME TO donations_status_enum;

            ALTER TABLE donations
              ALTER COLUMN status
              SET DEFAULT 'available';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donations
              ALTER COLUMN status DROP DEFAULT;

            CREATE TYPE donations_status_enum_old AS ENUM (
              'available',
              'matching',
              'fulfilled'
            );

            ALTER TABLE donations
              ALTER COLUMN status
              TYPE donations_status_enum_old
              USING (
                CASE
                  WHEN status = 'matched'
                    THEN 'matching'
                  ELSE status::text
                END
              )::donations_status_enum_old;

            DROP TYPE donations_status_enum;

            ALTER TYPE donations_status_enum_old
              RENAME TO donations_status_enum;

            ALTER TABLE donations
              ALTER COLUMN status
              SET DEFAULT 'available';
        `);
  }
}
