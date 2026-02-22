import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFoodRescueToDonationItems1770679339809
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            ADD COLUMN food_rescue boolean
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            DROP COLUMN food_rescue
        `);
  }
}
