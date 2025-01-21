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
  CheckboxGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  RadioGroup,
  HStack,
  Radio,
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
    'Dairy-Free Alternatives',
    'Dried Beans (Gluten-Free, Nut-Free)',
    'Gluten-Free Baking/Pancake Mixes',
    'Gluten-Free Bread',
    'Gluten-Free Tortillas',
    'Granola',
    'Masa Harina Flour',
    'Nut-Free Granola Bars',
    'Olive Oil',
    'Refrigerated Meals',
    'Rice Noodles',
    'Seed Butters (Peanut Butter Alternative)',
    'Whole-Grain Cookies',
    'Quinoa',
  ];
};

const FoodRequestFormModal: React.FC = () => {
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minW="35em" maxW="50em" m="5em">
      <Button onClick={onOpen}>Submit new request</Button>
      <Modal isOpen={isOpen} size={'xl'} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW="49em">
          <ModalHeader fontSize={25} fontWeight={700}>
            SSF Food Request Form
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form method="post" action="/food-request">
              <FormControl as="fieldset" isRequired mb="2em">
                <FormLabel as="legend" fontSize={20} fontWeight={700}>
                  Requested Size of Shipment
                </FormLabel>
                <RadioGroup defaultValue="Medium">
                  <HStack spacing="24px">
                    <Radio value="Very Small">Very Small (1-2 boxes)</Radio>
                    <Radio value="Small">Small (2-5 boxes)</Radio>
                    <Radio value="Medium">Medium (5-10 boxes)</Radio>
                    <Radio value="Large">Large (10+ boxes)</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <FormControl mb="2em" isRequired>
                <FormLabel fontSize={20} fontWeight={700}>
                  Requested Shipment
                </FormLabel>
                <CheckboxGroup>
                  <SimpleGrid spacing={2} columns={2}>
                    {renderAllergens()}
                  </SimpleGrid>
                </CheckboxGroup>
              </FormControl>
              <FormControl mb="2em">
                <FormLabel fontSize={20} fontWeight={700}>
                  Additional Comments
                </FormLabel>
                <Textarea
                  name="notes"
                  placeholder="Anything else we should know about"
                  size="sm"
                />
              </FormControl>
              <Flex justifyContent="space-between" mt={4}>
                <Button type="submit">Submit</Button>
                <Button onClick={onClose}>Close</Button>
              </Flex>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
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

export default FoodRequestFormModal;
