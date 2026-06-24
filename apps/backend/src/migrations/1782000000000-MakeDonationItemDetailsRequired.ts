import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDonationItemDetailsRequired1782000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE donation_items
            SET oz_per_item = 0
            WHERE oz_per_item IS NULL
        `);
    await queryRunner.query(`
            UPDATE donation_items
            SET estimated_value = 0
            WHERE estimated_value IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE donation_items
            ALTER COLUMN oz_per_item SET NOT NULL,
            ALTER COLUMN estimated_value SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            ALTER COLUMN oz_per_item DROP NOT NULL,
            ALTER COLUMN estimated_value DROP NOT NULL
        `);
  }
}
