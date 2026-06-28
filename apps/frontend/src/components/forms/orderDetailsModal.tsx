import React, { useState, useEffect, useMemo } from 'react';
import {
  Text,
  Dialog,
  CloseButton,
  Flex,
  Field,
  Box,
  Badge,
  Tabs,
  Menu,
  Link,
  Input,
  Button,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import {
  FoodRequestSummaryDto,
  OrderItemDetailsGroupedByFoodType,
  OrderDetails,
  OrderDonationItemDto,
} from 'types/types';
import {
  FoodRequestStatus,
  AlertStatus,
  OrderStatus,
  Role,
  User,
} from '../../types/types';
import { TagGroup } from './tagGroup';
import { useGroupedItemsByFoodType } from '../../hooks/groupedItemsByFoodType';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';
import { EditButton, DeleteButton } from '@components/editDeleteButtons';

interface OrderDetailsModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  // Optionally used by volunteers for editing/deleting
  onSuccess?: () => void;
  onDelete?: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
}) => {
  useModalBodyCleanup();
  const [foodRequest, setFoodRequest] = useState<FoodRequestSummaryDto | null>(
    null,
  );
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setCurrentUser(await ApiClient.getMe());
      } catch {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  const [alertState, setAlertMessage] = useAlert();

  useEffect(() => {
    if (isOpen) {
      const fetchRequestData = async () => {
        try {
          const foodRequestData = await ApiClient.getFoodRequestFromOrder(
            orderId,
          );
          setFoodRequest(foodRequestData);
        } catch {
          setAlertMessage(
            'Error fetching food request details',
            AlertStatus.ERROR,
          );
        }
      };

      fetchRequestData();
    }
  }, [isOpen, orderId, setAlertMessage]);

  useEffect(() => {
    if (isOpen) {
      const fetchOrderDetails = async () => {
        try {
          const orderDetailsData = await ApiClient.getOrder(orderId);
          setOrderDetails(orderDetailsData);
        } catch {
          setAlertMessage('Error fetching order details', AlertStatus.ERROR);
        }
      };

      fetchOrderDetails();
    }
  }, [isOpen, orderId, setAlertMessage]);

  const groupedOrderItemsByType: OrderItemDetailsGroupedByFoodType =
    useGroupedItemsByFoodType(orderDetails?.items);

  const [isEditing, setIsEditing] = useState(false);
  const [manufacturerItems, setManufacturerItems] = useState<
    OrderDonationItemDto[]
  >([]);
  const [itemAllocations, setItemAllocations] = useState<
    Record<number, number>
  >({});

  const groupedManufacturerItems = useGroupedItemsByFoodType(manufacturerItems);

  // This order's current allocation per item, keyed by itemId (OrderItemDetails.id)
  const currentAllocations = useMemo(() => {
    const map: Record<number, number> = {};
    orderDetails?.items.forEach((item) => {
      map[item.id] = item.quantity;
    });
    return map;
  }, [orderDetails]);

  const handleEdit = async () => {
    try {
      const items = await ApiClient.getOrderDonationItems(orderId);
      setManufacturerItems(items);
      const initial: Record<number, number> = {};
      items.forEach((item) => {
        initial[item.itemId] = currentAllocations[item.itemId] ?? 0;
      });
      setItemAllocations(initial);
      setIsEditing(true);
    } catch {
      setAlertMessage('Error loading donation items', AlertStatus.ERROR);
    }
  };

  const handleCancel = () => {
    setItemAllocations({});
    setManufacturerItems([]);
    setIsEditing(false);
  };

  // Only allocations of at least 1 are sent; omitted items (0) are freed/deleted by the backend.
  const allocationsBody = Object.entries(itemAllocations)
    .filter(([, quantity]) => quantity >= 1)
    .map(([itemId, quantity]) => ({
      donationItemId: Number(itemId),
      allocatedQuantity: quantity,
    }));

  const handleSave = async () => {
    try {
      await ApiClient.editAllocations(orderId, {
        allocations: allocationsBody,
      });
      const refreshed = await ApiClient.getOrder(orderId);
      setOrderDetails(refreshed);
      onSuccess?.();
      setIsEditing(false);
      setAlertMessage('Successfully updated order.', AlertStatus.INFO);
    } catch {
      setAlertMessage('Order could not be updated.', AlertStatus.ERROR);
    }
  };

  const sectionTitleStyles = {
    textStyle: 'p2',
    fontWeight: '600',
    color: 'neutral.800',
  };

  const badgeStyles = {
    py: '1',
    px: '2',
    textStyle: 'p2',
    fontSize: '12px',
    fontWeight: '500',
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
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW={650}>
          <Dialog.Header pb={0} mt={2}>
            <Dialog.Title fontSize="lg" fontWeight={600} fontFamily="inter">
              Order #{orderId}
            </Dialog.Title>
            {!isEditing &&
              currentUser?.role === Role.VOLUNTEER &&
              orderDetails?.status === OrderStatus.PENDING && (
                <>
                  <EditButton onClick={handleEdit} />
                  <DeleteButton onClick={() => onDelete?.()} />
                </>
              )}
          </Dialog.Header>
          <Dialog.Body>
            <Text textStyle="p2" color="gray.dark">
              Fulfilled by {orderDetails?.foodManufacturerName}
            </Text>

            {isEditing ? (
              <Box mt={5}>
                <Text {...sectionTitleStyles} mb={6}>
                  Add the amount of each product you would like in this order.
                </Text>
                {Object.entries(groupedManufacturerItems).map(
                  ([foodType, items]) => (
                    <Box key={foodType} mb={4}>
                      <Text {...sectionTitleStyles} mb={2}>
                        {foodType}
                      </Text>
                      {items.map((item) => {
                        const maxSelectable =
                          item.quantity -
                          item.reservedQuantity +
                          (currentAllocations[item.itemId] ?? 0);
                        return (
                          <Flex
                            border="1px solid"
                            borderColor="neutral.100"
                            borderRadius="md"
                            pl={4}
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
                              _focusVisible={{ outline: 'none' }}
                              border="none"
                              textAlign="center"
                              value={itemAllocations[item.itemId] ?? 0}
                              min={0}
                              max={maxSelectable}
                              onChange={(e) => {
                                let value = Number(e.target.value);
                                if (Number.isNaN(value) || value < 0) value = 0;
                                if (value > maxSelectable)
                                  value = maxSelectable;
                                setItemAllocations((prev) => ({
                                  ...prev,
                                  [item.itemId]: value,
                                }));
                              }}
                              w="80px"
                            />
                          </Flex>
                        );
                      })}
                    </Box>
                  ),
                )}
                <Flex justifyContent="flex-end" mt={4} gap={2}>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    background="bg"
                    color="neutral.800"
                    borderColor="neutral.200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={allocationsBody.length === 0}
                    bg="blue.hover"
                    color="white"
                  >
                    Save Changes
                  </Button>
                </Flex>
              </Box>
            ) : (
              <Tabs.Root unstyled mt={5} fitted defaultValue="orderDetails">
                <Tabs.List maxW="60%">
                  <Tabs.Trigger
                    textStyle="p2"
                    px={4}
                    py={1}
                    color="neutral.800"
                    value="orderDetails"
                    borderBottom="1.5px solid"
                    borderColor="neutral.100"
                    _selected={{ borderColor: 'neutral.700' }}
                  >
                    Order Details
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    textStyle="p2"
                    px={4}
                    py={1}
                    color="neutral.800"
                    value="associatedRequest"
                    borderBottom="1.5px solid"
                    borderColor="neutral.100"
                    _selected={{ borderColor: 'neutral.700' }}
                  >
                    Associated Request
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="associatedRequest">
                  {!foodRequest && (
                    <Text mt={5} textStyle="p2">
                      {' '}
                      No associated food request to display{' '}
                    </Text>
                  )}

                  {foodRequest && (
                    <Box
                      borderWidth="1px"
                      borderColor="neutral.100"
                      borderRadius="5px"
                      p={3}
                      mt={6}
                    >
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text {...sectionTitleStyles}>
                          Request {foodRequest.requestId} -
                          <Text as="span" color="neutral.800" textStyle="p2">
                            {' '}
                            {foodRequest.pantry.pantryName}
                          </Text>
                        </Text>
                        {foodRequest.status === FoodRequestStatus.CLOSED ? (
                          <Badge
                            {...badgeStyles}
                            bgColor="yellow.200"
                            color="yellow.hover"
                          >
                            Closed
                          </Badge>
                        ) : (
                          <Badge
                            {...badgeStyles}
                            bgColor="teal.200"
                            color="teal.hover"
                          >
                            Active
                          </Badge>
                        )}
                      </Flex>

                      <Field.Root mb={4} mt={6}>
                        <Field.Label>
                          <Text {...sectionTitleStyles}>Size of Shipment</Text>
                        </Field.Label>
                        <Menu.Root>
                          <Text textStyle="p2" color="neutral.800" mt={3}>
                            {foodRequest.requestedSize}
                          </Text>
                        </Menu.Root>
                      </Field.Root>

                      <Field.Root mb={4} mt={3}>
                        <Field.Label>
                          <Text {...sectionTitleStyles} mt={3}>
                            Food Type(s)
                          </Text>
                        </Field.Label>

                        {foodRequest.requestedFoodTypes.length > 0 && (
                          <TagGroup values={foodRequest.requestedFoodTypes} />
                        )}
                      </Field.Root>

                      <Field.Root mb={4}>
                        <Field.Label>
                          <Text {...sectionTitleStyles} mt={3}>
                            Additional Information
                          </Text>
                        </Field.Label>
                        <Text textStyle="p2" color="neutral.800" mt={3}>
                          {foodRequest.additionalInformation}
                        </Text>
                      </Field.Root>
                    </Box>
                  )}
                </Tabs.Content>

                <Tabs.Content value="orderDetails" mt={6}>
                  {Object.entries(groupedOrderItemsByType).map(
                    ([foodType, items]) => (
                      <Box key={foodType} mb={4}>
                        <Text {...sectionTitleStyles}>{foodType}</Text>
                        {items.map((item) => (
                          <Flex
                            border="1px solid"
                            borderColor="neutral.100"
                            borderRadius="md"
                            px={4}
                            align="center"
                            mt="2"
                            key={item.id}
                          >
                            <Text
                              py={2}
                              textStyle="p2"
                              color="neutral.800"
                              flex={1}
                            >
                              {item.name}
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
                              color="neutral.800"
                            >
                              {item.quantity}
                            </Text>
                          </Flex>
                        ))}
                      </Box>
                    ),
                  )}
                  <Text {...sectionTitleStyles} mt="3">
                    Tracking
                  </Text>
                  {orderDetails?.trackingLink ? (
                    <Link
                      href={orderDetails.trackingLink}
                      color="teal.ssf"
                      variant="underline"
                      mt="3"
                      mb="3"
                    >
                      {orderDetails.trackingLink}
                    </Link>
                  ) : (
                    <Text color="neutral.700" textStyle="p2" mt="3" mb="3">
                      No tracking link available at this time
                    </Text>
                  )}
                </Tabs.Content>
              </Tabs.Root>
            )}
          </Dialog.Body>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="lg" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default OrderDetailsModal;
