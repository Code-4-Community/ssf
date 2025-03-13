import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantriesTable1738172265266 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE pantries 
           DROP COLUMN approved,
           ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'pending';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE pantries 
           DROP COLUMN status,
           ADD COLUMN approved BOOLEAN NOT NULL DEFAULT FALSE,
           ALTER COLUMN approved 
           SET DATA TYPE BOOLEAN 
           USING (CASE 
                    WHEN status = 'approved' THEN TRUE 
                    WHEN status = 'denied' THEN FALSE
                    WHEN status = 'pending' THEN FALSE 
                    ELSE NULL 
                  END);`,
    );
  }
}
