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
} from '@chakra-ui/react';
import {
  Form,
  ActionFunction,
  ActionFunctionArgs,
  redirect,
} from 'react-router-dom';

interface FoodRequest {
  requestId: number;
  requestedAt: string;
  status: string;
  fulfilledBy: string | null;
  dateReceived: string | null;
  requestedSize: string;
  requestedItems: string[];
  additionalInformation: string;
}

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

interface FoodRequestFormModalProps {
  previousRequest?: FoodRequest;
  buttonText: string;
}

const FoodRequestFormModal: React.FC<FoodRequestFormModalProps> = ({
  previousRequest,
  buttonText,
}) => {
  const renderAllergens = () => {
    const allergens = getAllergens();
    return allergens.map((allergen) => (
      <Checkbox key={allergen} name="restrictions" value={allergen}>
        {allergen}
      </Checkbox>
    ));
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const defaultSize = previousRequest?.requestedSize || '';
  const defaultNotes = previousRequest?.additionalInformation || '';
  const selectedItems = previousRequest?.requestedItems || [];

  return (
    <>
      <Button onClick={onOpen}>{buttonText}</Button>
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
                <RadioGroup defaultValue={defaultSize} name="size">
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
                <CheckboxGroup value={selectedItems}>
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
                  defaultValue={defaultNotes}
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

  foodRequestData.set('requestedSize', form.get('size'));
  form.delete('size');
  foodRequestData.set('additionalInformation', form.get('notes'));
  form.delete('notes');
  foodRequestData.set('requestedItems', form.getAll('restrictions'));
  form.delete('restrictions');
  foodRequestData.set('pantryId', 1);

  const data = Object.fromEntries(foodRequestData);

  try {
    const response = await fetch('/api/requests/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
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
