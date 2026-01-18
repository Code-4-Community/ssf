import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnusedStatuses1764816885341 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE allocations DROP COLUMN IF EXISTS status;`
        );
        await queryRunner.query(
            `ALTER TABLE donation_items DROP COLUMN IF EXISTS status;`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE allocations
            ADD COLUMN status VARCHAR(25) NOT NULL DEFAULT 'pending';
        `);

        await queryRunner.query(`
            ALTER TABLE donation_items
            ADD COLUMN status VARCHAR(25) NOT NULL DEFAULT 'available';
        `);
    }
}
