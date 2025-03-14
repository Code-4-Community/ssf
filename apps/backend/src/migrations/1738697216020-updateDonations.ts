import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDonations1738697216020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items ADD COLUMN oz_per_item INT,
            ADD COLUMN estimated_value INT,
            ADD COLUMN food_type VARCHAR(255);
        `);
    await queryRunner.query(`
            ALTER TABLE donations ADD COLUMN total_items INT,
            ADD COLUMN total_oz INT,
            ADD COLUMN total_estimated_value INT;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items DROP COLUMN oz_per_item INT,
            DROP COLUMN estimated_value INT,
            DROP COLUMN food_type VARCHAR(255); 
        `);
    await queryRunner.query(`
            ALTER TABLE donations DROP COLUMN total_items INT,
            DROP COLUMN total_oz INT,
            DROP COLUMN total_estimated_value INT;
        `);
  }
}
