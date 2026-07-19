import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeOrderAssigneeNullable1782700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE orders ALTER COLUMN assignee_id DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE orders ALTER COLUMN assignee_id SET NOT NULL`,
    );
  }
}
