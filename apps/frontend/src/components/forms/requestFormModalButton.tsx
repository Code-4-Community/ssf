import {
  Flex,
  FormControl,
  FormLabel,
  Button,
  Checkbox,
  Textarea,
  SimpleGrid,
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
  Text,
} from '@chakra-ui/react';
import {
  Form,
  redirect,
  ActionFunction,
  ActionFunctionArgs,
} from 'react-router-dom';

// might be an API call, for now hard code
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen}>Submit new request</Button>
      <Modal isOpen={isOpen} size={'xl'} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW="49em">
          <ModalHeader fontSize={25} fontWeight={700}>
            SSF Food Request Form
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb="1.5em">
              Request a shipment of allergen-free food from SSF. You will be
              placed on our waiting list for incoming donations targeted to your
              needs.
              <br />
              <br />
              Please keep in mind that we may not be able to accommodate
              specific food requests at all times, but we will do our best to
              match your preferences.
            </Text>
            <Form method="post" action="/food-request">
              <FormControl as="fieldset" isRequired mb="2em">
                <FormLabel as="legend" fontSize={20} fontWeight={700}>
                  Requested Size of Shipment
                </FormLabel>
                <RadioGroup defaultValue="Medium" name="size">
                  <HStack spacing="24px">
                    <Radio value="Very Small (1-2 boxes)">
                      Very Small (1-2 boxes)
                    </Radio>
                    <Radio value="Small (2-5 boxes)">Small (2-5 boxes)</Radio>
                    <Radio value="Medium (5-10 boxes)">
                      Medium (5-10 boxes)
                    </Radio>
                    <Radio value="Large (10+ boxes)">Large (10+ boxes)</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>
              <FormControl mb="2em">
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
                <Button onClick={onClose}>Close</Button>
                <Button type="submit">Submit</Button>
              </Flex>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export const submitFoodRequestFormModal: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();

  const foodRequestData = new Map();

  foodRequestData.set('requestedSize', form.get('size'));
  form.delete('size');
  foodRequestData.set('additionalInformation', form.get('notes'));
  form.delete('notes');
  foodRequestData.set('requestedItems', form.getAll('restrictions'));
  form.delete('restrictions');
  foodRequestData.set('pantryId', 1);

  const data = Object.fromEntries(foodRequestData);

  console.log(data);
  try {
    const response = await fetch('/api/requests/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Can add additional behavior here
      console.log('Food request submitted successfully');
    } else {
      console.error('Failed to submit food request', await response.text());
    }
  } catch (error) {
    console.error('Error submitting food request', error);
  }

  return redirect('/');
};

export default FoodRequestFormModal;
