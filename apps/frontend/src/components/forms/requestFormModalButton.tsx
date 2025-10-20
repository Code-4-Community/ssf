import React, { useState, useEffect } from 'react';
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
import { Form, ActionFunction, ActionFunctionArgs } from 'react-router-dom';
import { FoodRequest } from 'types/types';
import ApiClient from '@api/apiClient';

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
  disabled: boolean;
  readOnly?: boolean;
}

const FoodRequestFormModal: React.FC<FoodRequestFormModalProps> = ({
  previousRequest,
  buttonText,
  disabled,
  readOnly = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [requestedSize, setRequestedSize] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen && previousRequest) {
      setSelectedItems(previousRequest.requestedItems || []);
      setRequestedSize(previousRequest.requestedSize || '');
      setAdditionalNotes(previousRequest.additionalInformation || '');
    }
  }, [isOpen, previousRequest]);

  const handleCheckboxChange = (values: string[]) => {
    setSelectedItems(values);
  };

  return (
    <>
      <Button onClick={onOpen} isDisabled={disabled}>
        {buttonText}
      </Button>
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
                <RadioGroup
                  value={requestedSize}
                  onChange={setRequestedSize}
                  name="size"
                  isDisabled={readOnly}
                >
                  <HStack spacing="24px">
                    <Radio value="<20">{'<'}20</Radio>
                    <Radio value="20-50">20-50</Radio>
                    <Radio value="50-100">50-100</Radio>
                    <Radio value="100-150">100-150</Radio>
                    <Radio value="150-200">150-200</Radio>
                    <Radio value=">200">{'>'}200</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              <FormControl mb="2em">
                <FormLabel fontSize={20} fontWeight={700}>
                  Requested Shipment
                </FormLabel>
                <CheckboxGroup
                  value={selectedItems}
                  onChange={handleCheckboxChange}
                  isDisabled={readOnly}
                >
                  <SimpleGrid spacing={2} columns={2}>
                    {getAllergens().map((allergen) => (
                      <Checkbox
                        key={allergen}
                        name="restrictions"
                        value={allergen}
                      >
                        {allergen}
                      </Checkbox>
                    ))}
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
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  isDisabled={readOnly}
                />
              </FormControl>

              <Flex justifyContent="space-between" mt={4}>
                <Button onClick={onClose}>Close</Button>
                {!readOnly && <Button type="submit">Submit</Button>}
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
    await ApiClient.createFoodRequest(data);
    alert('Food request submitted successfully');
    window.location.href = '/request-form/1';
    return null;
  } catch (error) {
    alert('Error submitting food request: ' + error);
    window.location.href = '/request-form/1';
    return null;
  }
};

export default FoodRequestFormModal;
