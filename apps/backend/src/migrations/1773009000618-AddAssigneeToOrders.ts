import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssigneeToOrders1773009000618 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE orders ADD COLUMN assignee_id INT`);

    await queryRunner.query(`
      UPDATE orders o SET assignee_id = (
        SELECT va.volunteer_id FROM volunteer_assignments va
        JOIN food_requests fr ON fr.pantry_id = va.pantry_id
        WHERE fr.request_id = o.request_id
        LIMIT 1
      )
    `);

    await queryRunner.query(`
      ALTER TABLE orders
        ALTER COLUMN assignee_id SET NOT NULL,
        ADD CONSTRAINT fk_assignee_id FOREIGN KEY (assignee_id) REFERENCES users(user_id) ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
        DROP CONSTRAINT IF EXISTS fk_assignee_id,
        DROP COLUMN assignee_id
    `);
  }
}
