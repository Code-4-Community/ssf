import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantryFMApplicationInfo1780913024514
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // The "dedicated allergy friendly" question is no longer a yes/no boolean;
    // it now captures whether a pantry can accommodate allergen-friendly items.
    await queryRunner.query(`
      CREATE TYPE "dedicated_allergy_friendly_enum" AS ENUM (
        'Yes',
        'No but we can accommodate this',
        'No, and we cannot accommodate this'
      );
    `);

    // These columns are now required. Backfill any pre-existing NULL rows so
    // the SET NOT NULL constraints below succeed.
    await queryRunner.query(`
      UPDATE pantries
      SET delivery_window_instructions = ''
      WHERE delivery_window_instructions IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE pantries
        ADD COLUMN languages text[] NOT NULL DEFAULT '{}',
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
        DROP COLUMN identify_allergens_confidence,
        DROP COLUMN newsletter_subscription;
    `);

    // The languages column has no default in the entity; the default above was
    // only needed to backfill existing rows during the ADD COLUMN.
    await queryRunner.query(`
      ALTER TABLE pantries
        ALTER COLUMN languages DROP DEFAULT;
    `);

    await queryRunner.query(`DROP TYPE "allergens_confidence_enum";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
        ALTER COLUMN dedicated_allergy_friendly TYPE boolean
          USING (dedicated_allergy_friendly = 'Yes'),
        DROP COLUMN languages;
    `);

    await queryRunner.query(`DROP TYPE "dedicated_allergy_friendly_enum";`);
  }
}
