import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateManufacturerEntity1768680807820
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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

        CREATE TYPE "donate_wasted_food_enum" AS ENUM (
          'Always',
          'Sometimes',
          'Never'
        );

        CREATE TYPE "manufacturer_attribute_enum" AS ENUM (
          'Female-founded or women-led',
          'Non-GMO Project Verified',
          'USDA Certified Organic',
          'None of the above'
        );

        CREATE TYPE "status_enum" AS ENUM (
          'approved',
          'denied',
          'pending'
        );

        ALTER TABLE pantries
          ALTER COLUMN status DROP DEFAULT,
          ALTER COLUMN status TYPE status_enum USING (status::text::status_enum),
          ALTER COLUMN status SET DEFAULT 'pending';

        DROP TYPE "pantries_status_enum";

        ALTER TABLE food_manufacturers
          ADD COLUMN food_manufacturer_website VARCHAR(255) NOT NULL DEFAULT 'https://example.com',
          ADD COLUMN secondary_contact_first_name VARCHAR(255),
          ADD COLUMN secondary_contact_last_name VARCHAR(255),
          ADD COLUMN secondary_contact_email VARCHAR(255),
          ADD COLUMN secondary_contact_phone VARCHAR(20),
          ADD COLUMN unlisted_product_allergens allergen_enum[] NOT NULL DEFAULT ARRAY['Gluten']::allergen_enum[],
          ADD COLUMN facility_free_allergens allergen_enum[] NOT NULL DEFAULT ARRAY['Gluten']::allergen_enum[],
          ADD COLUMN products_gluten_free BOOLEAN NOT NULL DEFAULT false,
          ADD COLUMN products_contain_sulfites BOOLEAN NOT NULL DEFAULT false,
          ADD COLUMN products_sustainable_explanation VARCHAR(255) NOT NULL DEFAULT 'Not provided',
          ADD COLUMN in_kind_donations BOOLEAN NOT NULL DEFAULT false,
          ADD COLUMN donate_wasted_food donate_wasted_food_enum NOT NULL DEFAULT 'Never',
          ADD COLUMN manufacturer_attribute manufacturer_attribute_enum,
          ADD COLUMN additional_comments VARCHAR(255),
          ADD COLUMN newsletter_subscription BOOLEAN,
          ADD COLUMN status status_enum NOT NULL DEFAULT 'pending',
          ADD COLUMN date_applied TIMESTAMP NOT NULL DEFAULT NOW();

        ALTER TABLE food_manufacturers
          DROP CONSTRAINT IF EXISTS fk_food_manufacturer_representative_id,
          ADD CONSTRAINT fk_food_manufacturer_representative_id FOREIGN KEY(food_manufacturer_representative_id) REFERENCES users(user_id) ON DELETE CASCADE;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE food_manufacturers
            DROP CONSTRAINT IF EXISTS fk_food_manufacturer_representative_id,
            ADD CONSTRAINT fk_food_manufacturer_representative_id FOREIGN KEY(food_manufacturer_representative_id) REFERENCES users(user_id);

          ALTER TABLE food_manufacturers
            DROP COLUMN date_applied,
            DROP COLUMN status,
            DROP COLUMN newsletter_subscription,
            DROP COLUMN additional_comments,
            DROP COLUMN manufacturer_attribute,
            DROP COLUMN donate_wasted_food,
            DROP COLUMN in_kind_donations,
            DROP COLUMN products_sustainable_explanation,
            DROP COLUMN products_contain_sulfites,
            DROP COLUMN products_gluten_free,
            DROP COLUMN facility_free_allergens,
            DROP COLUMN unlisted_product_allergens,
            DROP COLUMN secondary_contact_phone,
            DROP COLUMN secondary_contact_email,
            DROP COLUMN secondary_contact_last_name,
            DROP COLUMN secondary_contact_first_name,
            DROP COLUMN food_manufacturer_website;

          DROP TYPE IF EXISTS "manufacturer_attribute_enum";
          DROP TYPE IF EXISTS "donate_wasted_food_enum";
          DROP TYPE IF EXISTS "allergen_enum";

          CREATE TYPE "pantries_status_enum" AS ENUM (
            'approved',
            'denied',
            'pending'
          );

          ALTER TABLE pantries
            ALTER COLUMN status DROP DEFAULT,
            ALTER COLUMN status TYPE pantries_status_enum USING (status::text::pantries_status_enum),
            ALTER COLUMN status SET DEFAULT 'pending';

          DROP TYPE IF EXISTS "status_enum";
        `);
  }
}
