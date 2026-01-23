import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserPoolId1769189327767 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users 
             ADD COLUMN IF NOT EXISTS user_cognito_sub VARCHAR(255) NOT NULL DEFAULT '';`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE users DROP COLUMN IF EXISTS user_cognito_sub;`
        );
    }

}
