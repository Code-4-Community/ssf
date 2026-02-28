import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDonationTotalColumns1772241115031
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "donations"
            
            DROP COLUMN total_items,
            DROP COLUMN total_oz,
            DROP COLUMN total_estimated_value;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "donations"

            ADD COLUMN total_items INTEGER,
            ADD COLUMN total_oz NUMERIC(10,2),
            ADD COLUMN total_estimated_value NUMERIC(10,2);
        `);
  }
}
