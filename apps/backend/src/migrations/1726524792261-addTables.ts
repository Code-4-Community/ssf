import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTables1726524792261 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS pantries (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address VARCHAR(255) NOT NULL,
                approved BOOLEAN NOT NULL,
                ssf_representative_id INT NOT NULL,
                pantry_representative_id INT NOT NULL,
                restrictions TEXT[] NOT NULL,

                CONSTRAINT fk_ssf_representative_id FOREIGN KEY(ssf_representative_id) REFERENCES users(id),
                CONSTRAINT fk_pantry_representative_id FOREIGN KEY(pantry_representative_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS donations (
                id SERIAL PRIMARY KEY,
                restrictions TEXT[] NOT NULL,
                due_date TIMESTAMP NOT NULL,
                pantry_id INT NOT NULL,
                status VARCHAR(50) NOT NULL,
                feedback TEXT,
                contents TEXT NOT NULL,

                CONSTRAINT fk_pantry_id FOREIGN KEY(pantry_id) REFERENCES pantries(id)
            );
            `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS pantries; DROP TABLE IF EXISTS donations;`,
    );
  }
}
