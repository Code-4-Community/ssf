import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Flex,
  Input,
  Dialog,
  CloseButton,
  Pagination,
  ButtonGroup,
  IconButton,
  Table,
  Checkbox,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ApiClient from '@api/apiClient';
import {
  DonationDetails,
  OrderDetails,
  ConfirmDonationItemDetailsDto,
} from '../../types/types';
import { useGroupedItemsByFoodType } from '../../hooks/groupedItemsByFoodType';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';

type Stage = 'shipping' | 'itemDetails';

interface FmCompleteRequiredActionsModalProps {
  donation: DonationDetails;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderFormData {
  shippingCost: string;
  trackingLink: string;
}

interface ItemFormData {
  ozPerItem: string;
  estimatedValue: string;
  foodRescue: boolean;
}

// Order items section
const OrderItemsSection: React.FC<{
  orderDetails: OrderDetails | undefined;
}> = ({ orderDetails }) => {
  const groupedItems = useGroupedItemsByFoodType(orderDetails?.items);

  if (!orderDetails) {
    return (
      <Text fontSize="sm" color="neutral.500" mt={3}>
        Loading order details...
      </Text>
    );
  }

  return (
    <Box
      overflowY="auto"
      maxH="150px"
      mt={2}
      css={{
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      {Object.entries(groupedItems).map(([foodType, items]) => (
        <Box key={foodType} mb={3}>
          <Text fontWeight="600" fontSize="sm" color="neutral.800" mt={3}>
            {foodType}
          </Text>
          {items.map((item) => (
            <Flex
              key={item.id}
              border="1px solid"
              borderColor="neutral.100"
              borderRadius="md"
              px={3}
              align="center"
              mt={1}
            >
              <Text py={2} fontSize="sm" color="neutral.800" flex={1}>
                {item.name}
              </Text>
              <Box
                alignSelf="stretch"
                borderLeft="1px solid"
                borderColor="neutral.100"
                mx={2}
              />
              <Text py={2} fontSize="sm" color="neutral.800" minW={5}>
                {item.quantity}
              </Text>
            </Flex>
          ))}
        </Box>
      ))}
    </Box>
  );
};

const FmCompleteRequiredActionsModal: React.FC<
  FmCompleteRequiredActionsModalProps
> = ({ donation, isOpen, onClose, onSuccess }) => {
  const orders = donation.associatedPendingOrders;
  const items = donation.relevantDonationItems;
  const hasItemsToConfirm = items.length > 0;

  const [stage, setStage] = useState<Stage>('shipping');
  const [currentPage, setCurrentPage] = useState(1);
  const [orderFormData, setOrderFormData] = useState<
    Record<number, OrderFormData>
  >(() =>
    Object.fromEntries(
      orders.map((o) => [o.orderId, { shippingCost: '', trackingLink: '' }]),
    ),
  );
  const [itemFormData, setItemFormData] = useState<
    Record<number, ItemFormData>
  >(() =>
    Object.fromEntries(
      items.map((item) => [
        item.itemId,
        { ozPerItem: '', estimatedValue: '', foodRescue: false },
      ]),
    ),
  );
  const [orderDetailsMap, setOrderDetailsMap] = useState<
    Record<number, OrderDetails>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertMessage] = useAlert();

  const currentOrder = orders[currentPage - 1];

  useEffect(() => {
    const fetchAllOrderDetails = async () => {
      try {
        const fetchedDetails = await Promise.all(
          orders.map((order) => ApiClient.getOrder(order.orderId)),
        );
        const detailsMap: Record<number, OrderDetails> = {};
        orders.forEach((order, i) => {
          detailsMap[order.orderId] = fetchedDetails[i];
        });
        setOrderDetailsMap(detailsMap);
      } catch {
        setAlertMessage('Error fetching order details. Please try again.');
      }
    };

    fetchAllOrderDetails();
  }, []);

  const updateOrderField = (
    orderId: number,
    field: keyof OrderFormData,
    value: string,
  ) => {
    setOrderFormData((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], [field]: value },
    }));
  };

  const updateItemField = (
    itemId: number,
    field: keyof ItemFormData,
    value: string | boolean,
  ) => {
    setItemFormData((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const areOrderFieldsFilled = orders.every(
    (order) =>
      orderFormData[order.orderId].trackingLink.trim() !== '' &&
      orderFormData[order.orderId].shippingCost !== '',
  );

  const areItemFieldsFilled = items.every(
    (item) =>
      itemFormData[item.itemId].ozPerItem !== '' &&
      itemFormData[item.itemId].estimatedValue !== '',
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (hasItemsToConfirm) {
        const confirmItems: ConfirmDonationItemDetailsDto[] = items.map(
          (item) => ({
            itemId: item.itemId,
            ozPerItem: parseFloat(itemFormData[item.itemId].ozPerItem),
            estimatedValue: parseFloat(
              itemFormData[item.itemId].estimatedValue,
            ),
            foodRescue: itemFormData[item.itemId].foodRescue,
          }),
        );
        await ApiClient.confirmDonationItemDetails(
          donation.donation.donationId,
          confirmItems,
        );
      }

      await ApiClient.bulkUpdateTrackingCostInfo({
        donationId: donation.donation.donationId,
        orders: orders.map((order) => ({
          orderId: order.orderId,
          trackingLink: orderFormData[order.orderId].trackingLink,
          shippingCost: parseFloat(orderFormData[order.orderId].shippingCost),
        })),
      });

      onSuccess();
    } catch (error) {
      const rawMsg = axios.isAxiosError(error) && error.response?.data?.message;
      const msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg;
      // Strip out nested validation for the orders for cleaner message
      setAlertMessage(
        msg
          ? msg.replace(/^orders\.\d+\./, '')
          : 'Error completing required actions. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentOrder) return null;

  const tableHeaderStyles = {
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
    color: 'neutral.800',
    fontFamily: 'ibm',
    fontWeight: '600',
    fontSize: 'sm',
    py: 2,
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="lg"
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
        <Dialog.Content maxH="90vh">
          <Dialog.CloseTrigger asChild>
            <CloseButton size="lg" />
          </Dialog.CloseTrigger>

          <Dialog.Header pb={0}>
            <Dialog.Title fontSize="lg" fontWeight={600}>
              Complete Required Actions
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body overflowY="auto" pb={6}>
            {stage === 'shipping' && (
              <>
                <Text fontSize="sm" color="neutral.700" mt={1}>
                  Your donation has been partially matched to a pantry's food
                  request. Please check your inbox for details on where to ship
                  the following quantities of products, then provide the
                  shipping cost and tracking links for the following delivery.
                </Text>

                <Box mt={4}>
                  <Text fontWeight="600" fontSize="sm" color="neutral.800">
                    Shipping Cost
                    <Text as="span" color="red">
                      *
                    </Text>
                  </Text>
                  <Input
                    mt={1}
                    placeholder="Enter shipping cost"
                    type="number"
                    min={0}
                    step={0.01}
                    value={orderFormData[currentOrder.orderId].shippingCost}
                    onChange={(e) =>
                      updateOrderField(
                        currentOrder.orderId,
                        'shippingCost',
                        e.target.value,
                      )
                    }
                  />
                </Box>

                <Box mt={4}>
                  <Text fontWeight="600" fontSize="sm" color="neutral.800">
                    Delivery Tracking Link
                    <Text as="span" color="red">
                      *
                    </Text>
                  </Text>
                  <Input
                    mt={1}
                    placeholder="Enter tracking link"
                    value={orderFormData[currentOrder.orderId].trackingLink}
                    onChange={(e) =>
                      updateOrderField(
                        currentOrder.orderId,
                        'trackingLink',
                        e.target.value,
                      )
                    }
                  />
                </Box>

                <Box
                  mt={4}
                  border="1px solid"
                  borderColor="neutral.100"
                  borderRadius="md"
                  p={4}
                >
                  <Text fontWeight="600" fontSize="sm" color="neutral.800">
                    Order {currentOrder.orderId} -{' '}
                    <Text as="span" fontWeight="400">
                      Requested by {currentOrder.pantryName}
                    </Text>
                  </Text>
                  <OrderItemsSection
                    orderDetails={orderDetailsMap[currentOrder.orderId]}
                  />
                </Box>

                {orders.length > 1 && (
                  <Flex justify="center" mt={4}>
                    <Pagination.Root
                      count={orders.length}
                      pageSize={1}
                      page={currentPage}
                      onPageChange={(e: { page: number }) =>
                        setCurrentPage(e.page)
                      }
                    >
                      <ButtonGroup
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        variant="outline"
                        size="sm"
                        gap={4}
                      >
                        <Pagination.PrevTrigger
                          color="neutral.800"
                          _hover={{ color: 'black' }}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft
                            size={16}
                            style={{
                              cursor: currentPage !== 1 ? 'pointer' : 'default',
                            }}
                          />
                        </Pagination.PrevTrigger>

                        <Pagination.Items
                          render={(page) => (
                            <IconButton
                              borderColor={{
                                base: 'neutral.100',
                                _selected: 'neutral.600',
                              }}
                            >
                              {page.value}
                            </IconButton>
                          )}
                        />

                        <Pagination.NextTrigger
                          color="neutral.800"
                          _hover={{ color: 'black' }}
                          disabled={currentPage === orders.length}
                        >
                          <ChevronRight
                            size={16}
                            style={{
                              cursor:
                                currentPage !== orders.length
                                  ? 'pointer'
                                  : 'default',
                            }}
                          />
                        </Pagination.NextTrigger>
                      </ButtonGroup>
                    </Pagination.Root>
                  </Flex>
                )}

                <Flex justify="flex-end" gap={3} mt={6} pt={4}>
                  <Button
                    variant="outline"
                    color="gray.700"
                    fontWeight={600}
                    onClick={onClose}
                    size="md"
                  >
                    Cancel
                  </Button>
                  {hasItemsToConfirm ? (
                    <Button
                      backgroundColor="blue.ssf"
                      color="neutral.50"
                      fontWeight={600}
                      size="md"
                      disabled={!areOrderFieldsFilled}
                      _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                      onClick={() => setStage('itemDetails')}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      backgroundColor="blue.ssf"
                      color="neutral.50"
                      fontWeight={600}
                      size="md"
                      disabled={!areOrderFieldsFilled || isSubmitting}
                      _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                      loading={isSubmitting}
                      onClick={handleSubmit}
                    >
                      Complete Actions
                    </Button>
                  )}
                </Flex>
              </>
            )}

            {stage === 'itemDetails' && (
              <>
                <Text fontSize="sm" color="neutral.700" mt={1}>
                  Please fill out the missing fields information to record
                  donation details.
                </Text>

                <Box mt={4} display="block" overflowX="auto">
                  <Table.Root
                    variant="line"
                    size="md"
                    style={{ borderCollapse: 'collapse' }}
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader {...tableHeaderStyles} width="40%">
                          Food Item
                        </Table.ColumnHeader>
                        <Table.ColumnHeader {...tableHeaderStyles} width="18%">
                          Oz. per item
                          <Text as="span" color="red">
                            *
                          </Text>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader {...tableHeaderStyles} width="18%">
                          Donation Value
                          <Text as="span" color="red">
                            *
                          </Text>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          {...tableHeaderStyles}
                          width="24%"
                          textAlign="center"
                        >
                          Food Rescue
                          <Text as="span" color="red">
                            *
                          </Text>
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {items.map((item) => (
                        <Table.Row key={item.itemId}>
                          <Table.Cell
                            borderBottom="1px solid"
                            borderColor="neutral.100"
                            fontSize="sm"
                            color="neutral.800"
                            py={2}
                          >
                            {item.itemName}
                          </Table.Cell>
                          <Table.Cell
                            borderBottom="1px solid"
                            borderColor="neutral.100"
                            py={1}
                            pr={3}
                          >
                            <Input
                              size="sm"
                              type="number"
                              min={0.01}
                              step={0.01}
                              placeholder="0.00"
                              value={itemFormData[item.itemId].ozPerItem}
                              onChange={(e) =>
                                updateItemField(
                                  item.itemId,
                                  'ozPerItem',
                                  e.target.value,
                                )
                              }
                            />
                          </Table.Cell>
                          <Table.Cell
                            borderBottom="1px solid"
                            borderColor="neutral.100"
                            py={1}
                            pr={3}
                          >
                            <Input
                              size="sm"
                              type="number"
                              min={0.01}
                              step={0.01}
                              placeholder="0.00"
                              value={itemFormData[item.itemId].estimatedValue}
                              onChange={(e) =>
                                updateItemField(
                                  item.itemId,
                                  'estimatedValue',
                                  e.target.value,
                                )
                              }
                            />
                          </Table.Cell>
                          <Table.Cell
                            borderBottom="1px solid"
                            borderColor="neutral.100"
                            py={1}
                            textAlign="center"
                          >
                            <Checkbox.Root
                              checked={itemFormData[item.itemId].foodRescue}
                              size="lg"
                              borderRadius="2px"
                              onCheckedChange={(e: { checked: boolean }) =>
                                updateItemField(
                                  item.itemId,
                                  'foodRescue',
                                  !!e.checked,
                                )
                              }
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control
                                borderRadius="2px"
                                borderColor="#E4E4E7"
                              >
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                            </Checkbox.Root>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>

                <Flex justify="flex-end" gap={3} mt={6} pt={4}>
                  <Button
                    variant="outline"
                    color="neutral.800"
                    fontWeight={600}
                    size="md"
                    onClick={() => setStage('shipping')}
                  >
                    Back
                  </Button>
                  <Button
                    backgroundColor="blue.ssf"
                    color="neutral.50"
                    fontWeight={600}
                    size="md"
                    disabled={!areItemFieldsFilled || isSubmitting}
                    _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                    loading={isSubmitting}
                    onClick={handleSubmit}
                  >
                    Complete Actions
                  </Button>
                </Flex>
              </>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default FmCompleteRequiredActionsModal;
