import React, { useState, useEffect } from 'react';
import {
  Flex,
  Button,
  Checkbox,
  Textarea,
  SimpleGrid,
  CheckboxGroup,
  RadioGroup,
  HStack,
  Text,
  Field,
  Dialog,
} from '@chakra-ui/react';
import { Form, ActionFunction, ActionFunctionArgs } from 'react-router-dom';
import { FoodRequest } from 'types/types';

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
  readOnly?: boolean;
  isOpen: boolean;
  onClose: () => void;
  pantryId: number;
}

const FoodRequestFormModal: React.FC<FoodRequestFormModalProps> = ({
  previousRequest,
  readOnly = false,
  isOpen,
  onClose,
  pantryId,
}) => {
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

  const shipmentSizeOptions = [
    { value: '<20', label: '<20' },
    { value: '20-50', label: '20-50' },
    { value: '50-100', label: '50-100' },
    { value: '100-150', label: '100-150' },
    { value: '150-200', label: '150-200' },
    { value: '>200', label: '>200' },
  ];

  return (
    <Dialog.Root
      open={isOpen}
      size="xl"
      onOpenChange={(e) => !e.open && onClose()}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="49em">
          <Dialog.Header>
            <Dialog.Title fontSize={25} fontWeight={700}>
              SSF Food Request Form
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
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
              <input type="hidden" name="pantryId" value={pantryId} />
              <Field.Root required mb="2em">
                <Field.Label>
                  <Text fontSize={20} fontWeight={700}>
                    Requested Size of Shipment
                  </Text>
                  <Field.RequiredIndicator
                    color="red"
                    fontSize={20}
                    fontWeight={700}
                  />
                </Field.Label>
                <RadioGroup.Root
                  value={requestedSize}
                  onValueChange={(e) => setRequestedSize(e.value)}
                  name="size"
                  disabled={readOnly}
                >
                  <HStack gap="24px">
                    {shipmentSizeOptions.map((option) => (
                      <RadioGroup.Item key={option.value} value={option.value}>
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>
                          {option.label}
                        </RadioGroup.ItemText>
                      </RadioGroup.Item>
                    ))}
                  </HStack>
                </RadioGroup.Root>
              </Field.Root>

              <Field.Root required mb="2em">
                <Field.Label>
                  <Text fontSize={20} fontWeight={700}>
                    Requested Shipment
                  </Text>
                  <Field.RequiredIndicator
                    color="red"
                    fontSize={20}
                    fontWeight={700}
                  />
                </Field.Label>
                <CheckboxGroup
                  value={selectedItems}
                  onValueChange={setSelectedItems}
                >
                  <SimpleGrid gap={2} columns={2}>
                    {getAllergens().map((allergen) => (
                      <Checkbox.Root
                        key={allergen}
                        value={allergen}
                        disabled={readOnly}
                        name="restrictions"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>{allergen}</Checkbox.Label>
                      </Checkbox.Root>
                    ))}
                  </SimpleGrid>
                </CheckboxGroup>
              </Field.Root>

              <Field.Root required mb="2em">
                <Field.Label>
                  <Text fontSize={20} fontWeight={700}>
                    Additional Comments
                  </Text>
                  <Field.RequiredIndicator
                    color="red"
                    fontSize={20}
                    fontWeight={700}
                  />
                </Field.Label>
                <Textarea
                  name="notes"
                  placeholder="Anything else we should know about"
                  size="sm"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  disabled={readOnly}
                />
              </Field.Root>

              <Flex justifyContent="space-between" mt={4}>
                <Button onClick={onClose}>Close</Button>
                {!readOnly && <Button type="submit">Submit</Button>}
              </Flex>
            </Form>
          </Dialog.Body>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
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
  foodRequestData.set('pantryId', form.get('pantryId'));

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
      console.log('Food request submitted successfully');

      window.location.href = `/request-form/${pantryId}`;
      return null;
    } else {
      console.error('Failed to submit food request', await response.text());
      window.location.href = `/request-form/${pantryId}`;
      return null;
    }
  } catch (error) {
    console.error('Error submitting food request', error);
    window.location.href = `/request-form/${pantryId}`;
    return null;
  }
};

export default FoodRequestFormModal;
