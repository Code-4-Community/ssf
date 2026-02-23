import React, { useState, useEffect, useMemo } from 'react';
import {
  Text,
  Dialog,
  CloseButton,
  Flex,
  Field,
  Tag,
  Box,
  Badge,
  Tabs,
  Menu,
  Link,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import {
  FoodRequest,
  FoodTypes,
  OrderDetails,
  OrderItemDetails,
} from 'types/types';
import { OrderStatus } from '../../types/types';
import { TagGroup } from './tagGroup';

interface OrderDetailsModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const [foodRequest, setFoodRequest] = useState<FoodRequest | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>();

  useEffect(() => {
    if (isOpen) {
      const fetchRequestData = async () => {
        try {
          const foodRequestData = await ApiClient.getFoodRequestFromOrder(
            orderId,
          );
          setFoodRequest(foodRequestData);
        } catch (error) {
          alert('Error fetching food request details:' + error);
        }
      };

      fetchRequestData();
    }
  }, [isOpen, orderId]);

  useEffect(() => {
    if (isOpen) {
      const fetchOrderDetails = async () => {
        try {
          const orderDetailsData = await ApiClient.getOrderDetails(orderId);
          setOrderDetails(orderDetailsData);
        } catch (error) {
          alert('Error fetching order details:' + error);
        }
      };

      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const groupedOrderItemsByType = useMemo(() => {
    if (!orderDetails) return {};

    return orderDetails.items.reduce(
      (acc: Record<(typeof FoodTypes)[number], OrderItemDetails[]>, item) => {
        if (!acc[item.foodType]) acc[item.foodType] = [];
        acc[item.foodType].push(item);
        return acc;
      },
      {} as Record<(typeof FoodTypes)[number], OrderItemDetails[]>,
    );
  }, [orderDetails]);

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
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW={650}>
          <Dialog.Header pb={0} mt={2}>
            <Dialog.Title fontSize="lg" fontWeight={600} fontFamily="inter">
              Order #{orderId}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text textStyle="p2" color="#111111">
              Fulfilled by {orderDetails?.foodManufacturerName}
            </Text>

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
                          {foodRequest.pantry?.pantryName}
                        </Text>
                      </Text>
                      {orderDetails?.status === OrderStatus.DELIVERED ? (
                        <Badge
                          {...badgeStyles}
                          bgColor="#FEECD1"
                          color="#9C5D00"
                        >
                          Closed
                        </Badge>
                      ) : (
                        <Badge
                          {...badgeStyles}
                          bgColor="teal.200"
                          color="#19717D"
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

                      {foodRequest.requestedItems.length > 0 && (
                        <TagGroup values={foodRequest.requestedItems} />
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
                {Object.entries(
                  groupedOrderItemsByType as Record<string, OrderItemDetails[]>,
                ).map(([foodType, items]) => (
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
                ))}
                <Text {...sectionTitleStyles} mt="3">
                  Tracking
                </Text>
                {orderDetails?.trackingLink ? (
                  <Link
                    href={orderDetails.trackingLink}
                    color="#2795A5"
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
