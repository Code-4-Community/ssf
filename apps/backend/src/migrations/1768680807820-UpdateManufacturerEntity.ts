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

        CREATE TYPE "application_status_enum" AS ENUM (
          'approved',
          'denied',
          'pending'
        );

        ALTER TABLE pantries
          ALTER COLUMN status DROP DEFAULT,
          ALTER COLUMN status TYPE application_status_enum USING (status::text::application_status_enum),
          ALTER COLUMN status SET DEFAULT 'pending';

        DROP TYPE IF EXISTS "pantries_status_enum";

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
          ADD COLUMN products_sustainable_explanation TEXT NOT NULL DEFAULT 'Not provided',
          ADD COLUMN in_kind_donations BOOLEAN NOT NULL DEFAULT false,
          ADD COLUMN donate_wasted_food donate_wasted_food_enum NOT NULL DEFAULT 'Never',
          ADD COLUMN manufacturer_attribute manufacturer_attribute_enum,
          ADD COLUMN additional_comments TEXT,
          ADD COLUMN newsletter_subscription BOOLEAN,
          ADD COLUMN status application_status_enum NOT NULL DEFAULT 'pending',
          ADD COLUMN date_applied TIMESTAMP NOT NULL DEFAULT NOW();

        ALTER TABLE food_manufacturers
          DROP CONSTRAINT IF EXISTS fk_food_manufacturer_representative_id,
          ADD CONSTRAINT fk_food_manufacturer_representative_id FOREIGN KEY(food_manufacturer_representative_id) REFERENCES users(user_id) ON DELETE CASCADE;

        UPDATE food_manufacturers
        SET 
          food_manufacturer_website = 'https://www.healthyfoodsco.com',
          secondary_contact_first_name = 'Jane',
          secondary_contact_last_name = 'Smith',
          secondary_contact_email = 'jane.smith@healthyfoodsco.com',
          secondary_contact_phone = '(617) 555-0102',
          unlisted_product_allergens = ARRAY['Milk', 'Soy']::allergen_enum[],
          facility_free_allergens = ARRAY['Peanut', 'Tree nuts', 'Shellfish']::allergen_enum[],
          products_gluten_free = true,
          products_contain_sulfites = false,
          products_sustainable_explanation = 'We source all ingredients locally and use sustainable farming practices.',
          in_kind_donations = true,
          donate_wasted_food = 'Always',
          manufacturer_attribute = 'USDA Certified Organic',
          additional_comments = 'We prioritize allergen-free products for families in need.',
          newsletter_subscription = true,
          status = 'approved',
          date_applied = NOW() - INTERVAL '3 months'
        WHERE food_manufacturer_name = 'Healthy Foods Co';

        UPDATE food_manufacturers
        SET 
          food_manufacturer_website = 'https://www.freshfarmfoods.com',
          secondary_contact_first_name = 'Michael',
          secondary_contact_last_name = 'Chen',
          secondary_contact_email = 'm.chen@freshfarmfoods.com',
          secondary_contact_phone = '(617) 555-0203',
          unlisted_product_allergens = ARRAY['Egg', 'Wheat', 'Milk']::allergen_enum[],
          facility_free_allergens = ARRAY['Peanut', 'Tree nuts']::allergen_enum[],
          products_gluten_free = false,
          products_contain_sulfites = true,
          products_sustainable_explanation = 'Our products use minimal packaging and renewable energy in production.',
          in_kind_donations = true,
          donate_wasted_food = 'Sometimes',
          manufacturer_attribute = 'Female-founded or women-led',
          additional_comments = 'Happy to work with food pantries on custom orders.',
          newsletter_subscription = true,
          status = 'approved',
          date_applied = NOW() - INTERVAL '6 months'
        WHERE food_manufacturer_name = 'FoodCorp Industries';

        UPDATE food_manufacturers
        SET 
          food_manufacturer_website = 'https://www.organicharvest.com',
          secondary_contact_first_name = NULL,
          secondary_contact_last_name = NULL,
          secondary_contact_email = NULL,
          secondary_contact_phone = NULL,
          unlisted_product_allergens = ARRAY['Soy', 'Wheat', 'Sesame']::allergen_enum[],
          facility_free_allergens = ARRAY['Fish', 'Shellfish']::allergen_enum[],
          products_gluten_free = true,
          products_contain_sulfites = false,
          products_sustainable_explanation = 'All products are certified organic and GMO-free.',
          in_kind_donations = false,
          donate_wasted_food = 'Never',
          manufacturer_attribute = 'Non-GMO Project Verified',
          additional_comments = NULL,
          newsletter_subscription = false,
          status = 'pending',
          date_applied = NOW() - INTERVAL '2 weeks'
        WHERE food_manufacturer_name = 'Organic Suppliers LLC';
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

          DROP TYPE IF EXISTS "application_status_enum";
        `);
  }
}
