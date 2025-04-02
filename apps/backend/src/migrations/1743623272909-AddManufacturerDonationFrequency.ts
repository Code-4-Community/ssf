import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManufacturerDonationFrequency1743623272909
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE food_manufacturers
                ADD COLUMN donation_frequency VARCHAR(255);
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE food_manufacturers
                DROP COLUMN donation_frequency;
            `);
  }
}
