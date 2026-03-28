import { MigrationInterface, QueryRunner } from 'typeorm';

export class DonationItemsAllocationsOnDeleteCascade1774214910101
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

    await queryRunner.query(`
            ALTER TABLE allocations
            DROP CONSTRAINT IF EXISTS fk_item_id;
        `);

    await queryRunner.query(`
            ALTER TABLE allocations
            ADD CONSTRAINT fk_item_id
            FOREIGN KEY(item_id)
            REFERENCES donation_items(item_id)
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

    await queryRunner.query(`
            ALTER TABLE allocations
            DROP CONSTRAINT IF EXISTS fk_item_id;
        `);

    await queryRunner.query(`
            ALTER TABLE allocations
            ADD CONSTRAINT fk_item_id
            FOREIGN KEY(item_id)
            REFERENCES donation_items(item_id);
        `);
  }
}
