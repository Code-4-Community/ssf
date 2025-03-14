import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDonationColTypes1741708808976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items 
              ALTER COLUMN oz_per_item TYPE NUMERIC(20, 2),
              ALTER COLUMN estimated_value TYPE NUMERIC(20, 2);
          `);

    await queryRunner.query(`
            ALTER TABLE donations 
              ALTER COLUMN total_oz TYPE NUMERIC(20, 2),
              ALTER COLUMN total_estimated_value TYPE NUMERIC(20, 2);
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items 
              ALTER COLUMN oz_per_item TYPE INT,
              ALTER COLUMN estimated_value TYPE INT;
        `);

    await queryRunner.query(`
            ALTER TABLE donations 
              ALTER COLUMN total_oz TYPE INT,
              ALTER COLUMN total_estimated_value TYPE INT;
        `);
  }
}
