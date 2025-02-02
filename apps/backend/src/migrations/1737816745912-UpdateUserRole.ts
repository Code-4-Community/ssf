import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRole1737816745912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN role`);
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN role VARCHAR(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN role`);
    await queryRunner.query(
      `ALTER TABLE users ADD COLUMN role TEXT[] NOT NULL`,
    );
  }
}
