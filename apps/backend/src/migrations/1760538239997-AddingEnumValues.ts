import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddingEnumValues1760538239997 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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

      CREATE TYPE "donations_status_enum" AS ENUM (
        'available',
        'fulfilled',
        'matching'
      );

      CREATE TYPE "donation_frequency_enum" AS ENUM (
        'yearly',
        'biweekly',
        'monthly',
        'quarterly',
        'weekly'
      );

      CREATE TYPE "request_size_enum" AS ENUM (
        'Very Small (1-2 boxes)',
        'Small (2-5 boxes)',
        'Medium (5-10 boxes)',
        'Large (10+ boxes)'
      );

      CREATE TYPE "orders_status_enum" AS ENUM (
        'delivered',
        'pending',
        'shipped'
      );

      CREATE TYPE "refrigerated_donation_enum" AS ENUM (
        'Yes, always',
        'No',
        'Sometimes (check in before sending)'
      );

      CREATE TYPE "client_visit_frequency_enum" AS ENUM (
        'Daily',
        'More than once a week',
        'Once a week',
        'A few times a month',
        'Once a month'
      );

      CREATE TYPE "allergens_confidence_enum" AS ENUM (
        'Very confident',
        'Somewhat confident',
        'Not very confident (we need more education!)'
      );

      CREATE TYPE "serve_allergic_children_enum" AS ENUM (
        'Yes, many (> 10)',
        'Yes, a few (< 10)',
        'No'
      );

      CREATE TYPE "pantries_status_enum" AS ENUM (
        'approved',
        'denied',
        'pending'
      );

      CREATE TYPE "users_role_enum" AS ENUM (
        'admin',
        'lead_volunteer',
        'standard_volunteer',
        'pantry',
        'food_manufacturer'
      );

      CREATE TYPE "reserve_food_for_allergic_enum" as ENUM (
        'Yes',
        'Some',
        'No'
      );

      CREATE TYPE "activity_enum" AS ENUM (
        'Create labeled shelf',
        'Provide educational pamphlets',
        'Spreadsheet to track dietary needs',
        'Post allergen-free resource flyers',
        'Survey clients to determine medical dietary needs',
        'Collect feedback from allergen-avoidant clients',
        'Something else'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TYPE "pantries_status_enum";
      DROP TYPE "serve_allergic_children_enum";
      DROP TYPE "allergens_confidence_enum";
      DROP TYPE "client_visit_frequency_enum";
      DROP TYPE "refrigerated_donation_enum";
      DROP TYPE "orders_status_enum";
      DROP TYPE "request_size_enum";
      DROP TYPE "donation_frequency_enum";
      DROP TYPE "donations_status_enum";
      DROP TYPE "food_type_enum";
      DROP TYPE "users_role_enum";
      DROP TYPE "reserve_food_for_allergic_enum";
      DROP TYPE "activity_enum";
    `);
  }
}
