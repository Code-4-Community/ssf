import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1725726359198 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                status VARCHAR(20),
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                email VARCHAR(255)
            )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
