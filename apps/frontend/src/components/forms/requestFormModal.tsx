import React, { useState, useEffect } from 'react';
import {
  ActionFunction,
  ActionFunctionArgs,
  useActionData,
} from 'react-router-dom';
import {
  Flex,
  Button,
  Textarea,
  Menu,
  Text,
  Dialog,
  Tag,
  Box,
  Field,
  CloseButton,
} from '@chakra-ui/react';
import {
  CreateFoodRequestBody,
  FoodRequest,
  FoodTypes,
  RequestSize,
} from '../../types/types';
import { ChevronDownIcon } from 'lucide-react';
import apiClient from '@api/apiClient';

interface FoodRequestFormModalProps {
  previousRequest?: FoodRequest;
  isOpen: boolean;
  onClose: () => void;
  pantryId: number;
  onSuccess: () => void;
}

const FoodRequestFormModal: React.FC<FoodRequestFormModalProps> = ({
  previousRequest,
  isOpen,
  onClose,
  pantryId,
  onSuccess,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [requestedSize, setRequestedSize] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  const [alertMessage, setAlertMessage] = useState<string>('');

  const isFormValid = requestedSize !== '' && selectedItems.length > 0;

  useEffect(() => {
    if (isOpen && previousRequest) {
      setSelectedItems(previousRequest.requestedItems || []);
      setRequestedSize(previousRequest.requestedSize || '');
      setAdditionalNotes(
        previousRequest.additionalInformation ||
          'No additional information supplied',
      );
    }
  }, [isOpen, previousRequest]);

  const handleSubmit = async () => {
    const foodRequestData: CreateFoodRequestBody = {
      pantryId,
      requestedSize: requestedSize as RequestSize,
      additionalInformation: additionalNotes || null,
      requestedItems: selectedItems,
      dateReceived: null,
      feedback: null,
      photos: [],
    };

    try {
      await apiClient.createFoodRequest(foodRequestData);
      onClose();
      onSuccess();
    } catch {
      setAlertMessage('Failed to submit food request');
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="xl"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      {alertMessage && (
        // TODO: add Justin's alert component/uncomment below out and remove text component
        // <FloatingAlert message={alertMessage} status="error" timeout={6000} />
        <Text>{alertMessage}</Text>
      )}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW={650}>
          <Dialog.Header pb={0} mt={2}>
            <Dialog.Title fontSize="lg" fontWeight={700} fontFamily="inter">
              {previousRequest ? 'Resubmit Latest Request' : 'New Food Request'}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text
              mb={previousRequest ? 8 : 10}
              color="#52525B"
              textStyle="p2"
              pt={0}
              mt={0}
            >
              {previousRequest
                ? 'Confirm request details.'
                : `Please keep in mind that we may not be able to accommodate specific
              food requests at all times, but we will do our best to match your preferences.`}
            </Text>
            <Box>
              <Field.Root required mb={4}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Size of Shipment
                  </Text>
                </Field.Label>
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button
                      pl={2.5}
                      _disabled={{ color: 'neutral.800', opacity: 1 }}
                      textStyle="p2"
                      w="full"
                      bgColor={'white'}
                      color={requestedSize ? 'neutral.800' : 'neutral.300'}
                      borderColor="neutral.100"
                      borderWidth="1px"
                      borderRadius="4px"
                      justifyContent="space-between"
                    >
                      {requestedSize || 'Select size'}
                      <ChevronDownIcon stroke="#B8B8B8"></ChevronDownIcon>
                    </Button>
                  </Menu.Trigger>

                  <Menu.Positioner w="full">
                    <Menu.Content>
                      <Menu.RadioItemGroup
                        value={requestedSize}
                        onValueChange={(val: { value: string }) =>
                          setRequestedSize(val.value)
                        }
                      >
                        {Object.values(RequestSize).map((option, idx) => (
                          <Menu.RadioItem
                            key={option}
                            value={option}
                            pl={1}
                            mt={idx === 0 ? 0 : 2}
                          >
                            {option}
                          </Menu.RadioItem>
                        ))}
                      </Menu.RadioItemGroup>
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>
              </Field.Root>

              <Field.Root mb={4}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Food Type(s)
                  </Text>
                </Field.Label>

                <Menu.Root closeOnSelect={false}>
                  <Menu.Trigger asChild>
                    <Button
                      pl={2.5}
                      w="full"
                      bgColor="white"
                      color={'neutral.300'}
                      borderColor="neutral.100"
                      borderWidth="1px"
                      borderRadius="4px"
                      justifyContent="space-between"
                      textStyle="p2"
                    >
                      {selectedItems.length > 0
                        ? `Select more food types`
                        : 'Select food types'}
                      <ChevronDownIcon />
                    </Button>
                  </Menu.Trigger>

                  <Menu.Positioner w="full">
                    <Menu.Content maxH="200px" overflowY="auto">
                      {FoodTypes.map((allergen) => {
                        const isChecked = selectedItems.includes(allergen);
                        return (
                          <Menu.CheckboxItem
                            key={allergen}
                            checked={isChecked}
                            onCheckedChange={(checked: boolean) => {
                              setSelectedItems((prev) =>
                                checked
                                  ? [...prev, allergen]
                                  : prev.filter((i) => i !== allergen),
                              );
                            }}
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
                              borderRadius="4px"
                              borderColor="neutral.200"
                            />
                            <Menu.ItemIndicator />
                            <Text
                              ml={0.5}
                              color="neutral.800"
                              fontWeight={500}
                              fontFamily="Inter"
                            >
                              {allergen}
                            </Text>
                          </Menu.CheckboxItem>
                        );
                      })}
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>

                {selectedItems.length > 0 && (
                  <Flex wrap="wrap" mt={1} gap={2}>
                    {selectedItems.map((item) => (
                      <Tag.Root
                        key={item}
                        size="xl"
                        variant="solid"
                        bg={'neutral.100'}
                        color="neutral.800"
                        borderRadius="4px"
                        borderColor={'neutral.300'}
                        borderWidth="1px"
                        fontFamily="Inter"
                        fontWeight={500}
                      >
                        <Tag.Label>{item}</Tag.Label>

                        <Tag.EndElement>
                          <Tag.CloseTrigger
                            cursor="pointer"
                            onClick={() =>
                              setSelectedItems((prev) =>
                                prev.filter((i) => i !== item),
                              )
                            }
                          />
                        </Tag.EndElement>
                      </Tag.Root>
                    ))}
                  </Flex>
                )}
              </Field.Root>

              <Field.Root mb={4}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Additional Information
                  </Text>
                </Field.Label>
                <Textarea
                  pl={2.5}
                  placeholder="Anything else we should know about"
                  _placeholder={{
                    color: 'neutral.300',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                  }}
                  size="lg"
                  textStyle="p2"
                  color={additionalNotes !== '' ? 'neutral.800' : 'neutral.300'}
                  value={additionalNotes}
                  onChange={(e) => {
                    const inputText = e.target.value;
                    const words = inputText.trim().split(/\s+/);

                    if (words.length <= 250) {
                      setAdditionalNotes(e.target.value);
                    } else {
                      alert('Exceeded word limit');
                    }
                  }}
                />

                <Field.HelperText color="neutral.600">
                  Max 250 words
                </Field.HelperText>
              </Field.Root>

              <Flex justifyContent="flex-end" mt={4} gap={2}>
                <Button
                  onClick={onClose}
                  bg={'white'}
                  color={'black'}
                  borderColor="neutral.100"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  bg={isFormValid ? '#213C4A' : 'neutral.400'}
                  color={'white'}
                  disabled={!isFormValid}
                >
                  Continue
                </Button>
              </Flex>
            </Box>
          </Dialog.Body>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="lg" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default FoodRequestFormModal;
