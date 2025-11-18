import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFoodRequests1744051370129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE food_requests
                DROP COLUMN status,
                DROP COLUMN fulfilled_by;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE food_requests
                ADD COLUMN status VARCHAR(25),
                ADD COLUMN fulfilled_by INT;
        `);
  }
}
