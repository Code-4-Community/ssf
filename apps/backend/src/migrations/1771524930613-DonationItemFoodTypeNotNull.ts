import { MigrationInterface, QueryRunner } from 'typeorm';

export class DonationItemFoodTypeNotNull1771524930613
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            ALTER COLUMN food_type SET NOT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            ALTER COLUMN food_type DROP NOT NULL;
        `);
  }
}
