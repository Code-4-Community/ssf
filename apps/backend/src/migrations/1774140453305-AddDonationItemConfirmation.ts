import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDonationItemConfirmation1774140453305
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE donation_items
        ADD COLUMN details_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE donation_items
        DROP COLUMN details_confirmed;
    `);
  }
}
