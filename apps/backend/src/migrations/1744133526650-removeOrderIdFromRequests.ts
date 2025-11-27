import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOrderIdFromRequests1744133526650
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE food_requests
                    DROP COLUMN order_id
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                ALTER TABLE food_requests
                  ADD COLUMN order_id INT
    `);

    await queryRunner.query(`
                ALTER TABLE food_requests
                  ADD CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders(order_id)
    `);
  }
}
