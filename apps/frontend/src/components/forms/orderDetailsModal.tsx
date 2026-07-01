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
  FoodType,
} from '../../types/types';
import { TagGroup } from './tagGroup';
import { useGroupedItemsByFoodType } from '../../hooks/groupedItemsByFoodType';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';
import { EditButton, DeleteButton } from '@components/editDeleteButtons';

interface OrderDetailsModalProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onDelete?: (order: OrderDetails) => void;
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
    if (isOpen && orderId !== null) {
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
    if (isOpen && orderId !== null) {
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
  // The item whose allocation box is currently being edited (focused).
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const groupedManufacturerItems = useGroupedItemsByFoodType(manufacturerItems);

  // This order's current allocation per item, keyed by itemId
  const currentAllocations = useMemo(() => {
    const map: Record<number, number> = {};
    orderDetails?.items.forEach((item) => {
      map[item.id] = item.quantity;
    });
    return map;
  }, [orderDetails]);

  const handleEdit = async () => {
    if (orderId === null) return;
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
    if (orderId === null) return;
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
        if (!e.open) {
          handleCancel();
          onClose();
        }
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
      {orderId !== null && (
        <Dialog.Positioner>
          <Dialog.Content maxW={650} maxH="90vh">
            <Dialog.Header pb={0} mt={2}>
              <Dialog.Title fontSize="lg" fontWeight={600} fontFamily="inter">
                Order #{orderId}
              </Dialog.Title>
              {!isEditing &&
                currentUser?.role === Role.VOLUNTEER &&
                orderDetails?.status === OrderStatus.PENDING && (
                  <>
                    <EditButton onClick={handleEdit} />
                    <DeleteButton
                      onClick={() => orderDetails && onDelete?.(orderDetails)}
                    />
                  </>
                )}
            </Dialog.Header>
            <Dialog.Body overflowY="auto">
              <Text textStyle="p2" color="gray.dark">
                Fulfilled by {orderDetails?.foodManufacturerName}
              </Text>

              {isEditing ? (
                <Box mt={5}>
                  <Text {...sectionTitleStyles} mb={5}>
                    {orderDetails?.foodManufacturerName} Stock
                  </Text>
                  <Box maxH="55vh" overflowY="auto" pr={1}>
                    {Object.entries(groupedManufacturerItems).map(
                      ([foodType, items]) => (
                        <Box key={foodType} mb={5}>
                          <Flex align="center" gap={1} mb={1.5}>
                            <Text {...sectionTitleStyles}>{foodType}</Text>
                            {foodRequest?.requestedFoodTypes.includes(
                              foodType as FoodType,
                            ) && (
                              <Badge
                                bgColor="teal.200"
                                color="teal.hover"
                                fontSize="10px"
                                fontWeight={500}
                                borderRadius="4px"
                                px={1}
                                py={0}
                              >
                                Matching
                              </Badge>
                            )}
                          </Flex>
                          {items.map((item) => (
                            <Flex
                              border="1px solid"
                              borderColor="neutral.100"
                              borderRadius="4px"
                              h="40px"
                              align="center"
                              overflow="hidden"
                              mt="1.5"
                              key={item.itemId}
                            >
                              <Text
                                pl={3}
                                textStyle="p2"
                                color="neutral.800"
                                flex={1}
                              >
                                {item.itemName}
                              </Text>

                              <Flex
                                alignSelf="stretch"
                                w="72px"
                                align="center"
                                justify="center"
                                borderLeft="1px solid"
                                borderColor="neutral.100"
                                bg="#fefefe"
                                cursor="text"
                                onClick={() => setEditingItemId(item.itemId)}
                              >
                                {editingItemId === item.itemId ? (
                                  <Input
                                    autoFocus
                                    inputMode="numeric"
                                    _focusVisible={{ outline: 'none' }}
                                    border="none"
                                    textAlign="center"
                                    px={0}
                                    h="full"
                                    w="full"
                                    value={itemAllocations[item.itemId] ?? 0}
                                    onChange={(e) =>
                                      setItemAllocations((prev) => ({
                                        ...prev,
                                        [item.itemId]: Number(e.target.value),
                                      }))
                                    }
                                    onBlur={() => setEditingItemId(null)}
                                  />
                                ) : (
                                  <Text
                                    textStyle="p2"
                                    color={
                                      (itemAllocations[item.itemId] ?? 0) >
                                      item.quantity - item.reservedQuantity
                                        ? 'red.core'
                                        : 'neutral.800'
                                    }
                                  >
                                    {itemAllocations[item.itemId] ?? 0} of{' '}
                                    {item.quantity - item.reservedQuantity}
                                  </Text>
                                )}
                              </Flex>
                            </Flex>
                          ))}
                        </Box>
                      ),
                    )}
                  </Box>
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
                    <Button onClick={handleSave} bg="blue.hover" color="white">
                      Update Order
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
                            <Text {...sectionTitleStyles}>
                              Size of Shipment
                            </Text>
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
                              borderRadius="4px"
                              h="40px"
                              align="center"
                              overflow="hidden"
                              mt="2"
                              key={item.id}
                            >
                              <Text
                                pl={3}
                                textStyle="p2"
                                color="neutral.800"
                                flex={1}
                              >
                                {item.name}
                              </Text>

                              <Flex
                                alignSelf="stretch"
                                w="43px"
                                align="center"
                                justify="center"
                                borderLeft="1px solid"
                                borderColor="neutral.100"
                              >
                                <Text textStyle="p2" color="neutral.800">
                                  {item.quantity}
                                </Text>
                              </Flex>
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
      )}
    </Dialog.Root>
  );
};

export default OrderDetailsModal;
