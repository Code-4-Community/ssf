import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColsToUseEnumType1760886499863
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            ALTER COLUMN food_type TYPE food_type_enum
            USING food_type::food_type_enum;
        `);

    await queryRunner.query(`
            ALTER TABLE donations
                ALTER COLUMN status DROP DEFAULT,
                ALTER COLUMN status TYPE donations_status_enum USING status::donations_status_enum,
                ALTER COLUMN status SET DEFAULT 'available';
        `);

    await queryRunner.query(`
            ALTER TABLE food_requests
            ALTER COLUMN requested_size TYPE request_size_enum
            USING requested_size::request_size_enum;
        `);

    await queryRunner.query(`
            ALTER TABLE orders
                ALTER COLUMN status DROP DEFAULT,
                ALTER COLUMN status TYPE orders_status_enum USING status::orders_status_enum,
                ALTER COLUMN status SET DEFAULT 'pending';
        `);

    await queryRunner.query(`
            ALTER TABLE pantries
                ALTER COLUMN refrigerated_donation TYPE refrigerated_donation_enum USING refrigerated_donation::refrigerated_donation_enum,
                ALTER COLUMN client_visit_frequency TYPE client_visit_frequency_enum USING client_visit_frequency::client_visit_frequency_enum,
                ALTER COLUMN identify_allergens_confidence TYPE allergens_confidence_enum USING identify_allergens_confidence::allergens_confidence_enum,
                ALTER COLUMN serve_allergic_children TYPE serve_allergic_children_enum USING serve_allergic_children::serve_allergic_children_enum,
                ALTER COLUMN reserve_food_for_allergic TYPE reserve_food_for_allergic_enum USING reserve_food_for_allergic::reserve_food_for_allergic_enum,
                ALTER COLUMN activities TYPE activity_enum[] USING activities::activity_enum[],
                ALTER COLUMN status DROP DEFAULT,
                ALTER COLUMN status TYPE pantries_status_enum USING status::pantries_status_enum,
                ALTER COLUMN status SET DEFAULT 'pending',
                ALTER COLUMN refrigerated_donation SET NOT NULL,
                ALTER COLUMN reserve_food_for_allergic SET NOT NULL,
                ALTER COLUMN activities SET NOT NULL;
        `);

    await queryRunner.query(`
            ALTER TABLE users
            ALTER COLUMN role TYPE users_role_enum
            USING role::users_role_enum;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE donation_items
            ALTER COLUMN food_type TYPE VARCHAR(255)
            USING food_type::text;
        `);

    await queryRunner.query(`
            ALTER TABLE donations
                ALTER COLUMN status DROP DEFAULT,
                ALTER COLUMN status TYPE VARCHAR(25) USING status::text,
                ALTER COLUMN status SET DEFAULT 'available';
        `);

    await queryRunner.query(`
            ALTER TABLE food_requests
            ALTER COLUMN requested_size TYPE VARCHAR(50)
            USING requested_size::text;
        `);

    await queryRunner.query(`
            ALTER TABLE orders
                ALTER COLUMN status DROP DEFAULT,
                ALTER COLUMN status TYPE VARCHAR(25) USING status::text,
                ALTER COLUMN status SET DEFAULT 'pending';
        `);

    await queryRunner.query(`
            ALTER TABLE pantries
                ALTER COLUMN refrigerated_donation TYPE VARCHAR(25) USING refrigerated_donation::text,
                ALTER COLUMN client_visit_frequency TYPE VARCHAR(25) USING client_visit_frequency::text,
                ALTER COLUMN identify_allergens_confidence TYPE VARCHAR(50) USING identify_allergens_confidence::text,
                ALTER COLUMN serve_allergic_children TYPE VARCHAR(25) USING serve_allergic_children::text,
                ALTER COLUMN reserve_food_for_allergic TYPE VARCHAR(25) USING reserve_food_for_allergic::text,
                ALTER COLUMN activities TYPE varchar(255)[] USING activities::varchar[],        
                ALTER COLUMN status DROP DEFAULT,
                ALTER COLUMN status TYPE VARCHAR(50) USING status::text,
                ALTER COLUMN status SET DEFAULT 'pending',
                ALTER COLUMN refrigerated_donation DROP NOT NULL,
                ALTER COLUMN reserve_food_for_allergic DROP NOT NULL,
                ALTER COLUMN activities DROP NOT NULL;
        `);

    await queryRunner.query(`
            ALTER TABLE users
            ALTER COLUMN role TYPE VARCHAR(255)
            USING role::text;
        `);
  }
}
