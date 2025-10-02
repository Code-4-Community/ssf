import React, { useState, useEffect } from 'react';
import {
  Flex,
  Field,
  Button,
  Checkbox,
  RadioGroup,
  Dialog,
  Textarea,
  SimpleGrid,
  HStack,
  Text,
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
  const [isOpen, setIsOpen] = useState(false);
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
      <Button onClick={() => setIsOpen(true)} disabled={disabled}>
        {buttonText}
      </Button>
      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="xl">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="49em">
            <Dialog.Header>
              <Dialog.Title fontSize={25} fontWeight={700}>
                SSF Food Request Form
              </Dialog.Title>
              <Dialog.CloseTrigger />
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
                <Field.Root required mb="2em">
                  <Field.Label fontSize={20} fontWeight={700}>
                    Requested Size of Shipment
                  </Field.Label>
                  <RadioGroup.Root
                    value={requestedSize}
                    onValueChange={(e) => setRequestedSize(e.value)}
                    name="size"
                    disabled={readOnly}
                  >
                    <HStack gap={6}>
                      <RadioGroup.Item value="<20">
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>{'<'}20</RadioGroup.ItemText>
                      </RadioGroup.Item>
                      <RadioGroup.Item value="20-50">
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>20-50</RadioGroup.ItemText>
                      </RadioGroup.Item>
                      <RadioGroup.Item value="50-100">
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>50-100</RadioGroup.ItemText>
                      </RadioGroup.Item>
                      <RadioGroup.Item value="100-150">
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>100-150</RadioGroup.ItemText>
                      </RadioGroup.Item>
                      <RadioGroup.Item value="150-200">
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>150-200</RadioGroup.ItemText>
                      </RadioGroup.Item>
                      <RadioGroup.Item value=">200">
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemControl />
                        <RadioGroup.ItemText>{'>'}200</RadioGroup.ItemText>
                      </RadioGroup.Item>
                    </HStack>
                  </RadioGroup.Root>
                </Field.Root>

                <Field.Root mb="2em">
                  <Field.Label fontSize={20} fontWeight={700}>
                    Requested Shipment
                  </Field.Label>
                  <CheckboxGroup.Root
                    value={selectedItems}
                    onValueChange={(e) => handleCheckboxChange(e.value)}
                    disabled={readOnly}
                  >
                    <SimpleGrid gap={2} columns={2}>
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
                  </CheckboxGroup.Root>
                </Field.Root>

                <Field.Root mb="2em">
                  <Field.Label fontSize={20} fontWeight={700}>
                    Additional Comments
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
                  <Button onClick={() => setIsOpen(false)}>Close</Button>
                  {!readOnly && <Button type="submit">Submit</Button>}
                </Flex>
              </Form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
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
      console.log('Food request submitted successfully');
      window.location.href = '/request-form/1';
      return null;
    } else {
      console.error('Failed to submit food request', await response.text());
      window.location.href = '/request-form/1';
      return null;
    }
  } catch (error) {
    console.error('Error submitting food request', error);
    window.location.href = '/request-form/1';
    return null;
  }
};

export default FoodRequestFormModal;