import React, { useState, useEffect } from 'react';
import {
  Flex,
  Button,
  Textarea,
  Menu,
  Text,
  Field,
  Dialog,
  Tag,
  Box,
} from '@chakra-ui/react';
import { Form, ActionFunction, ActionFunctionArgs } from 'react-router-dom';
import { FoodRequest } from 'types/types';
import { ChevronDownIcon } from 'lucide-react';

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

  const isFormValid = requestedSize !== '' && selectedItems.length > 0;

  useEffect(() => {
    if (isOpen && previousRequest) {
      setSelectedItems(previousRequest.requestedItems || []);
      setRequestedSize(previousRequest.requestedSize || '');
      setAdditionalNotes(previousRequest.additionalInformation || '');
    }
  }, [isOpen, previousRequest]);

  const shipmentSizeOptions = [
    "Very Small (1-2 boxes)",
    "Small (2-5 boxes)",
    "Medium (5-10 boxes)",
    "Large (10+ boxes)"
  ];

  return (
    <Dialog.Root
      open={isOpen}
      size="xl"
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content mt={3} maxW={700}>
          <Dialog.Header>
            <Dialog.Title fontSize="lg" fontWeight={700} fontFamily="inter">
              {previousRequest ? "Resubmit Latest Order" : "New Food Request"}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text mb={12} color="#52525B" textStyle="p2">
              {previousRequest ? "Confirm order details." : `Please keep in mind that we may not be able to accommodate specific
              food requests at all times, but we will do our best to match your preferences.`}
            </Text>
            <Form
              method="post"
              action="/food-request"
              onSubmit={(e) => {
                if (selectedItems.length === 0) {
                  e.preventDefault();
                  alert("Please select at least one item from the shipment list.");
                }
                if (requestedSize === '') {
                  e.preventDefault();
                  alert("Please select a requested size.");
                }
              }}
            >
              <input type="hidden" name="pantryId" value={pantryId} />
              <Field.Root required mb={3}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Size of Shipment
                  </Text>
                </Field.Label>
                <input type="hidden" name="size" value={requestedSize} />
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button disabled={readOnly} textStyle="p2" w="full" bgColor={'white'} color={requestedSize ? "#111111" : "neutral.300"} borderColor='neutral.100' borderWidth="1px" borderRadius="4px" justifyContent="space-between" mt={2}>
                      {requestedSize || "Select Size"}
                      <ChevronDownIcon w={5} h={5} />
                    </Button>
                  </Menu.Trigger>

                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.RadioItemGroup
                        value={requestedSize}
                        onValueChange={(val: { value: string }) => setRequestedSize(val.value)}
                      >
                        {shipmentSizeOptions.map((option) => (
                          <Menu.RadioItem key={option} value={option}>
                            <Menu.ItemIndicator />
                            {option}
                          </Menu.RadioItem>
                        ))}
                      </Menu.RadioItemGroup>
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>
              </Field.Root>

              <Field.Root mb={3}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">Food Type(s)</Text>
                </Field.Label>

                {selectedItems.map((item) => (
                  <input key={item} type="hidden" name="restrictions" value={item} />
                ))}

                <Menu.Root closeOnSelect={false}>
                  <Menu.Trigger asChild>
                    <Button
                      disabled={readOnly}
                      w="full"
                      bgColor="white"
                      color={selectedItems.length > 0 ? "#111111" : "neutral.300"} 
                      borderColor='neutral.100' 
                      borderWidth="1px" 
                      borderRadius="4px"
                      justifyContent="space-between"
                      textStyle="p2"
                      mt={2}
                    >
                      {selectedItems.length > 0 ? `Multi-Select` : "Select food types"}
                      <ChevronDownIcon w={5} h={5} />
                    </Button>
                  </Menu.Trigger>

                  <Menu.Positioner w="full">
                    <Menu.Content maxH="250px" overflowY="auto">
                      {getAllergens().map((allergen) => {
                        const isChecked = selectedItems.includes(allergen);
                        return (
                          <Menu.CheckboxItem
                            key={allergen}
                            checked={isChecked}
                            onCheckedChange={(checked: boolean) => {
                              setSelectedItems((prev) =>
                                checked
                                  ? [...prev, allergen]
                                  : prev.filter((i) => i !== allergen)
                              );
                            }}
                            disabled={readOnly}
                            display="flex"
                            alignItems="center"
                          >
                            <Box
                              position="absolute"
                              left={1}
                              ml={0.5}
                              w={5}
                              h={5}
                              borderWidth="1px"
                              borderColor="gray.500"
                            >
                              
                            </Box>
                            <Menu.ItemIndicator />

                            <Text color="neutral.800">{allergen}</Text>
                          </Menu.CheckboxItem>
                        );
                      })}
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>
      
                {selectedItems.length > 0 && (
                  <Flex wrap="wrap" mt={3} gap={2}>
                    {selectedItems.map((item) => (
                      <Tag.Root
                        key={item}
                        size="xl"
                        variant="solid"
                        bg="#E9F4F6"
                        color="neutral.800"
                        borderRadius="4px"
                        borderColor='teal.400' 
                        borderWidth="1px" 
                        fontFamily="Inter"
                      >
                        <Tag.Label>{item}</Tag.Label>
                        <Tag.EndElement>
                          {!readOnly && (
                            <Tag.CloseTrigger
                              onClick={() =>
                                setSelectedItems((prev) => prev.filter((i) => i !== item))
                              }
                            />
                          )}
                        </Tag.EndElement>
                      </Tag.Root>
                    ))}
                  </Flex>
                )}
              </Field.Root>

              <Field.Root mb={6}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Additional Information
                  </Text>
                </Field.Label>
                <Textarea
                  name="notes"
                  placeholder="Anything else we should know about"
                  _placeholder={{ color: "neutral.300", fontFamily: "Inter", fontWeight: 400 }}
                  size="lg"
                  textStyle="p2"
                  color={additionalNotes !== "" ? "neutral.800" : "neutral.300"}
                  value={additionalNotes}
                  onChange={(e) => {
                    const inputText = e.target.value
                    const words = inputText.trim().split(/\s+/)

                    if (words.length <= 250) {
                      setAdditionalNotes(e.target.value)
                    } else {
                      alert("Exceeded word limit")
                    }
                   
                  }}
                  disabled={readOnly}
                />
                <Field.HelperText color="neutral.600">Max 250 words</Field.HelperText>
              </Field.Root>

              <Flex justifyContent="flex-end" mt={4} gap={2}>
                {!readOnly && <Button type="submit" bg={isFormValid ? '#213C4A' : 'neutral.400'} color={'white'} disabled={!isFormValid}>Continue</Button>}
                <Button onClick={onClose} bg={'white'} color={'black'} borderColor='neutral.100'>Cancel</Button>
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

  const pantryId = form.get('pantryId')
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