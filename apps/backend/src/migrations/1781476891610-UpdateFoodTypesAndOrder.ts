import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFoodRequestTypesAndOrder1781476891610
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE food_requests
        ADD COLUMN location text NOT NULL DEFAULT '',
        ADD COLUMN feedback_on_prior_donation text;
    `);

    await queryRunner.query(`
      ALTER TYPE "food_type_enum" RENAME TO "food_type_enum_old";
    `);

    await queryRunner.query(`
      CREATE TYPE "food_type_enum" AS ENUM (
        'Dairy-Free Alternatives',
        'Dried Beans',
        'Frozen Meals',
        'Gluten-Free Baking/Pancake Mixes',
        'Gluten-Free Bread',
        'Gluten-Free Pasta',
        'Gluten-Free Tortillas (Frozen)',
        'Granola',
        'Granola Bars',
        'Masa Harina Flour',
        'Non-GMO Cookies',
        'Olive Oil',
        'Quinoa',
        'Rice (Certified Gluten Free)',
        'Spreads/Seed Butters (Peanut Butter Alternative)',
        'Snacks',
        'Teff Flour'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE donation_items
        ALTER COLUMN food_type TYPE "food_type_enum"
        USING (
          CASE food_type::text
            WHEN 'Dried Beans (Gluten-Free, Nut-Free)' THEN 'Dried Beans'
            WHEN 'Gluten-Free Tortillas' THEN 'Gluten-Free Tortillas (Frozen)'
            WHEN 'Nut-Free Granola Bars' THEN 'Granola Bars'
            WHEN 'Seed Butters (Peanut Butter Alternative)' THEN 'Spreads/Seed Butters (Peanut Butter Alternative)'
            WHEN 'Refrigerated Meals' THEN 'Frozen Meals'
            WHEN 'Whole-Grain Cookies' THEN 'Non-GMO Cookies'
            WHEN 'Rice Noodles' THEN 'Gluten-Free Pasta'
            ELSE food_type::text
          END
        )::"food_type_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE food_requests
        ALTER COLUMN requested_food_types TYPE text[]
        USING requested_food_types::text[];
    `);

    await queryRunner.query(`
      UPDATE food_requests
      SET requested_food_types =
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(requested_food_types,
          'Dried Beans (Gluten-Free, Nut-Free)', 'Dried Beans'),
          'Gluten-Free Tortillas', 'Gluten-Free Tortillas (Frozen)'),
          'Nut-Free Granola Bars', 'Granola Bars'),
          'Seed Butters (Peanut Butter Alternative)', 'Spreads/Seed Butters (Peanut Butter Alternative)'),
          'Refrigerated Meals', 'Frozen Meals'),
          'Whole-Grain Cookies', 'Non-GMO Cookies'),
          'Rice Noodles', 'Gluten-Free Pasta');
    `);

    await queryRunner.query(`
      ALTER TABLE food_requests
        ALTER COLUMN requested_food_types TYPE "food_type_enum"[]
        USING requested_food_types::"food_type_enum"[];
    `);

    await queryRunner.query(`DROP TYPE "food_type_enum_old";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "food_type_enum" RENAME TO "food_type_enum_new";
    `);

    await queryRunner.query(`
      CREATE TYPE "food_type_enum" AS ENUM (
        'Dairy-Free Alternatives',
        'Dried Beans (Gluten-Free, Nut-Free)',
        'Gluten-Free Baking/Pancake Mixes',
        'Gluten-Free Bread',
        'Gluten-Free Tortillas',
        'Granola',
        'Masa Harina Flour',
        'Nut-Free Granola Bars',
        'Olive Oil',
        'Refrigerated Meals',
        'Rice Noodles',
        'Seed Butters (Peanut Butter Alternative)',
        'Whole-Grain Cookies',
        'Quinoa'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE donation_items
        ALTER COLUMN food_type TYPE "food_type_enum"
        USING (
          CASE food_type::text
            WHEN 'Dried Beans' THEN 'Dried Beans (Gluten-Free, Nut-Free)'
            WHEN 'Gluten-Free Tortillas (Frozen)' THEN 'Gluten-Free Tortillas'
            WHEN 'Granola Bars' THEN 'Nut-Free Granola Bars'
            WHEN 'Spreads/Seed Butters (Peanut Butter Alternative)' THEN 'Seed Butters (Peanut Butter Alternative)'
            WHEN 'Frozen Meals' THEN 'Refrigerated Meals'
            WHEN 'Non-GMO Cookies' THEN 'Whole-Grain Cookies'
            WHEN 'Gluten-Free Pasta' THEN 'Rice Noodles'
            WHEN 'Rice (Certified Gluten Free)' THEN 'Rice Noodles'
            WHEN 'Snacks' THEN 'Whole-Grain Cookies'
            WHEN 'Teff Flour' THEN 'Masa Harina Flour'
            ELSE food_type::text
          END
        )::"food_type_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE food_requests
        ALTER COLUMN requested_food_types TYPE text[]
        USING requested_food_types::text[];
    `);

    await queryRunner.query(`
      UPDATE food_requests
      SET requested_food_types =
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(
        array_replace(requested_food_types,
          'Dried Beans', 'Dried Beans (Gluten-Free, Nut-Free)'),
          'Gluten-Free Tortillas (Frozen)', 'Gluten-Free Tortillas'),
          'Granola Bars', 'Nut-Free Granola Bars'),
          'Spreads/Seed Butters (Peanut Butter Alternative)', 'Seed Butters (Peanut Butter Alternative)'),
          'Frozen Meals', 'Refrigerated Meals'),
          'Non-GMO Cookies', 'Whole-Grain Cookies'),
          'Gluten-Free Pasta', 'Rice Noodles'),
          'Rice (Certified Gluten Free)', 'Rice Noodles'),
          'Snacks', 'Whole-Grain Cookies'),
          'Teff Flour', 'Masa Harina Flour');
    `);

    await queryRunner.query(`
      ALTER TABLE food_requests
        ALTER COLUMN requested_food_types TYPE "food_type_enum"[]
        USING requested_food_types::"food_type_enum"[];
    `);

    await queryRunner.query(`DROP TYPE "food_type_enum_new";`);

    await queryRunner.query(`
      ALTER TABLE food_requests
        DROP COLUMN feedback_on_prior_donation,
        DROP COLUMN location;
    `);
  }
}
