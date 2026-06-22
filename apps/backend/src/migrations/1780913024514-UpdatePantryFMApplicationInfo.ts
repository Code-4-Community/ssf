import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantryFMApplicationInfo1780913024514
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "dedicated_allergy_friendly_enum" AS ENUM (
        'Yes',
        'No but we can accommodate this',
        'No, and we cannot accommodate this'
      );
    `);

    await queryRunner.query(`
      UPDATE pantries
      SET
        delivery_window_instructions = COALESCE(delivery_window_instructions, 'N/A'),
        client_visit_frequency = COALESCE(client_visit_frequency, 'Daily'),
        serve_allergic_children = COALESCE(serve_allergic_children, 'Yes, many (> 10)'),
        shipment_address_country = COALESCE(shipment_address_country, 'US'),
        mailing_address_country = COALESCE(mailing_address_country, 'US'),
        activities = array_replace(activities, 'Spreadsheet to track dietary needs', 'Create labeled shelf')
      WHERE delivery_window_instructions IS NULL
        OR client_visit_frequency IS NULL
        OR serve_allergic_children IS NULL
        OR shipment_address_country IS NULL
        OR mailing_address_country IS NULL
        OR 'Spreadsheet to track dietary needs' = ANY(activities);
    `);

    await queryRunner.query(`
      ALTER TABLE pantries
        ADD COLUMN languages text[] NOT NULL DEFAULT '{English}',
        ALTER COLUMN dedicated_allergy_friendly TYPE dedicated_allergy_friendly_enum
          USING (
            CASE
              WHEN dedicated_allergy_friendly THEN 'Yes'
              ELSE 'No, and we cannot accommodate this'
            END
          )::dedicated_allergy_friendly_enum,
        ALTER COLUMN delivery_window_instructions SET NOT NULL,
        ALTER COLUMN client_visit_frequency SET NOT NULL,
        ALTER COLUMN serve_allergic_children SET NOT NULL,
        ALTER COLUMN shipment_address_country SET DEFAULT 'US',
        ALTER COLUMN shipment_address_country SET NOT NULL,
        ALTER COLUMN mailing_address_country SET DEFAULT 'US',
        ALTER COLUMN mailing_address_country SET NOT NULL,
        DROP COLUMN identify_allergens_confidence,
        DROP COLUMN newsletter_subscription;
    `);

    await queryRunner.query(`
      ALTER TABLE pantries
        ALTER COLUMN languages DROP DEFAULT;
    `);

    await queryRunner.query(`DROP TYPE "allergens_confidence_enum";`);

    await queryRunner.query(`
      ALTER TYPE "activity_enum" RENAME TO "activity_enum_old";

      CREATE TYPE "activity_enum" AS ENUM (
        'Create labeled shelf',
        'Provide educational pamphlets',
        'Post allergen-free resource flyers',
        'Survey clients to determine medical dietary needs',
        'Collect feedback from allergen-avoidant clients',
        'Something else'
      );

      ALTER TABLE pantries
        ALTER COLUMN activities TYPE "activity_enum"[]
          USING activities::text[]::"activity_enum"[],
        ALTER COLUMN activities DROP NOT NULL;

      DROP TYPE "activity_enum_old";
    `);

    await queryRunner.query(`
      ALTER TABLE food_manufacturers
        DROP COLUMN products_contain_sulfites,
        DROP COLUMN manufacturer_attribute,
        DROP COLUMN newsletter_subscription;
    `);

    await queryRunner.query(`DROP TYPE "manufacturer_attribute_enum";`);

    await queryRunner.query(`
      ALTER TABLE food_manufacturers
        ALTER COLUMN unlisted_product_allergens DROP DEFAULT,
        ALTER COLUMN facility_free_allergens DROP DEFAULT;

      UPDATE food_manufacturers
      SET
        unlisted_product_allergens = array_remove(unlisted_product_allergens, 'Gluten'),
        facility_free_allergens = array_remove(facility_free_allergens, 'Gluten')
      WHERE 'Gluten' = ANY(unlisted_product_allergens)
        OR 'Gluten' = ANY(facility_free_allergens);

      ALTER TYPE "allergen_enum" RENAME TO "allergen_enum_old";

      CREATE TYPE "allergen_enum" AS ENUM (
        'Milk',
        'Egg',
        'Peanut',
        'Tree nuts',
        'Wheat',
        'Soy',
        'Fish',
        'Shellfish',
        'Sesame'
      );

      ALTER TABLE food_manufacturers
        ALTER COLUMN unlisted_product_allergens TYPE "allergen_enum"[]
          USING unlisted_product_allergens::text[]::"allergen_enum"[],
        ALTER COLUMN facility_free_allergens TYPE "allergen_enum"[]
          USING facility_free_allergens::text[]::"allergen_enum"[];

      DROP TYPE "allergen_enum_old";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "allergen_enum" RENAME TO "allergen_enum_old";

      CREATE TYPE "allergen_enum" AS ENUM (
        'Milk',
        'Egg',
        'Peanut',
        'Tree nuts',
        'Wheat',
        'Soy',
        'Fish',
        'Shellfish',
        'Sesame',
        'Gluten'
      );

      ALTER TABLE food_manufacturers
        ALTER COLUMN unlisted_product_allergens TYPE "allergen_enum"[]
          USING unlisted_product_allergens::text[]::"allergen_enum"[],
        ALTER COLUMN facility_free_allergens TYPE "allergen_enum"[]
          USING facility_free_allergens::text[]::"allergen_enum"[];

      DROP TYPE "allergen_enum_old";
    `);

    await queryRunner.query(`
      CREATE TYPE "manufacturer_attribute_enum" AS ENUM (
        'Female-founded or women-led',
        'Non-GMO Project Verified',
        'USDA Certified Organic',
        'None of the above'
      );

      ALTER TABLE food_manufacturers
        ADD COLUMN products_contain_sulfites BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN manufacturer_attribute manufacturer_attribute_enum,
        ADD COLUMN newsletter_subscription BOOLEAN;
    `);

    await queryRunner.query(`
      ALTER TYPE "activity_enum" RENAME TO "activity_enum_old";

      CREATE TYPE "activity_enum" AS ENUM (
        'Create labeled shelf',
        'Provide educational pamphlets',
        'Spreadsheet to track dietary needs',
        'Post allergen-free resource flyers',
        'Survey clients to determine medical dietary needs',
        'Collect feedback from allergen-avoidant clients',
        'Something else'
      );

      ALTER TABLE pantries
        ALTER COLUMN activities TYPE "activity_enum"[]
          USING activities::text[]::"activity_enum"[];

      UPDATE pantries
      SET activities = ARRAY['Create labeled shelf']::"activity_enum"[]
      WHERE activities IS NULL;

      ALTER TABLE pantries
        ALTER COLUMN activities SET NOT NULL;

      DROP TYPE "activity_enum_old";
    `);

    await queryRunner.query(`
      CREATE TYPE "allergens_confidence_enum" AS ENUM (
        'Very confident',
        'Somewhat confident',
        'Not very confident (we need more education!)'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE pantries
        ADD COLUMN identify_allergens_confidence allergens_confidence_enum,
        ADD COLUMN newsletter_subscription boolean,
        ALTER COLUMN delivery_window_instructions DROP NOT NULL,
        ALTER COLUMN client_visit_frequency DROP NOT NULL,
        ALTER COLUMN serve_allergic_children DROP NOT NULL,
        ALTER COLUMN shipment_address_country DROP NOT NULL,
        ALTER COLUMN shipment_address_country DROP DEFAULT,
        ALTER COLUMN mailing_address_country DROP NOT NULL,
        ALTER COLUMN mailing_address_country DROP DEFAULT,
        ALTER COLUMN dedicated_allergy_friendly TYPE boolean
          USING (dedicated_allergy_friendly = 'Yes'),
        DROP COLUMN languages;
    `);

    await queryRunner.query(`DROP TYPE "dedicated_allergy_friendly_enum";`);
  }
}
