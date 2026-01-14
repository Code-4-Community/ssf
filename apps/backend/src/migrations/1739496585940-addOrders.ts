import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrders1739496585940 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS orders ( 
                order_id SERIAL PRIMARY KEY, 
                request_id INT NOT NULL, 
                pantry_id INT NOT NULL, 
                shipped_by INT NOT NULL, 
                status VARCHAR(25) NOT NULL DEFAULT 'pending', 
                created_at TIMESTAMP NOT NULL DEFAULT NOW(), 
                shipped_at TIMESTAMP, 
                delivered_at TIMESTAMP, 
                CONSTRAINT fk_request FOREIGN KEY(request_id) REFERENCES food_requests(request_id), 
                CONSTRAINT fk_pantry FOREIGN KEY(pantry_id) REFERENCES pantries(pantry_id), 
                CONSTRAINT fk_shipped_by FOREIGN KEY(shipped_by) REFERENCES food_manufacturers(food_manufacturer_id) 
            );

            ALTER TABLE allocations 
            DROP CONSTRAINT IF EXISTS fk_request_id;

            ALTER TABLE allocations 
            RENAME COLUMN request_id TO order_id;

            ALTER TABLE allocations 
            ADD CONSTRAINT fk_order_id 
            FOREIGN KEY (order_id) REFERENCES orders(order_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE allocations 
      DROP CONSTRAINT IF EXISTS fk_order_id;

      ALTER TABLE allocations 
      RENAME COLUMN order_id TO request_id;
      
      ALTER TABLE allocations 
      ADD CONSTRAINT fk_request_id 
      FOREIGN KEY (request_id) REFERENCES food_requests(request_id);

      DROP TABLE IF EXISTS orders;
    `);
  }
}
