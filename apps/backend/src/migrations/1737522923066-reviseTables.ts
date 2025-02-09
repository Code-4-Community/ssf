import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReviseTables1737522923066 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS donations;
       DROP TABLE IF EXISTS pantries;
       DROP TABLE IF EXISTS users;
      `,
    );
    await queryRunner.query(
      `-- Create users table
        CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          role TEXT[] NOT NULL
        );
  
        -- Create pantries table
        CREATE TABLE IF NOT EXISTS pantries (
          pantry_id SERIAL PRIMARY KEY,
          pantry_name VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          allergen_clients VARCHAR(25) NOT NULL,
          refrigerated_donation VARCHAR(25) NOT NULL,
          reserve_food_for_allergic BOOLEAN NOT NULL,
          reservation_explanation TEXT NOT NULL,
          dedicated_allergy_friendly VARCHAR(25) NOT NULL,
          client_visit_frequency VARCHAR(25) NOT NULL,
          identify_allergens_confidence VARCHAR(50) NOT NULL,
          serve_allergic_children VARCHAR(25) NOT NULL,
          newsletter_subscription BOOLEAN NOT NULL,
          approved BOOLEAN NOT NULL,
          restrictions TEXT[] NOT NULL,
          ssf_representative_id INT NOT NULL,
          pantry_representative_id INT NOT NULL,
          CONSTRAINT fk_ssf_representative_id FOREIGN KEY(ssf_representative_id) REFERENCES users(user_id),
          CONSTRAINT fk_pantry_representative_id FOREIGN KEY(pantry_representative_id) REFERENCES users(user_id)
        );

        -- Create food_manufacturers table
        CREATE TABLE IF NOT EXISTS food_manufacturers (
          food_manufacturer_id SERIAL PRIMARY KEY,
          food_manufacturer_name VARCHAR(255) NOT NULL,
          food_manufacturer_representative_id INT NOT NULL,
          CONSTRAINT fk_food_manufacturer_representative_id FOREIGN KEY(food_manufacturer_representative_id) REFERENCES users(user_id)
        );

        -- Create volunteer_assignments table
        CREATE TABLE IF NOT EXISTS volunteer_assignments (
          assignment_id SERIAL PRIMARY KEY,
          pantry_id INT NOT NULL,
          volunteer_id INT NOT NULL,
          CONSTRAINT fk_volunteer_id FOREIGN KEY(volunteer_id) REFERENCES users(user_id),
          CONSTRAINT fk_pantry_id FOREIGN KEY(pantry_id) REFERENCES pantries(pantry_id),
          CONSTRAINT unique_pantry_id UNIQUE (pantry_id)
        );
  
        -- Create food_requests table
        CREATE TABLE IF NOT EXISTS food_requests (
          request_id SERIAL PRIMARY KEY,
          pantry_id INT NOT NULL,
          requested_size VARCHAR(50) NOT NULL,
          requested_items TEXT[] NOT NULL,
          additional_information TEXT,
          requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
          status VARCHAR(25) NOT NULL DEFAULT 'pending',
          fulfilled_by INT,
          date_received TIMESTAMP,
          feedback TEXT,
          photos TEXT[],
          CONSTRAINT fk_pantry_id FOREIGN KEY(pantry_id) REFERENCES pantries(pantry_id),
          CONSTRAINT fk_fulfilled_by FOREIGN KEY(fulfilled_by) REFERENCES food_manufacturers(food_manufacturer_id)
        );
  
        -- Create donations table
        CREATE TABLE IF NOT EXISTS donations (
          donation_id SERIAL PRIMARY KEY,
          food_manufacturer_id INT NOT NULL,
          date_donated TIMESTAMP NOT NULL DEFAULT NOW(),
          status VARCHAR(25) NOT NULL DEFAULT 'available',
          CONSTRAINT fk_food_manufacturer_id FOREIGN KEY(food_manufacturer_id) REFERENCES food_manufacturers(food_manufacturer_id)
        );
  
        -- Create donation_items table
        CREATE TABLE IF NOT EXISTS donation_items (
          item_id SERIAL PRIMARY KEY,
          donation_id INT NOT NULL,
          item_name VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          reserved_quantity INT NOT NULL DEFAULT 0,
          status VARCHAR(25) NOT NULL DEFAULT 'available',
          CONSTRAINT fk_donation_id FOREIGN KEY(donation_id) REFERENCES donations(donation_id)
        );
  
        -- Create allocations table
        CREATE TABLE IF NOT EXISTS allocations (
          allocation_id SERIAL PRIMARY KEY,
          request_id INT NOT NULL,
          item_id INT NOT NULL,
          allocated_quantity INT NOT NULL,
          reserved_at TIMESTAMP NOT NULL DEFAULT NOW(),
          fulfilled_at TIMESTAMP,
          status VARCHAR(25) NOT NULL DEFAULT 'pending',
          CONSTRAINT fk_request_id FOREIGN KEY(request_id) REFERENCES food_requests(request_id),
          CONSTRAINT fk_item_id FOREIGN KEY(item_id) REFERENCES donation_items(item_id)
        );`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS volunteer_assignments;
      DROP TABLE IF EXISTS allocations;
      DROP TABLE IF EXISTS donation_items;
      DROP TABLE IF EXISTS donations;
      DROP TABLE IF EXISTS food_requests;
      DROP TABLE IF EXISTS pantries;
      DROP TABLE IF EXISTS food_manufacturers;
      DROP TABLE IF EXISTS users;
     `,
    );
  }
}
