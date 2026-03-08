import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssigneeToOrders1773009000618 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orders
      ADD COLUMN assignee_id INT,
      ADD CONSTRAINT fk_assignee_id
        FOREIGN KEY (assignee_id) REFERENCES users(user_id) ON DELETE SET NULL
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
