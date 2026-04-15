import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeFoodRescueRequired1773889925002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE donation_items
            SET food_rescue = false
            WHERE food_rescue IS NULL
        `);
    await queryRunner.query(`
            ALTER TABLE donation_items
            ALTER COLUMN food_rescue SET NOT NULL,
            ALTER COLUMN food_rescue SET DEFAULT false
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            ALTER COLUMN food_rescue DROP NOT NULL,
            ALTER COLUMN food_rescue DROP DEFAULT
        `);
  }
}
