import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveRequestFieldsToOrders1770571145350
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE food_requests_status_enum AS ENUM ('active', 'closed');
    `);

    await queryRunner.query(`
        ALTER TABLE food_requests
          ADD COLUMN status food_requests_status_enum NOT NULL DEFAULT 'active',
            DROP COLUMN date_received,
            DROP COLUMN feedback,
            DROP COLUMN photos;
    `);

    await queryRunner.query(`
        ALTER TABLE orders
          ADD COLUMN date_received TIMESTAMP,
          ADD COLUMN feedback TEXT,
          ADD COLUMN photos TEXT[];
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE orders
            DROP COLUMN photos,
            DROP COLUMN feedback,
            DROP COLUMN date_received;
    `);

    await queryRunner.query(`
        ALTER TABLE food_requests
        ADD COLUMN date_received TIMESTAMP,
        ADD COLUMN feedback TEXT,
        ADD COLUMN photos TEXT[],
            DROP COLUMN status;
    `);

    await queryRunner.query(`
        DROP TYPE food_requests_status_enum;
    `);
  }
}
