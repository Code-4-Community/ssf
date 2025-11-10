import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDummyData1759636753110 implements MigrationInterface {
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
      ('John', 'Smith', 'john.smith@ssf.org', '555-0101', 'SSF_REPRESENTATIVE'),
      ('Sarah', 'Johnson', 'sarah.j@ssf.org', '555-0102', 'SSF_REPRESENTATIVE'),
      ('Mike', 'Brown', 'mike.brown@pantry1.org', '555-0201', 'PANTRY_REPRESENTATIVE'),
      ('Emily', 'Davis', 'emily.davis@pantry2.org', '555-0202', 'PANTRY_REPRESENTATIVE'),
      ('Robert', 'Wilson', 'robert.w@pantry3.org', '555-0203', 'PANTRY_REPRESENTATIVE'),
      ('Lisa', 'Martinez', 'lisa.m@foodcorp.com', '555-0301', 'MANUFACTURER_REPRESENTATIVE'),
      ('David', 'Anderson', 'david.a@healthyfoods.com', '555-0302', 'MANUFACTURER_REPRESENTATIVE'),
      ('Jennifer', 'Taylor', 'jennifer.t@organic.com', '555-0303', 'MANUFACTURER_REPRESENTATIVE'),
      ('James', 'Thomas', 'james.t@volunteer.org', '555-0401', 'VOLUNTEER'),
      ('Maria', 'Garcia', 'maria.g@volunteer.org', '555-0402', 'VOLUNTEER'),
      ('William', 'Moore', 'william.m@volunteer.org', '555-0403', 'VOLUNTEER'),
      ('Patricia', 'Jackson', 'patricia.j@volunteer.org', '555-0404', 'VOLUNTEER')
    `);

    await queryRunner.query(`
      INSERT INTO public.food_manufacturers (food_manufacturer_name, food_manufacturer_representative_id) VALUES
      ('FoodCorp Industries', (SELECT user_id FROM public.users WHERE email = 'lisa.m@foodcorp.com' LIMIT 1)),
      ('Healthy Foods Co', (SELECT user_id FROM public.users WHERE email = 'david.a@healthyfoods.com' LIMIT 1)),
      ('Organic Suppliers LLC', (SELECT user_id FROM public.users WHERE email = 'jennifer.t@organic.com' LIMIT 1))
    `);

    await queryRunner.query(`
      INSERT INTO public.pantries (
        pantry_name, address, allergen_clients, refrigerated_donation,
        reserve_food_for_allergic, reservation_explanation, dedicated_allergy_friendly,
        client_visit_frequency, identify_allergens_confidence, serve_allergic_children,
        newsletter_subscription, restrictions, ssf_representative_id, pantry_representative_id,
        activities, questions, items_in_stock, need_more_options, status
      ) VALUES
      (
        'Community Food Pantry Downtown',
        '123 Main St, Springfield, IL 62701',
        'yes',
        'yes',
        true,
        'We have several clients with severe nut allergies and need to keep separate storage',
        'Dedicated shelf for allergen-free items',
        'weekly',
        'very_confident',
        'yes',
        true,
        ARRAY['peanuts', 'tree_nuts', 'shellfish'],
        (SELECT user_id FROM public.users WHERE email = 'john.smith@ssf.org' LIMIT 1),
        (SELECT user_id FROM public.users WHERE email = 'mike.brown@pantry1.org' LIMIT 1),
        'Food distribution, nutrition education, cooking classes',
        'How can we better serve clients with multiple allergies?',
        'Canned goods, pasta, rice, cereal',
        'More fresh produce and dairy alternatives',
        'active'
      ),
      (
        'Westside Community Kitchen',
        '456 Oak Ave, Springfield, IL 62702',
        'some',
        'no',
        false,
        'Limited space for separate storage',
        'None currently',
        'monthly',
        'somewhat_confident',
        'no',
        true,
        ARRAY['gluten'],
        (SELECT user_id FROM public.users WHERE email = 'sarah.j@ssf.org' LIMIT 1),
        (SELECT user_id FROM public.users WHERE email = 'emily.davis@pantry2.org' LIMIT 1),
        'Weekly meal service, food boxes',
        NULL,
        'Bread, canned vegetables, soup',
        'Gluten-free options',
        'active'
      ),
      (
        'North End Food Bank',
        '789 Pine Rd, Springfield, IL 62703',
        'no',
        'yes',
        true,
        'Expanding allergen-friendly program',
        'Separate refrigerator for allergen-free items',
        'bi-weekly',
        'confident',
        'yes',
        false,
        ARRAY['dairy', 'eggs'],
        (SELECT user_id FROM public.users WHERE email = 'john.smith@ssf.org' LIMIT 1),
        (SELECT user_id FROM public.users WHERE email = 'robert.w@pantry3.org' LIMIT 1),
        'Emergency food assistance, senior programs',
        'Can we get more information about cross-contamination prevention?',
        'Proteins, grains, canned fruits',
        'Dairy-free and egg-free alternatives',
        'pending'
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
        'partially_allocated',
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
        'fully_allocated',
        75,
        1200.00,
        450.00
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.donation_items (
        donation_id, item_name, quantity, reserved_quantity, status,
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
        'available',
        16.00,
        4.50,
        'protein'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 150 
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Whole Wheat Bread',
        50,
        0,
        'available',
        24.00,
        3.00,
        'grain'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 150 
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Canned Green Beans',
        50,
        5,
        'available',
        8.01,
        2.00,
        'vegetable'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 200
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Gluten-Free Pasta',
        75,
        30,
        'partially_reserved',
        16.00,
        5.00,
        'grain'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 200
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Almond Milk',
        75,
        20,
        'partially_reserved',
        32.00,
        4.50,
        'dairy_alternative'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 200
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Organic Apples',
        50,
        0,
        'available',
        5.00,
        3.50,
        'fruit'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 100
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Organic Suppliers LLC' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Rice (5lb bag)',
        40,
        0,
        'available',
        80.00,
        12.00,
        'grain'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 100
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Organic Suppliers LLC' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Canned Tomatoes',
        60,
        0,
        'available',
        10.75,
        2.50,
        'vegetable'
      ),
      (
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 75
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1),
        'Cereal Boxes',
        75,
        75,
        'fully_reserved',
        16.00,
        6.00,
        'grain'
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.food_requests (
        pantry_id, requested_size, requested_items, additional_information,
        requested_at, date_received, feedback, photos
      ) VALUES
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1),
        'large',
        ARRAY['peanut_butter', 'bread', 'vegetables', 'dairy_alternatives'],
        'We have 150 families to serve this week. Need extra allergen-free options.',
        '2024-01-16 08:00:00',
        '2024-01-18 14:30:00',
        'Great selection, especially appreciated the allergen-free items',
        ARRAY['delivery1.jpg', 'storage1.jpg']
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Westside Community Kitchen' LIMIT 1),
        'medium',
        ARRAY['gluten_free_pasta', 'vegetables', 'fruits'],
        'Preparing meals for 75 clients this month',
        '2024-01-21 09:30:00',
        '2024-01-23 10:00:00',
        'Good variety, could use more gluten-free options',
        ARRAY['kitchen1.jpg']
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'North End Food Bank' LIMIT 1),
        'small',
        ARRAY['rice', 'canned_goods', 'cereal'],
        'Regular monthly order',
        '2024-02-02 10:00:00',
        NULL,
        NULL,
        NULL
      ),
      (
        (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1),
        'medium',
        ARRAY['cereal', 'milk_alternatives', 'fruits'],
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
        shipped_at, delivered_at, donation_id
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
        '2024-01-18 14:30:00',
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 150
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1)
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
        '2024-01-23 10:00:00',
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 200
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Healthy Foods Co' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1)
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
        NULL,
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 100
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'Organic Suppliers LLC' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1)
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
        NULL,
        (SELECT donation_id FROM public.donations 
         WHERE total_items = 75
         AND food_manufacturer_id = (SELECT food_manufacturer_id FROM public.food_manufacturers WHERE food_manufacturer_name = 'FoodCorp Industries' LIMIT 1)
         ORDER BY donation_id DESC LIMIT 1)
      )
    `);

    await queryRunner.query(`
      INSERT INTO public.allocations (
        order_id, item_id, allocated_quantity, reserved_at, fulfilled_at, status
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
        '2024-01-18 14:30:00',
        'fulfilled'
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
        '2024-01-18 14:30:00',
        'fulfilled'
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
        '2024-01-23 10:00:00',
        'fulfilled'
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
        '2024-01-23 10:00:00',
        'fulfilled'
      ),
      (
        (SELECT order_id FROM public.orders 
         WHERE status = 'pending'
         AND pantry_id = (SELECT pantry_id FROM public.pantries WHERE pantry_name = 'Community Food Pantry Downtown' LIMIT 1)
         ORDER BY order_id DESC LIMIT 1),
        (SELECT item_id FROM public.donation_items WHERE item_name = 'Cereal Boxes' ORDER BY item_id DESC LIMIT 1),
        75,
        '2024-02-03 12:00:00',
        NULL,
        'pending'
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
    await queryRunner.query(`DELETE FROM public.volunteer_assignments`);
    await queryRunner.query(`DELETE FROM public.allocations`);
    await queryRunner.query(`DELETE FROM public.orders`);
    await queryRunner.query(`DELETE FROM public.food_requests`);
    await queryRunner.query(`DELETE FROM public.donation_items`);
    await queryRunner.query(`DELETE FROM public.donations`);
    await queryRunner.query(`DELETE FROM public.pantries`);
    await queryRunner.query(`DELETE FROM public.food_manufacturers`);

    await queryRunner.query(`
      DELETE FROM public.users 
      WHERE email IN (
        'john.smith@ssf.org', 'sarah.j@ssf.org', 'mike.brown@pantry1.org',
        'emily.davis@pantry2.org', 'robert.w@pantry3.org', 'lisa.m@foodcorp.com',
        'david.a@healthyfoods.com', 'jennifer.t@organic.com', 'james.t@volunteer.org',
        'maria.g@volunteer.org', 'william.m@volunteer.org', 'patricia.j@volunteer.org'
      )
    `);
  }
}
