import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDummyData1764723723063 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const existingUsers = await queryRunner.query(
      `SELECT COUNT(*) as count FROM public.users WHERE email IN ('john.smith@ssf.org', 'sarah.j@ssf.org')`,
    );

    if (existingUsers[0].count > 0) {
      console.log('Dummy data already exists, skipping migration');
      return;
    }

    await queryRunner.query(`
      INSERT INTO public.users (first_name, last_name, email, phone, role) VALUES
      ('John', 'Smith', 'john.smith@ssf.org', '555-010-0101', 'admin'),
      ('Sarah', 'Johnson', 'sarah.j@ssf.org', '555-010-0102', 'admin'),
      ('Mike', 'Brown', 'mike.brown@pantry1.org', '555-020-0201', 'pantry'),
      ('Emily', 'Davis', 'emily.davis@pantry2.org', '555-020-0202', 'pantry'),
      ('Robert', 'Wilson', 'robert.w@pantry3.org', '555-020-0203', 'pantry'),
      ('Lisa', 'Martinez', 'lisa.m@foodcorp.com', '555-030-0301', 'food_manufacturer'),
      ('David', 'Anderson', 'david.a@healthyfoods.com', '555-030-0302', 'food_manufacturer'),
      ('Jennifer', 'Taylor', 'jennifer.t@organic.com', '555-030-0303', 'food_manufacturer'),
      ('James', 'Thomas', 'james.t@volunteer.org', '555-040-0401', 'volunteer'),
      ('Maria', 'Garcia', 'maria.g@volunteer.org', '555-040-0402', 'volunteer'),
      ('William', 'Moore', 'william.m@volunteer.org', '555-040-0403', 'volunteer'),
      ('Patricia', 'Jackson', 'patricia.j@volunteer.org', '555-040-0404', 'volunteer')
    `);

    await queryRunner.query(`
      INSERT INTO public.food_manufacturers (food_manufacturer_name, food_manufacturer_representative_id) VALUES
      ('FoodCorp Industries', (SELECT user_id FROM public.users WHERE email = 'lisa.m@foodcorp.com' LIMIT 1)),
      ('Healthy Foods Co', (SELECT user_id FROM public.users WHERE email = 'david.a@healthyfoods.com' LIMIT 1)),
      ('Organic Suppliers LLC', (SELECT user_id FROM public.users WHERE email = 'jennifer.t@organic.com' LIMIT 1))
    `);

    await queryRunner.query(`
      INSERT INTO public.users (first_name, last_name, email, phone, role) VALUES
      ('Pantry1', 'User', 'pantry1@ssf.org', '555-100-1001', 'pantry'),
      ('Pantry2', 'User', 'pantry2@ssf.org', '555-100-1002', 'pantry'),
      ('Pantry3', 'User', 'pantry3@ssf.org', '555-100-1003', 'pantry'),
      ('Pantry4', 'User', 'pantry4@ssf.org', '555-100-1004', 'pantry'),
      ('Pantry5', 'User', 'pantry5@ssf.org', '555-100-1005', 'pantry'),
      ('Pantry6', 'User', 'pantry6@ssf.org', '555-100-1006', 'pantry')
    `);

    await queryRunner.query(`
      INSERT INTO public.pantries (
        pantry_name, shipment_address_line_1, shipment_address_city, shipment_address_state, shipment_address_zip,
        allergen_clients, refrigerated_donation, reserve_food_for_allergic, 
        reservation_explanation, dedicated_allergy_friendly,
        client_visit_frequency, identify_allergens_confidence, serve_allergic_children,
        newsletter_subscription, restrictions, pantry_user_id,
        activities, items_in_stock, need_more_options, status, date_applied, activities_comments, shipment_address_line_2,
        shipment_address_country, delivery_window_instructions, mailing_address_line_1, mailing_address_city, mailing_address_state, mailing_address_zip,
        mailing_address_country, has_email_contact, email_contact_other, secondary_contact_first_name, secondary_contact_last_name, secondary_contact_email,
        secondary_contact_phone
      ) VALUES
      (
        'Community Food Pantry Downtown',
        '123 Main St',
        'Springfield',
        'IL',
        '62701',
        '< 10',
        'Yes, always',
        'Yes',
        'We have several clients with severe nut allergies and need to keep separate storage',
        true,
        'Once a week',
        'Very confident',
        'Yes, a few (< 10)',
        true,
        ARRAY['Peanut allergy', 'Tree nut allergy', 'Shellfish allergy'],
        (SELECT user_id FROM public.users WHERE email = 'pantry1@ssf.org' LIMIT 1),
        ARRAY['Create labeled shelf', 'Provide educational pamphlets', 'Survey clients to determine medical dietary needs']::"activity_enum"[],
        'Canned goods, pasta, rice, cereal',
        'More fresh produce and dairy alternatives',
        'approved',
        NOW(),
        NULL,
        NULL,
        'US',
        NULL,
        '814 Cedar Hollow Way',
        'Madison',
        'WI',
        '53711',
        'US',
        false,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
      ),
      (
        'Westside Community Kitchen',
        '456 Oak Ave',
        'Springfield',
        'IL',
        '62702',
        '20 to 50',
        'No',
        'No',
        'Limited space for separate storage',
        false,
        'Once a month',
        'Somewhat confident',
        'No',
        true,
        ARRAY['Celiac disease', 'Gluten sensitivity (not celiac disease)'],
        (SELECT user_id FROM public.users WHERE email = 'pantry2@ssf.org' LIMIT 1),
        ARRAY['Spreadsheet to track dietary needs', 'Post allergen-free resource flyers']::"activity_enum"[],
        'Bread, canned vegetables, soup',
        'Gluten-free options',
        'approved',
        NOW(),
        NULL,
        NULL,
        'US',
        NULL,
        '29 Seaview Terrace',
        'Cape May',
        'NJ',
        '08204',
        'US',
        false,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
      ),
      (
        'North End Food Bank',
        '789 Pine Rd',
        'Springfield',
        'IL',
        '62703',
        '50 to 100',
        'Yes, always',
        'Yes',
        'Expanding allergen-friendly program',
        true,
        'A few times a month',
        'Somewhat confident',
        'Yes, many (> 10)',
        false,
        ARRAY['Milk allergy', 'Egg allergy', 'Lactose intolerance/dairy sensitivity'],
        (SELECT user_id FROM public.users WHERE email = 'pantry3@ssf.org' LIMIT 1),
        ARRAY['Create labeled shelf', 'Collect feedback from allergen-avoidant clients']::"activity_enum"[],
        'Proteins, grains, canned fruits',
        'Dairy-free and egg-free alternatives',
        'approved',
        NOW(),
        NULL,
        '2308 Desert Willow Court',
        'US',
        NULL,
        '3675 Ironwood Loop',
        'Flagstaff',
        'AZ', 
        '86001',
        'US',
        true,
        'NorthEnd@gmail.com',
        NULL,
        NULL,
        NULL,
        NULL
      ),
      (
        'Riverside Food Assistance',
        '234 River Rd',
        'Springfield',
        'IL',
        '62704',
        '42',
        'No',
        'No',
        'We do not have experience with allergen management',
        false,
        'Once a month',
        'Not very confident (we need more education!)',
        'No',
        false,
        ARRAY['Unsure'],
        (SELECT user_id FROM public.users WHERE email = 'pantry4@ssf.org' LIMIT 1),
        ARRAY['Something else']::"activity_enum"[],
        'Basic non-perishables',
        'Training on allergen management',
        'denied',
        NOW() - INTERVAL '7 days',
        NULL,
        '1569 Brookstone Avenue',
        'US',
        'Handle with care',
        '1024 Willow Bend Drive',
        'Plano',
        'TX',
        '75075',
        'US',
        true,
        'Riverside@gmail.com',
        'Joe',
        'Smith',
        'j@gmail.com',
        '2013334958'
      ),
      (
        'Harbor Community Center',
        '567 Harbor Way',
        'Springfield',
        'IL',
        '62705',
        '67',
        'Sometimes (check in before sending)',
        'Some',
        'Starting to develop allergen-friendly program',
        false,
        'Daily',
        'Somewhat confident',
        'Yes, a few (< 10)',
        true,
        ARRAY['Fish allergy', 'Soy allergy', 'Sesame allergy'],
        (SELECT user_id FROM public.users WHERE email = 'pantry5@ssf.org' LIMIT 1),
        ARRAY['Create labeled shelf', 'Post allergen-free resource flyers']::"activity_enum"[],
        'Mixed inventory, some allergen-free items',
        'More allergen-free protein options',
        'pending',
        NOW() - INTERVAL '2 days',
        NULL,
        '77 Silver Pine Road',
        'US',
        'Handle with care',
        '58 Granite Peak Road',
        'Bozeman',
        'MT',
        '59715',
        'US',
        false,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
      ),
      (
        'Southside Pantry Network',
        '890 South Ave',
        'Springfield',
        'IL',
        '62706',
        'I''m not sure',
        'Yes, always',
        'Yes',
        'Ready to expand allergen program with proper support',
        true,
        'More than once a week',
        'Very confident',
        'Yes, many (> 10)',
        true,
        ARRAY['Other allergy (e.g., yeast, sunflower, etc.)', 'Gastrointestinal illness (IBS, Crohn''s, gastroparesis, etc.)'],
        (SELECT user_id FROM public.users WHERE email = 'pantry6@ssf.org' LIMIT 1),
        ARRAY['Survey clients to determine medical dietary needs', 'Collect feedback from allergen-avoidant clients', 'Provide educational pamphlets']::"activity_enum"[],
        'Wide variety including allergen-free sections',
        'Specialty items for complex dietary needs',
        'pending',
        NOW() - INTERVAL '1 day',
        'Create a food goal tracking schedule',
        '4021 Sunset Plaza Blvd',
        'US',
        'Handle with care',
        '4419 Magnolia Court',
        'Savannah',
        'GA',
        '31405',
        'US',
        false,
        NULL,
        'Dave',
        'Jones',
        'Dave@gmail.com',
        '2013334029'
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.donations (
        food_manufacturer_id, date_donated, status, total_items, total_oz, total_estimated_value
      ) VALUES
      (
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
        '2024-01-15 10:30:00',
        'available',
        150,
        2400.50,
        850.00
      ),
      (
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1),
        '2024-01-20 14:00:00',
        'matching',
        200,
        3200.00,
        1200.00
      ),
      (
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Organic Suppliers LLC' LIMIT 1),
        '2024-01-25 09:15:00',
        'available',
        100,
        1600.75,
        950.00
      ),
      (
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
        '2024-02-01 11:00:00',
        'fulfilled',
        75,
        1200.00,
        450.00
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.donation_items (
        donation_id, item_name, quantity, reserved_quantity,
        oz_per_item, estimated_value, food_type
      ) VALUES
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 150 
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Peanut Butter (16oz)',
        50,
        10,
        16.00,
        4.50,
        'Seed Butters (Peanut Butter Alternative)'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 150 
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Whole Wheat Bread',
        50,
        0,
        24.00,
        3.00,
        'Gluten-Free Bread'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 150 
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Canned Green Beans',
        50,
        5,
        8.01,
        2.00,
        'Refrigerated Meals'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 200
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Gluten-Free Pasta',
        75,
        30,
        16.00,
        5.00,
        'Gluten-Free Bread'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 200
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Almond Milk',
        75,
        20,
        32.00,
        4.50,
        'Dairy-Free Alternatives'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 200
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Organic Apples',
        50,
        0,
        5.00,
        3.50,
        'Dried Beans (Gluten-Free, Nut-Free)'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 100
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Organic Suppliers LLC' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Rice (5lb bag)',
        40,
        0,
        80.00,
        12.00,
        'Gluten-Free Bread'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 100
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Organic Suppliers LLC' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Canned Tomatoes',
        60,
        0,
        10.75,
        2.50,
        'Refrigerated Meals'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 75
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Cereal Boxes',
        75,
        75,
        16.00,
        6.00,
        'Gluten-Free Bread'
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.food_requests (
        pantry_id, requested_size, requested_items, additional_information,
        requested_at, date_received, feedback, photos
      ) VALUES
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1),
        'Large (10+ boxes)',
        ARRAY['Seed Butters (Peanut Butter Alternative)', 'Gluten-Free Bread', 'Dried Beans (Gluten-Free, Nut-Free)', 'Dairy-Free Alternatives'],
        'We have 150 families to serve this week. Need extra allergen-free options.',
        '2024-01-16 08:00:00',
        '2024-01-18 14:30:00',
        'Great selection, especially appreciated the allergen-free items',
        ARRAY['delivery1.jpg', 'storage1.jpg']
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1),
        'Medium (5-10 boxes)',
        ARRAY['Gluten-Free Baking/Pancake Mixes', 'Rice Noodles', 'Gluten-Free Tortillas'],
        'Preparing meals for 75 clients this month',
        '2024-01-21 09:30:00',
        '2024-01-23 10:00:00',
        'Good variety, could use more gluten-free options',
        ARRAY['kitchen1.jpg']
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'North End Food Bank' LIMIT 1),
        'Small (2-5 boxes)',
        ARRAY['Quinoa', 'Masa Harina Flour', 'Granola'],
        'Regular monthly order',
        '2024-02-02 10:00:00',
        NULL,
        NULL,
        NULL
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1),
        'Medium (5-10 boxes)',
        ARRAY['Whole-Grain Cookies', 'Dairy-Free Alternatives', 'Nut-Free Granola Bars'],
        'Running low on breakfast items',
        '2024-02-03 11:00:00',
        NULL,
        NULL,
        NULL
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.orders (
        request_id, pantry_id, shipped_by, status, created_at,
        shipped_at, delivered_at
      ) VALUES
      (
        (SELECT request_id FROM public.food_requests 
         WHERE additional_information LIKE '%150 families%'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1)
         ORDER BY request_id DESC LIMIT 1),
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1),
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
        'delivered',
        '2024-01-16 09:00:00',
        '2024-01-17 08:00:00',
        '2024-01-18 14:30:00'
      ),
      (
        (SELECT request_id FROM public.food_requests 
         WHERE additional_information LIKE '%75 clients%'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1)
         ORDER BY request_id DESC LIMIT 1),
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1),
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1),
        'delivered',
        '2024-01-21 10:00:00',
        '2024-01-22 09:00:00',
        '2024-01-23 10:00:00'
      ),
      (
        (SELECT request_id FROM public.food_requests 
         WHERE additional_information = 'Regular monthly order'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'North End Food Bank' LIMIT 1)
         ORDER BY request_id DESC LIMIT 1),
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'North End Food Bank' LIMIT 1),
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Organic Suppliers LLC' LIMIT 1),
        'shipped',
        '2024-02-02 11:00:00',
        '2024-02-03 08:00:00',
        NULL
      ),
      (
        (SELECT request_id FROM public.food_requests 
         WHERE additional_information LIKE '%breakfast items%'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1)
         ORDER BY request_id DESC LIMIT 1),
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1),
        (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1),
        'pending',
        '2024-02-03 12:00:00',
        NULL,
        NULL
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.allocations (
        order_id, item_id, allocated_quantity, reserved_at, fulfilled_at
      ) VALUES

      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'delivered' 
         AND shipped_at = '2024-01-17 08:00:00'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Peanut Butter (16oz)' ORDER BY item_id DESC LIMIT 1),
        10,
        '2024-01-16 09:00:00',
        '2024-01-18 14:30:00'
      ),
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'delivered' 
         AND shipped_at = '2024-01-17 08:00:00'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Canned Green Beans' ORDER BY item_id DESC LIMIT 1),
        5,
        '2024-01-16 09:00:00',
        '2024-01-18 14:30:00'
      ),
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'delivered' 
         AND shipped_at = '2024-01-17 08:00:00'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Whole Wheat Bread' ORDER BY item_id DESC LIMIT 1),
        25,
        '2024-01-16 09:00:00',
        '2024-01-18 14:30:00'
      ),
      
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'delivered' 
         AND shipped_at = '2024-01-22 09:00:00'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Gluten-Free Pasta' ORDER BY item_id DESC LIMIT 1),
        30,
        '2024-01-21 10:00:00',
        '2024-01-23 10:00:00'
      ),
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'delivered' 
         AND shipped_at = '2024-01-22 09:00:00'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Almond Milk' ORDER BY item_id DESC LIMIT 1),
        20,
        '2024-01-21 10:00:00',
        '2024-01-23 10:00:00'
      ),
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'delivered' 
         AND shipped_at = '2024-01-22 09:00:00'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Organic Apples' ORDER BY item_id DESC LIMIT 1),
        15,
        '2024-01-21 10:00:00',
        '2024-01-23 10:00:00'
      ),
      
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'shipped'
         AND shipped_at = '2024-02-03 08:00:00'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'North End Food Bank' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Rice (5lb bag)' ORDER BY item_id DESC LIMIT 1),
        10,
        '2024-02-02 11:00:00',
        NULL
      ),
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'shipped'
         AND shipped_at = '2024-02-03 08:00:00'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'North End Food Bank' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Canned Tomatoes' ORDER BY item_id DESC LIMIT 1),
        20,
        '2024-02-02 11:00:00',
        NULL
      ),
      
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'pending'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1)
         AND created_at = '2024-02-03 12:00:00'
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Cereal Boxes' ORDER BY item_id DESC LIMIT 1),
        75,
        '2024-02-03 12:00:00',
        NULL
      ),
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'pending'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1)
         AND created_at = '2024-02-03 12:00:00'
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Almond Milk' ORDER BY item_id DESC LIMIT 1),
        10,
        '2024-02-03 12:00:00',
        NULL
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.volunteer_assignments (pantry_id, volunteer_id) VALUES
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1),
        (SELECT user_id FROM public.users WHERE email = 'james.t@volunteer.org' LIMIT 1)
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1),
        (SELECT user_id FROM public.users WHERE email = 'patricia.j@volunteer.org' LIMIT 1)
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1),
        (SELECT user_id FROM public.users WHERE email = 'maria.g@volunteer.org' LIMIT 1)
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'North End Food Bank' LIMIT 1),
        (SELECT user_id FROM public.users WHERE email = 'william.m@volunteer.org' LIMIT 1)
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'North End Food Bank' LIMIT 1),
        (SELECT user_id FROM public.users WHERE email = 'maria.g@volunteer.org' LIMIT 1)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM public.allocations 
      WHERE order_id IN (
        SELECT order_id FROM public.orders 
        WHERE pantry_id IN (
          SELECT pantry_id FROM public.pantries 
          WHERE pantry_name IN (
            'Community Food Pantry Downtown',
            'Westside Community Kitchen',
            'North End Food Bank'
          )
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.volunteer_assignments 
      WHERE volunteer_id IN (
        SELECT user_id FROM public.users 
        WHERE email IN (
          'james.t@volunteer.org', 'maria.g@volunteer.org', 
          'william.m@volunteer.org', 'patricia.j@volunteer.org'
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.orders 
      WHERE pantry_id IN (
        SELECT pantry_id FROM public.pantries 
        WHERE pantry_name IN (
          'Community Food Pantry Downtown',
          'Westside Community Kitchen',
          'North End Food Bank'
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.food_requests 
      WHERE pantry_id IN (
        SELECT pantry_id FROM public.pantries 
        WHERE pantry_name IN (
          'Community Food Pantry Downtown',
          'Westside Community Kitchen',
          'North End Food Bank'
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.donation_items 
      WHERE donation_id IN (
        SELECT donation_id FROM public.donations 
        WHERE food_manufacturer_id IN (
          SELECT food_manufacturer_id FROM public.food_manufacturers 
          WHERE food_manufacturer_name IN (
            'FoodCorp Industries',
            'Healthy Foods Co',
            'Organic Suppliers LLC'
          )
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.donations 
      WHERE food_manufacturer_id IN (
        SELECT food_manufacturer_id FROM public.food_manufacturers 
        WHERE food_manufacturer_name IN (
          'FoodCorp Industries',
          'Healthy Foods Co',
          'Organic Suppliers LLC'
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.pantries 
      WHERE pantry_name IN (
        'Community Food Pantry Downtown',
        'Westside Community Kitchen',
        'North End Food Bank',
        'Riverside Food Assistance',
        'Harbor Community Center',
        'Southside Pantry Network'
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.food_manufacturers 
      WHERE food_manufacturer_name IN (
        'FoodCorp Industries',
        'Healthy Foods Co',
        'Organic Suppliers LLC'
      )
    `);

    await queryRunner.query(`
      DELETE FROM public.users 
      WHERE email IN (
        'john.smith@ssf.org', 'sarah.j@ssf.org', 'mike.brown@pantry1.org',
        'emily.davis@pantry2.org', 'robert.w@pantry3.org', 'lisa.m@foodcorp.com',
        'david.a@healthyfoods.com', 'jennifer.t@organic.com', 'james.t@volunteer.org',
        'maria.g@volunteer.org', 'william.m@volunteer.org', 'patricia.j@volunteer.org',
        'pantry1@ssf.org', 'pantry2@ssf.org', 'pantry3@ssf.org',
        'pantry4@ssf.org', 'pantry5@ssf.org', 'pantry6@ssf.org'
      )
    `);
  }
}
