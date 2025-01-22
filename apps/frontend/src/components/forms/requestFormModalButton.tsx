import {
  Flex,
  Box,
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
} from '@chakra-ui/react';
import {
  Form,
  redirect,
  ActionFunction,
  ActionFunctionArgs,
} from 'react-router-dom';

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
            <Form method="post" action="/food-request-modal">
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
                <Button type="submit">Submit</Button>
                <Button onClick={onClose}>Close</Button>
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

  foodRequestData.set('notes', form.get('notes'));
  form.delete('notes');
  foodRequestData.set('restrictions', form.getAll('restrictions'));
  form.delete('restrictions');
  foodRequestData.set('pantry_id', 1);

  const data = Object.fromEntries(foodRequestData);

  // TODO: API Call to update database
  console.log(data);
  return redirect('/');
};

export default FoodRequestFormModal;
