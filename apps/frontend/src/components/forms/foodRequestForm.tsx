// Information Needed:
// restrictions (pre-populate from pantries table)
// due date
// donation contents
//  donation type
//  donation size
//  running low on any foods?

import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
  Checkbox,
  Stack,
  Textarea,
  SimpleGrid,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import {
  Form,
  redirect,
  ActionFunction,
  ActionFunctionArgs,
} from 'react-router-dom';

const FoodRequestForm: React.FC = () => {
  const renderAllergens = () => {
    const allergens = [
      'Milk',
      'Eggs',
      'Fish',
      'Shellfish',
      'Tree Nuts',
      'Peanuts',
      'Wheat',
      'Soybeans',
      'Sesame',
    ];
    return allergens.map((a) => <Checkbox>{a}</Checkbox>);
  };
  const menu = {
    Dairy: [
      'Whole Milk',
      'Lactose-Free Skim Milk',
      'Salted Butter',
      'Eggs',
      'Yogurt',
      'American Cheese',
      'Mozzarella Cheese',
    ],
    Meat: [
      'Chicken Breast',
      'Ground Beef',
      'Ground Pork',
      'Ground Turkey',
      'Chicken Strips',
      'Turkey Bacon',
    ],
    Fruit: [
      'Pear',
      'Orange',
      'Banana',
      'Lychee',
      'Tangerine',
      'Tomato',
      'Pineapple',
    ],
    Vegetables: ['Cauliflower', '小白菜', 'Spinach', 'Broccolini', 'Seaweed'],
    Snacks: [
      'Oreos (20ct)',
      'Potato Chips',
      'Chocolate Bars (4 ct)',
      'Nimbu Masala',
    ],
    Alcohol: [
      'Red Wine',
      'Fireball',
      'Tequila',
      'Sake',
      'Malt Liquor',
      'Vodka',
      'Rum',
    ],
  };
  const renderMenuSection = (sectionItems: Array<string>) => {
    return (
      <SimpleGrid spacing={1} columns={3}>
        {sectionItems.map((x) => (
          <Flex>
            <h3>{x}</h3>
            <NumberInput
              step={1}
              defaultValue={0}
              min={0}
              max={100}
              size="s"
              maxW="4em"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>
        ))}
      </SimpleGrid>
    );
  };

  const renderMenu = (menu: Map<string, Array<string>>) => {
    const menuSections: JSX.Element[] = [];
    menu.forEach((v, k) => {
      menuSections.push(
        <div>
          <h2>{k}</h2>
          {renderMenuSection(v)}
        </div>,
      );
    });
    return menuSections;
  };

  return (
    <Box minW="35em" maxW="50em" m="5em">
      <Form method="post" action="/food-request">
        <FormControl isRequired mb="2em">
          <FormLabel>Requested Delivery Date</FormLabel>
          <Input maxW="20em" name="requestedDeliveryDate" type="date" />
          <FormHelperText>
            We'll reach out to confirm a date and time
          </FormHelperText>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel>Dietary Restrictions</FormLabel>
          <SimpleGrid spacing={5} columns={3}>
            {renderAllergens()}
            <Checkbox>Other</Checkbox>
          </SimpleGrid>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel>Requested Items</FormLabel>
          <Stack>{renderMenu(new Map(Object.entries(menu)))}</Stack>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel>Additional Comments</FormLabel>
          <Textarea
            placeholder="Anything else we should know about"
            size="sm"
          />
        </FormControl>
        <Button type="submit">Submit</Button>
      </Form>
    </Box>
  );
};

export const submitFoodRequestForm: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const data = await request.formData();
  const foodRequest = {};
  // API Call to backend

  console.log(foodRequest);
  return redirect('/');
};

export default FoodRequestForm;
