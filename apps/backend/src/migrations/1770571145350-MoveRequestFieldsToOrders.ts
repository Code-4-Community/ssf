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

    await queryRunner.query(`
      INSERT INTO public.food_requests (
        pantry_id, requested_size, requested_items, additional_information,
        requested_at, status
      ) VALUES (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1),
        'Small (2-5 boxes)',
        ARRAY['Dairy-Free Alternatives', 'Gluten-Free Bread'],
        'Second order for active request test',
        '2024-02-05 10:00:00',
        'active'
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.orders (
        request_id, food_manufacturer_id, status, created_at, shipped_at, delivered_at
      ) VALUES
      (
        (SELECT request_id FROM public.food_requests WHERE additional_information = 'Second order for active request test' LIMIT 1),
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1),
        'shipped',
        '2024-02-05 11:00:00',
        '2024-02-06 08:00:00',
        NULL
      ),
      (
        (SELECT request_id FROM public.food_requests WHERE additional_information = 'Second order for active request test' LIMIT 1),
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
        'shipped',
        '2024-02-05 12:00:00',
        '2024-02-06 09:00:00',
        NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public.orders
      WHERE request_id = (
        SELECT request_id FROM public.food_requests
        WHERE additional_information = 'Second order for active request test' LIMIT 1
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.food_requests
      WHERE additional_information = 'Second order for active request test'
    `);

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
