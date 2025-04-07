import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRequestTable1741571847063 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE food_requests
                    ADD COLUMN order_id INT
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE food_requests
                    DROP COLUMN order_id
            `);
  }
}
