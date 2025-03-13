import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFkAllocations1739497449049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
        `);
  }
}
