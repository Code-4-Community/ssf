import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderStatusClosed1780562894014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ALTER COLUMN status DROP DEFAULT;

      CREATE TYPE orders_status_enum_new AS ENUM (
        'delivered',
        'pending',
        'shipped',
        'closed'
      );

      ALTER TABLE orders
        ALTER COLUMN status
        TYPE orders_status_enum_new
        USING status::text::orders_status_enum_new;

      DROP TYPE orders_status_enum;

      ALTER TYPE orders_status_enum_new
        RENAME TO orders_status_enum;

      ALTER TABLE orders
        ALTER COLUMN status
        SET DEFAULT 'pending';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        ALTER COLUMN status DROP DEFAULT;

      CREATE TYPE orders_status_enum_old AS ENUM (
        'delivered',
        'pending',
        'shipped'
      );

      ALTER TABLE orders
        ALTER COLUMN status
        TYPE orders_status_enum_old
        USING (
          CASE
            WHEN status = 'closed'
              THEN 'pending'
            ELSE status::text
          END
        )::orders_status_enum_old;

      DROP TYPE orders_status_enum;

      ALTER TYPE orders_status_enum_old
        RENAME TO orders_status_enum;

      ALTER TABLE orders
        ALTER COLUMN status
        SET DEFAULT 'pending';
    `);
  }
}
