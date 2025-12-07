import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePantryFields1763762628431 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pantries
                ADD COLUMN accept_food_deliveries boolean NOT NULL DEFAULT false,
                ADD COLUMN delivery_window_instructions text,
                ADD COLUMN mailing_address_line_1 varchar(255) NOT NULL DEFAULT 'A',
                ADD COLUMN mailing_address_line_2 varchar(255),
                ADD COLUMN mailing_address_city varchar(255) NOT NULL DEFAULT 'A',
                ADD COLUMN mailing_address_state varchar(255) NOT NULL DEFAULT 'A',
                ADD COLUMN mailing_address_zip varchar(255) NOT NULL DEFAULT 'A',
                ADD COLUMN mailing_address_country varchar(255),
                ALTER COLUMN newsletter_subscription DROP NOT NULL,
                ADD COLUMN has_email_contact BOOLEAN NOT NULL DEFAULT false,
                ADD COLUMN email_contact_other TEXT,
                ADD COLUMN secondary_contact_first_name VARCHAR(255),
                ADD COLUMN secondary_contact_last_name VARCHAR(255),
                ADD COLUMN secondary_contact_email VARCHAR(255),
                ADD COLUMN secondary_contact_phone VARCHAR(20);

            ALTER TABLE pantries
                RENAME COLUMN address_line_1 TO shipment_address_line_1;
            
            ALTER TABLE pantries
                RENAME COLUMN address_line_2 TO shipment_address_line_2;
            
            ALTER TABLE pantries
                RENAME COLUMN address_city TO shipment_address_city;

            ALTER TABLE pantries
                RENAME COLUMN address_state TO shipment_address_state;
            
            ALTER TABLE pantries
                RENAME COLUMN address_zip TO shipment_address_zip;

            ALTER TABLE pantries
                RENAME COLUMN address_country TO shipment_address_country;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "pantries" 
                DROP COLUMN IF EXISTS delivery_window_instructions,
                DROP COLUMN IF EXISTS accept_food_deliveries,
                DROP COLUMN IF EXISTS mailing_address_line_1,
                DROP COLUMN IF EXISTS mailing_address_line_2,
                DROP COLUMN IF EXISTS mailing_address_city,
                DROP COLUMN IF EXISTS mailing_address_state,
                DROP COLUMN IF EXISTS mailing_address_zip,
                DROP COLUMN IF EXISTS mailing_address_country,
                ALTER COLUMN newsletter_subscription SET NOT NULL,
                DROP COLUMN IF EXISTS has_email_contact,
                DROP COLUMN IF EXISTS email_contact_other,
                DROP COLUMN IF EXISTS secondary_contact_first_name,
                DROP COLUMN IF EXISTS secondary_contact_last_name,
                DROP COLUMN IF EXISTS secondary_contact_email,
                DROP COLUMN IF EXISTS secondary_contact_phone;

            ALTER TABLE pantries
                RENAME COLUMN shipment_address_line_1 TO address_line_1;
            
            ALTER TABLE pantries
                RENAME COLUMN shipment_address_line_2 TO address_line_2;

            ALTER TABLE pantries
                RENAME COLUMN shipment_address_city TO address_city;

            ALTER TABLE pantries
                RENAME COLUMN shipment_address_state TO address_state;

            ALTER TABLE pantries
                RENAME COLUMN shipment_address_zip TO address_zip;

            ALTER TABLE pantries
                RENAME COLUMN shipment_address_country TO address_country;
        `);
  }
}
