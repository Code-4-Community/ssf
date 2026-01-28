import apiClient from '@api/apiClient';
import {
  FoodRequest,
  FoodTypes,
  OrderDetails,
  OrderItemDetails,
} from 'types/types';
import { OrderStatus } from '../../types/types';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Flex,
  Box,
  Menu,
  Text,
  Dialog,
  Tag,
  Field,
  CloseButton,
  Tabs,
  Badge,
  Pagination,
  ButtonGroup,
  IconButton,
} from '@chakra-ui/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface RequestDetailsModalProps {
  request: FoodRequest;
  isOpen: boolean;
  onClose: () => void;
  pantryId: number;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
  pantryId,
}) => {
  const [orderDetailsList, setOrderDetailsList] = useState<OrderDetails[]>([]);
  const [pantryName, setPantryName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const requestedSize = request.requestedSize;
  const selectedItems = request.requestedItems;
  const additionalNotes = request.additionalInformation;

  useEffect(() => {
    const fetchRequestOrderDetails = async () => {
      try {
        const orderDetailsList = await apiClient.getOrderDetailsListFromRequest(
          request.requestId,
        );
        const sortedData = orderDetailsList
          .slice()
          .sort((a, b) => b.orderId - a.orderId);
        setOrderDetailsList(sortedData);
      } catch (error) {
        console.error('Error fetching order details', error);
      }
    };
    fetchRequestOrderDetails();
  }, [isOpen, request.requestId]);

  useEffect(() => {
    const fetchPantryData = async () => {
      try {
        const pantry = await apiClient.getPantry(pantryId);
        setPantryName(pantry.pantryName);
      } catch (error) {
        console.error('Error fetching pantry data', error);
      }
    };
    fetchPantryData();
  }, [pantryId]);

  const currentOrder = orderDetailsList[currentPage - 1];

  const groupedOrderItemsByType = useMemo(() => {
    if (!currentOrder) return {};

    return currentOrder.items.reduce(
      (acc: Record<(typeof FoodTypes)[number], OrderItemDetails[]>, item) => {
        if (!acc[item.foodType]) acc[item.foodType] = [];
        acc[item.foodType].push(item);
        return acc;
      },
      {} as Record<(typeof FoodTypes)[number], OrderItemDetails[]>,
    );
  }, [currentOrder]);

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
              Food Request #{request.requestId}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text textStyle="p2" color="#111111">
              {pantryName}
            </Text>

            <Tabs.Root mt={5} defaultValue="requestDetails">
              <Tabs.List>
                <Tabs.Trigger
                  textStyle="p2"
                  color="neutral.800"
                  value="requestDetails"
                >
                  Request Details
                </Tabs.Trigger>
                <Tabs.Trigger
                  textStyle="p2"
                  color="neutral.800"
                  value="associatedOrders"
                >
                  Associated Orders
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="requestDetails">
                <Field.Root mb={4} mt={3}>
                  <Field.Label>
                    <Text textStyle="p2" fontWeight={600} color="neutral.800">
                      Size of Shipment
                    </Text>
                  </Field.Label>
                  <Menu.Root>
                    <Text textStyle="p2" color="neutral.800" mt={3}>
                      {requestedSize}
                    </Text>
                  </Menu.Root>
                </Field.Root>

                <Field.Root mb={4} mt={3}>
                  <Field.Label>
                    <Text
                      textStyle="p2"
                      fontWeight={600}
                      color="neutral.800"
                      mt={3}
                    >
                      Food Type(s)
                    </Text>
                  </Field.Label>

                  {selectedItems.length > 0 && (
                    <Flex wrap="wrap" mt={3} gap={2}>
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
                        </Tag.Root>
                      ))}
                    </Flex>
                  )}
                </Field.Root>

                <Field.Root mb={4}>
                  <Field.Label>
                    <Text
                      textStyle="p2"
                      fontWeight={600}
                      color="neutral.800"
                      mt={3}
                    >
                      Additional Information
                    </Text>
                  </Field.Label>
                  <Text textStyle="p2" color="neutral.800" mt={3}>
                    {additionalNotes}
                  </Text>
                </Field.Root>
              </Tabs.Content>

              <Tabs.Content value="associatedOrders">
                {currentOrder && (
                  <Box
                    borderWidth="1px"
                    borderColor="neutral.100"
                    borderRadius="5px"
                    p={3}
                    mt={4}
                  >
                    <Flex justify="space-between" align="center" mb={3}>
                      <Text color="neutral.800" textStyle="p2" fontWeight={600}>
                        Order {currentOrder.orderId} -
                        <Text as="span" color="neutral.800" textStyle="p2">
                          {' '}
                          Fulfilled by {currentOrder.foodManufacturerName}
                        </Text>
                      </Text>
                      {currentOrder.status === OrderStatus.DELIVERED ? (
                        <Badge
                          py={1}
                          px={2}
                          bgColor="#EAEDEF"
                          color="#2B4E60"
                          textStyle="p2"
                          fontWeight={500}
                        >
                          Received
                        </Badge>
                      ) : (
                        <Badge
                          py={1}
                          px={2}
                          bgColor="#FEECD1"
                          color="#9C5D00"
                          textStyle="p2"
                          fontWeight={500}
                        >
                          In Progress
                        </Badge>
                      )}
                    </Flex>
                    {Object.entries(
                      groupedOrderItemsByType as Record<
                        string,
                        OrderItemDetails[]
                      >,
                    ).map(([foodType, items]) => (
                      <Box key={foodType} mb={4}>
                        <Text
                          color="neutral.800"
                          textStyle="p2"
                          fontWeight={600}
                        >
                          {foodType}
                        </Text>
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

                            <Text py={2} textStyle="p2" color="neutral.800">
                              {item.quantity}
                            </Text>
                          </Flex>
                        ))}
                      </Box>
                    ))}
                    <Text
                      color="neutral.800"
                      textStyle="p2"
                      fontWeight={600}
                      mt="3"
                    >
                      Tracking
                    </Text>
                    <Text color="neutral.700" textStyle="p2" mt="3" mb="3">
                      No tracking link available at this time
                    </Text>
                  </Box>
                )}

                <Flex justify="center" mt={7}>
                  <Pagination.Root
                    count={orderDetailsList.length}
                    pageSize={1}
                    page={currentPage}
                    onChange={(page) => setCurrentPage(page)}
                  >
                    <ButtonGroup variant="outline" size="sm">
                      <Pagination.PrevTrigger asChild>
                        <IconButton
                          variant="ghost"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                        >
                          <ChevronLeft />
                        </IconButton>
                      </Pagination.PrevTrigger>

                      <Pagination.Items
                        render={(page) => (
                          <IconButton
                            variant={{ base: 'outline', _selected: 'outline' }}
                            onClick={() => setCurrentPage(page.value)}
                          >
                            {page.value}
                          </IconButton>
                        )}
                      />

                      <Pagination.NextTrigger asChild>
                        <IconButton
                          variant="ghost"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(orderDetailsList.length),
                              ),
                            )
                          }
                        >
                          <ChevronRight />
                        </IconButton>
                      </Pagination.NextTrigger>
                    </ButtonGroup>
                  </Pagination.Root>
                </Flex>
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

export default RequestDetailsModal;
