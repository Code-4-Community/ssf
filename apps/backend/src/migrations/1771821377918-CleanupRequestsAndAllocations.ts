import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupRequestsAndAllocations1771821377918
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE food_requests
            RENAME COLUMN requested_items TO requested_food_types;

        ALTER TABLE food_requests
            ALTER COLUMN requested_food_types TYPE food_type_enum[]
            USING requested_food_types::food_type_enum[];

        ALTER TABLE allocations
            DROP COLUMN IF EXISTS reserved_at,
            DROP COLUMN IF EXISTS fulfilled_at;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE food_requests
            ALTER COLUMN requested_food_types TYPE TEXT[]
            USING requested_food_types::text[];

        ALTER TABLE food_requests
            RENAME COLUMN requested_food_types TO requested_items;

        ALTER TABLE allocations
            ADD COLUMN reserved_at TIMESTAMP NOT NULL DEFAULT NOW(),
            ADD COLUMN fulfilled_at TIMESTAMP;
    `);
  }
}
