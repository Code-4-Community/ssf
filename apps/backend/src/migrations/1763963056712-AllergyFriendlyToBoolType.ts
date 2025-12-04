import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllergyFriendlyToBoolType1763963056712
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pantries 
            ALTER COLUMN dedicated_allergy_friendly TYPE BOOLEAN USING (FALSE),
            ALTER COLUMN dedicated_allergy_friendly SET NOT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pantries 
            ALTER COLUMN dedicated_allergy_friendly TYPE VARCHAR(255),
            ALTER COLUMN dedicated_allergy_friendly DROP NOT NULL;
        `);
  }
}
