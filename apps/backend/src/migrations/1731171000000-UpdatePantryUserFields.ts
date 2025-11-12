import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantryUserFields1731171000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE pantries DROP COLUMN IF EXISTS ssf_representative_id;
       ALTER TABLE pantries RENAME COLUMN pantry_representative_id TO pantry_user_id;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE pantries RENAME COLUMN pantry_user_id TO pantry_representative_id;
       ALTER TABLE pantries ADD COLUMN ssf_representative_id INT REFERENCES users(user_id);`,
    );
  }
}
