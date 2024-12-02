import {
  Flex,
  Text,
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
  CheckboxGroup,
} from '@chakra-ui/react';
import {
  Form,
  redirect,
  ActionFunction,
  ActionFunctionArgs,
} from 'react-router-dom';

// should be an API call, dummy data for now
const getMenu = () => {
  return {
    Dairy: [
      'Whole Milk',
      'Lactose-Free Milk',
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
};

// might be an API call, dummy data for now
const getAllergens = () => {
  return [
    'Milk',
    'Eggs',
    'Fish',
    'Shellfish',
    'Tree Nuts',
    'Peanuts',
    'Wheat',
    'Soybeans',
    'Sesame',
    'Other (specify in notes)',
  ];
};

const FoodRequestForm: React.FC = () => {
  const renderAllergens = () => {
    return getAllergens().map((a) => (
      <Checkbox name="restrictions" value={a}>
        {a}
      </Checkbox>
    ));
  };

  const renderMenuSection = (sectionItems: Array<string>) => {
    return (
      <SimpleGrid spacing={4} columns={4}>
        {sectionItems.map((x) => (
          <Flex gap={6}>
            <NumberInput
              step={1}
              defaultValue={0}
              min={0}
              max={100}
              size="s"
              maxW="4em"
              name={x}
            >
              <NumberInputField size={2} />
              <NumberInputStepper boxSize={0}>
                <NumberIncrementStepper border={0} marginTop={-1} boxSize={6} />
                <NumberDecrementStepper border={0} boxSize={6} />
              </NumberInputStepper>
            </NumberInput>
            <h3>{x}</h3>
          </Flex>
        ))}
      </SimpleGrid>
    );
  };

  const renderMenu = () => {
    const menu: Map<string, Array<string>> = new Map(Object.entries(getMenu()));
    const menuSections: JSX.Element[] = [];
    menu.forEach((v, k) => {
      menuSections.push(
        <div>
          <Heading size="md" paddingY={2}>
            {k}
          </Heading>
          {renderMenuSection(v)}
        </div>,
      );
    });
    return menuSections;
  };

  return (
    <Box minW="35em" maxW="50em" m="5em">
      <Form method="post" action="/food-request">
        <Heading size={'2xl'} marginY={8}>
          SSF Food Request Form
        </Heading>
        <Text
          whiteSpace={'break-spaces'}
        >{`Request a shipment of allergen-free food from SSF. You will be placed on our waiting list for incoming donations targeted to your needs.`}</Text>
        <Text
          whiteSpace={'break-spaces'}
        >{`Please keep in mind that we may not be able to accommodate specific food requests at all times, but we will do our best to match your preferences.`}</Text>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Requested Delivery Date
          </FormLabel>
          <Input maxW="20em" name="requestedDeliveryDate" type="date" />
          <FormHelperText>
            We'll reach out to confirm a date and time
          </FormHelperText>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Requested Size of Shipment
          </FormLabel>
          <CheckboxGroup>
            <SimpleGrid spacing={2} columns={3}>
              {renderAllergens()}
            </SimpleGrid>
          </CheckboxGroup>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Requested Shipment
          </FormLabel>
          <Stack>{renderMenu()}</Stack>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Additional Information
          </FormLabel>
          <Textarea
            name="notes"
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
  const form = await request.formData();

  const nonMenuNames = ['requestedDeliveryDate', 'notes'];
  const foodRequestData = new Map();
  for (let i = 0; i < nonMenuNames.length; i++) {
    const name = nonMenuNames[i];
    foodRequestData.set(name, form.get(name));
    form.delete(name);
  }

  foodRequestData.set('restrictions', form.getAll('restrictions'));
  form.delete('restrictions');

  const foodItems = Array.from(form.entries())
    .map((x) => [x[0], parseInt(x[1] as string)])
    .filter(([k, v]) => v !== 0);
  foodRequestData.set('items', Object.fromEntries(foodItems));
  const data = Object.fromEntries(foodRequestData);

  // TODO: API Call to update database
  console.log(data);
  return redirect('/');
};

export default FoodRequestForm;
