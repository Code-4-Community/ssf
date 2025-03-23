import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantriesTable1742739750279 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE pantries
            DROP COLUMN address,
            ADD COLUMN address_line_1 varchar(255) NOT NULL DEFAULT 'A',
            ADD COLUMN address_line_2 varchar(255),
            ADD COLUMN address_city varchar(255) NOT NULL DEFAULT 'A',
            ADD COLUMN address_state varchar(255) NOT NULL DEFAULT 'A',
            ADD COLUMN address_zip varchar(255) NOT NULL DEFAULT 'A',
            ADD COLUMN address_country varchar(255),
            ALTER COLUMN reserve_food_for_allergic TYPE varchar(25) USING (
                CASE
                    WHEN reserve_food_for_allergic = true THEN 'Yes'
                    ELSE 'No'
                END
            ),
            ALTER COLUMN reservation_explanation DROP NOT NULL,
            ALTER COLUMN client_visit_frequency DROP NOT NULL,
            ALTER COLUMN identify_allergens_confidence DROP NOT NULL,
            ALTER COLUMN serve_allergic_children DROP NOT NULL,
            ALTER COLUMN ssf_representative_id DROP NOT NULL,
            ALTER COLUMN activities TYPE varchar(255)[] USING ARRAY[activities];

        -- drop temporary defaults
        ALTER TABLE pantries
            ALTER COLUMN address_line_1 DROP DEFAULT,
            ALTER COLUMN address_city DROP DEFAULT,
            ALTER COLUMN address_state DROP DEFAULT,
            ALTER COLUMN address_zip DROP DEFAULT;

        ALTER TABLE pantries
            RENAME COLUMN questions TO activities_comments;
    `);
  }

  // Loses address info
  // Columns where we are doing SET NOT NULL must not have null values
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE pantries
            ADD COLUMN address varchar(255) NOT NULL DEFAULT 'A',
            DROP COLUMN address_line_1,
            DROP COLUMN address_line_2,
            DROP COLUMN address_city,
            DROP COLUMN address_state,
            DROP COLUMN address_zip,
            DROP COLUMN address_country,
            ALTER COLUMN reserve_food_for_allergic TYPE boolean USING (
                CASE
                    WHEN reserve_food_for_allergic = 'Yes' THEN true
                    WHEN reserve_food_for_allergic = 'Some' THEN true
                    ELSE false
                END
            ),
            ALTER COLUMN reservation_explanation SET NOT NULL,
            ALTER COLUMN client_visit_frequency SET NOT NULL,
            ALTER COLUMN identify_allergens_confidence SET NOT NULL,
            ALTER COLUMN serve_allergic_children SET NOT NULL,
            ALTER COLUMN ssf_representative_id SET NOT NULL,
            ALTER COLUMN activities TYPE text USING array_to_string(activities, ',');

        -- drop temporary defaults
        ALTER TABLE pantries
            ALTER COLUMN address DROP DEFAULT;

        ALTER TABLE pantries
            RENAME COLUMN activities_comments TO questions;
      `);
  }
}
