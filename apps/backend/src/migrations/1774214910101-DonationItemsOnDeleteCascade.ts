import { MigrationInterface, QueryRunner } from 'typeorm';

export class DonationItemsOnDeleteCascade1774214910101
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            DROP CONSTRAINT IF EXISTS fk_donation_id;
        `);

    await queryRunner.query(`
            ALTER TABLE donation_items
            ADD CONSTRAINT fk_donation_id
            FOREIGN KEY(donation_id)
            REFERENCES donations(donation_id)
            ON DELETE CASCADE;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            DROP CONSTRAINT IF EXISTS fk_donation_id;
        `);

    await queryRunner.query(`
            ALTER TABLE donation_items
            ADD CONSTRAINT fk_donation_id
            FOREIGN KEY(donation_id)
            REFERENCES donations(donation_id);
        `);
  }
}
