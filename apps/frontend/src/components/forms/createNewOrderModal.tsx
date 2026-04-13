import React, { useEffect, useState } from 'react';
import {
  Button,
  VStack,
  CloseButton,
  Text,
  Dialog,
  createListCollection,
  Portal,
  Select,
  Box,
  Flex,
  HStack,
  Badge,
  Input,
} from '@chakra-ui/react';
import {
  DonationItemsGroupedByFoodType,
  FoodManufacturerWithoutRelations,
  FoodRequest,
  MatchingItemsDto,
  MatchingManufacturersDto,
} from 'types/types';
import apiClient from '@api/apiClient';
import { useAlert } from '../../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useGroupedItemsByFoodType } from '../../hooks/groupedItemsByFoodType';

interface CreateNewOrderModalModalProps {
  request: FoodRequest;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNewOrderModal: React.FC<CreateNewOrderModalModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [alertState, setAlertMessage] = useAlert();
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<FoodManufacturerWithoutRelations | null>(null);
  const [manufacturers, setManufacturers] =
    useState<MatchingManufacturersDto | null>(null);
  const [manufacturerItems, setManufacturerItems] =
    useState<MatchingItemsDto | null>(null);
  const [isCreatingNewOrder, setIsCreatingNewOrder] = useState<boolean>(false);
  const [itemAllocations, setItemAllocations] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const data = await apiClient.getMatchingManufacturers(
          request.requestId,
        );
        setManufacturers(data);
      } catch {
        setAlertMessage('Error fetching manufacturers');
      }
    };
    fetchManufacturers();
  }, [request, setAlertMessage]);

  // Set initial itemAllocations to be equal to avaliable quantity left
  useEffect(() => {
    if (!manufacturerItems) return;

    const initial: Record<number, number> = {};

    [
      ...manufacturerItems.matchingItems,
      ...manufacturerItems.nonMatchingItems,
    ].forEach((item) => {
      initial[item.itemId] = item.availableQuantity;
    });

    setItemAllocations(initial);
  }, [manufacturerItems]);

  // Collection for option group select element to seperate by matching stock and non matching stock
  const categories = manufacturers
    ? [
        {
          category: 'Matching Stock',
          items: manufacturers.matchingManufacturers.map((m) => ({
            label: m.foodManufacturerName,
            value: m.foodManufacturerId,
          })),
        },
        {
          category: 'Other',
          items: manufacturers.nonMatchingManufacturers.map((m) => ({
            label: m.foodManufacturerName,
            value: m.foodManufacturerId,
          })),
        },
      ]
    : [];

  const manufacturerCollection = createListCollection({
    items: categories.flatMap(({ category, items }) =>
      items.map((item) => ({
        ...item,
        category,
      })),
    ),
  });

  const onChooseManufacturer = async (manufacturerId: number) => {
    if (!manufacturers) return;

    const selected = [
      ...manufacturers.matchingManufacturers,
      ...manufacturers.nonMatchingManufacturers,
    ].find((m) => m.foodManufacturerId === manufacturerId);

    setSelectedManufacturer(selected ?? null);

    try {
      const data = await apiClient.getAvailableItemsForManufacturer(
        request.requestId,
        manufacturerId,
      );
      setManufacturerItems(data);
    } catch {
      setAlertMessage('Error fetching manufacturer items');
    }
  };

  const onSubmitNewOrder = async () => {
    const data = {
      foodRequestId: request.requestId,
      manufacturerId: selectedManufacturer!.foodManufacturerId,
      itemAllocations: itemAllocations,
    };

    try {
      await apiClient.createOrder(data);
      onSuccess();
    } catch {
      setAlertMessage('Error creating new order');
    }
  };

  const allItems = [
    ...(manufacturerItems?.matchingItems || []),
    ...(manufacturerItems?.nonMatchingItems || []),
  ];

  const groupedDonationItems: DonationItemsGroupedByFoodType =
    useGroupedItemsByFoodType(allItems);

  const sectionTitleStyles = {
    textStyle: 'p2',
    fontWeight: '600',
    color: 'neutral.800',
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="md"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="error"
          timeout={6000}
        />
      )}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="lg" />
          </Dialog.CloseTrigger>

          <Dialog.Header pb={0}>
            <Dialog.Title fontSize="18px" fontFamily="inter" fontWeight={600}>
              Create New Order
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body pb={6}>
            <VStack align="stretch" gap={4}>
              <Text textStyle="p2" color="gray.dark" mt={3}>
                {!isCreatingNewOrder
                  ? 'Begin by selecting a Food Manufacturer below that fulfills the requested food types.'
                  : 'Add the amount of each product you would like to add to this order.'}
              </Text>

              {!isCreatingNewOrder && (
                <Select.Root
                  collection={manufacturerCollection}
                  size="sm"
                  width="100%"
                  onValueChange={(value: any) =>
                    onChooseManufacturer(Number(value.value))
                  }
                  mt={2}
                >
                  <Select.HiddenSelect />
                  <Select.Label
                    textStyle="p2"
                    color="neutral.800"
                    fontWeight={600}
                  >
                    Select a Manufacturer
                  </Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText
                        textStyle="p2"
                        color="neutral.700"
                        placeholder="Select a manufacturer"
                      />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {categories.map(({ category, items }) => (
                          <Select.ItemGroup key={category}>
                            <Select.ItemGroupLabel
                              textStyle="p2"
                              color="neutral.500"
                            >
                              {category}
                            </Select.ItemGroupLabel>
                            {items.map((item) => (
                              <Select.Item
                                textStyle="p2"
                                color="gray.black"
                                fontWeight={500}
                                item={item}
                                key={item.value}
                                my={2}
                              >
                                {item.label}
                              </Select.Item>
                            ))}
                          </Select.ItemGroup>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              )}

              {manufacturerItems && !isCreatingNewOrder && (
                <Box>
                  <Text {...sectionTitleStyles} mb={3}>
                    Donation Stock
                  </Text>
                  <Box
                    borderWidth={1}
                    borderRadius={5}
                    borderColor="neutral.100"
                    p={3}
                  >
                    {Object.entries(groupedDonationItems).map(
                      ([foodType, items]) => {
                        const isMatching = manufacturerItems.matchingItems.some(
                          (i) => i.foodType === foodType,
                        );

                        return (
                          <Box key={foodType} mb={4}>
                            <HStack gap={2} align="center" mb={2}>
                              <Text {...sectionTitleStyles}>{foodType}</Text>
                              {isMatching && (
                                <Badge
                                  size="sm"
                                  color="teal.hover"
                                  bgColor="teal.200"
                                  textStyle="p2"
                                  fontSize="10px"
                                  fontWeight={500}
                                >
                                  Matching
                                </Badge>
                              )}
                            </HStack>
                            {items.map((item) => (
                              <Flex
                                border="1px solid"
                                borderColor="neutral.100"
                                borderRadius="md"
                                px={4}
                                align="center"
                                mt="2"
                                key={item.itemId}
                              >
                                <Text
                                  py={2}
                                  textStyle="p2"
                                  color="neutral.800"
                                  flex={1}
                                >
                                  {item.itemName}
                                </Text>

                                <Box
                                  alignSelf="stretch"
                                  borderLeft="1px solid"
                                  borderColor="neutral.100"
                                  mx={3}
                                />

                                <Text
                                  minW={5}
                                  py={2}
                                  textStyle="p2"
                                  textAlign="center"
                                  color="neutral.800"
                                  bgColor="white.core"
                                >
                                  {item.availableQuantity}
                                </Text>
                              </Flex>
                            ))}
                          </Box>
                        );
                      },
                    )}
                  </Box>
                </Box>
              )}

              {!isCreatingNewOrder && (
                <Button
                  textStyle="p2"
                  fontWeight={600}
                  bg={'blue.hover'}
                  color={'white'}
                  disabled={!selectedManufacturer}
                  onClick={() => setIsCreatingNewOrder(true)}
                  w="40%"
                  ml="auto"
                >
                  Select Manufacturer
                </Button>
              )}

              {manufacturerItems && isCreatingNewOrder && (
                <Box>
                  <Text {...sectionTitleStyles} my={3} mb={6}>
                    {selectedManufacturer?.foodManufacturerName} Stock
                  </Text>
                  {Object.entries(groupedDonationItems).map(
                    ([foodType, items]) => {
                      return (
                        <Box key={foodType} mb={4}>
                          <HStack gap={2} align="center" mb={2}>
                            <Text {...sectionTitleStyles}>{foodType}</Text>
                          </HStack>
                          {items.map((item) => (
                            <Flex
                              border="1px solid"
                              borderColor="neutral.100"
                              borderRadius="md"
                              px={4}
                              align="center"
                              mt="2"
                              key={item.itemId}
                            >
                              <Text
                                py={2}
                                textStyle="p2"
                                color="neutral.800"
                                flex={1}
                              >
                                {item.itemName}
                              </Text>

                              <Box
                                alignSelf="stretch"
                                borderLeft="1px solid"
                                borderColor="neutral.100"
                                mx={3}
                              />

                              <Input
                                type="number"
                                step={1}
                                _focusVisible={{
                                  outline: 'none',
                                }}
                                border="none"
                                value={itemAllocations[item.itemId]}
                                min={1}
                                max={item.availableQuantity}
                                onChange={(e) => {
                                  let value = Number(e.target.value);

                                  // Limit value to be between 1 and availableQuantity
                                  if (isNaN(value) || value < 1) value = 1;
                                  if (value > item.availableQuantity)
                                    value = item.availableQuantity;

                                  setItemAllocations((prev) => ({
                                    ...prev,
                                    [item.itemId]: value,
                                  }));
                                }}
                                w="80px"
                              />
                            </Flex>
                          ))}
                        </Box>
                      );
                    },
                  )}
                </Box>
              )}

              {isCreatingNewOrder && (
                <Flex justifyContent="flex-end" mt={2} gap={2.5}>
                  <Button
                    textStyle="p2"
                    fontWeight={600}
                    color="neutral.800"
                    variant="outline"
                    borderColor="neutral.200"
                    onClick={() => {
                      setIsCreatingNewOrder(false);
                      setSelectedManufacturer(null);
                      setManufacturerItems(null);
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    textStyle="p2"
                    fontWeight={600}
                    bg={'blue.hover'}
                    color={'white'}
                    onClick={onSubmitNewOrder}
                  >
                    Continue
                  </Button>
                </Flex>
              )}
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default CreateNewOrderModal;
