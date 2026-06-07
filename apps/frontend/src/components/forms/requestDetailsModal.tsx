import apiClient from '@api/apiClient';
import {
  OrderItemDetailsGroupedByFoodType,
  OrderDetails,
  FoodRequestSummaryDto,
  FoodRequestStatus,
} from '../../types/types';
import {
  OrderStatus,
  RequestSize,
  FoodType,
  User,
  Role,
} from '../../types/types';
import { ORDER_STATUS_LABELS } from '@utils/utils';
import React, { useState, useEffect } from 'react';
import {
  Flex,
  Box,
  Menu,
  Text,
  Dialog,
  Field,
  CloseButton,
  Tabs,
  Badge,
  Pagination,
  ButtonGroup,
  IconButton,
  HStack,
  Button,
  Textarea,
} from '@chakra-ui/react';
import {
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  ChevronDownIcon,
} from 'lucide-react';
import { TagGroup } from './tagGroup';
import { useGroupedItemsByFoodType } from '../../hooks/groupedItemsByFoodType';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';
import { useAlert } from '../../hooks/alert';
import { FloatingAlert } from '../floatingAlert';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface RequestDetailsModalProps {
  request: FoodRequestSummaryDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
}) => {
  useModalBodyCleanup();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [alertState, setAlertMessage] = useAlert();

  const [orderDetailsList, setOrderDetailsList] = useState<OrderDetails[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [requestedSize, setRequestedSize] = useState<RequestSize>(
    request.requestedSize,
  );
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<FoodType[]>(
    request.requestedFoodTypes,
  );
  const [additionalNotes, setAdditionalNotes] = useState<string>(
    request.additionalInformation ?? '',
  );

  useEffect(() => {
    if (authStatus === 'authenticated') {
      apiClient
        .getMe()
        .then(setCurrentUser)
        .catch(() => setCurrentUser(null));
    } else {
      setCurrentUser(null);
    }
  }, [authStatus]);

  useEffect(() => {
    const fetchRequestOrderDetails = async () => {
      if (!isOpen) return;

      try {
        const orderDetailsList = await apiClient.getOrderDetailsListFromRequest(
          request.requestId,
        );
        const sortedData = orderDetailsList
          .slice()
          .sort((a, b) => b.orderId - a.orderId);
        setOrderDetailsList(sortedData);
      } catch {
        console.error('Error fetching order details');
      }
    };
    fetchRequestOrderDetails();
  }, [isOpen, request.requestId]);

  const pantryName = request.pantry.pantryName;

  let currentOrder = null;
  if (orderDetailsList.length > 0) {
    currentOrder = orderDetailsList[currentPage - 1];
  }

  const groupedOrderItemsByType: OrderItemDetailsGroupedByFoodType =
    useGroupedItemsByFoodType(currentOrder?.items);

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

  const [isEditing, setIsEditing] = useState(false);

  const handleCancel = () => {
    setRequestedSize(request.requestedSize);
    setSelectedFoodTypes(request.requestedFoodTypes);
    setAdditionalNotes(request.additionalInformation ?? '');
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    try {
      await apiClient.updateFoodRequest(request.requestId, {
        requestedSize,
        requestedFoodTypes: selectedFoodTypes,
        additionalInformation: additionalNotes === '' ? null : additionalNotes,
      });
      onSuccess();
      setAlertMessage('Successfully updated food request.');
      setIsEditing(false);
    } catch {
      setAlertMessage('Food request could not be updated.');
    }
  };

  return (
    <>
      {/*
       * TODO: hard-coded as 'info' for now because I worked on another ticket that refactored alertState to have a status
       */}
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="info"
          timeout={6000}
        />
      )}
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
              {!isEditing && request.status === FoodRequestStatus.ACTIVE && (
                <>
                  {currentUser?.role === Role.PANTRY && (
                    <HStack
                      height={6}
                      minWidth={6}
                      padding={0.5}
                      justify="center"
                      align="center"
                      gap={1}
                      borderRadius="sm"
                      color={'gray.800'}
                      background="gray.subtle"
                      cursor="pointer"
                      _hover={{ background: 'neutral.100' }}
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil size={14} />
                    </HStack>
                  )}
                  <HStack
                    width={6}
                    height={6}
                    minWidth={6}
                    padding={0.5}
                    justify="center"
                    align="center"
                    gap={1}
                    flexShrink={0}
                    borderRadius="sm"
                    color="red.700"
                    background="red.subtle"
                    cursor="pointer"
                    _hover={{ background: 'red.200' }}
                    onClick={onDelete}
                  >
                    <Trash2 size={14} />
                  </HStack>
                </>
              )}
            </Dialog.Header>
            <Dialog.Body>
              <Text textStyle="p2" color="gray.dark">
                {pantryName}
              </Text>
              {isEditing ? (
                <>
                  <Field.Root required mt={5} mb={3}>
                    <Field.Label>
                      <Text textStyle="p2" fontWeight={600} color="neutral.800">
                        Size of Shipment
                      </Text>
                    </Field.Label>
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <Button
                          pl={2.5}
                          textStyle="p2"
                          w="full"
                          bgColor="white"
                          color={requestedSize ? 'neutral.800' : 'neutral.300'}
                          borderColor="neutral.100"
                          borderWidth="1px"
                          borderRadius="4px"
                          justifyContent="space-between"
                        >
                          {requestedSize || 'Select size'}
                          <Box color="neutral.300">
                            <ChevronDownIcon />
                          </Box>
                        </Button>
                      </Menu.Trigger>
                      <Menu.Positioner w="full">
                        <Menu.Content>
                          <Menu.RadioItemGroup
                            value={requestedSize}
                            onValueChange={(val: { value: RequestSize }) =>
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

                  <Field.Root mb={3}>
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
                          color="neutral.300"
                          borderColor="neutral.100"
                          borderWidth="1px"
                          borderRadius="4px"
                          justifyContent="space-between"
                          textStyle="p2"
                        >
                          Multi-Select
                          <ChevronDownIcon />
                        </Button>
                      </Menu.Trigger>
                      <Menu.Positioner w="full">
                        <Menu.Content maxH="200px" overflowY="auto">
                          {Object.values(FoodType).map((allergen) => {
                            const isChecked =
                              selectedFoodTypes.includes(allergen);
                            return (
                              <Menu.CheckboxItem
                                key={allergen}
                                checked={isChecked}
                                onCheckedChange={(checked: boolean) =>
                                  setSelectedFoodTypes((prev) =>
                                    checked
                                      ? [...prev, allergen as FoodType]
                                      : prev.filter((i) => i !== allergen),
                                  )
                                }
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
                    <TagGroup
                      values={selectedFoodTypes}
                      onRemove={(value) =>
                        setSelectedFoodTypes((prev) =>
                          prev.filter((i) => i !== value),
                        )
                      }
                    />
                  </Field.Root>

                  <Field.Root mb={5}>
                    <Field.Label>
                      <Text textStyle="p2" fontWeight={600} color="neutral.800">
                        Additional Information
                      </Text>
                    </Field.Label>
                    <Textarea
                      pl={2.5}
                      size="lg"
                      textStyle="p2"
                      color={
                        additionalNotes !== '' ? 'neutral.800' : 'neutral.300'
                      }
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                    <Field.HelperText color="neutral.600">
                      Max 250 words
                    </Field.HelperText>
                  </Field.Root>

                  <Flex justifyContent="flex-end" mt={4} gap={2}>
                    <Button
                      onClick={handleCancel}
                      background="bg"
                      color="neutral.800"
                      borderColor="neutral.200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      bg="blue.hover"
                      color="white"
                    >
                      Update Request
                    </Button>
                  </Flex>
                </>
              ) : (
                <Tabs.Root unstyled mt={5} fitted defaultValue="requestDetails">
                  <Tabs.List maxW="60%">
                    <Tabs.Trigger
                      textStyle="p2"
                      px={4}
                      py={1}
                      color="neutral.800"
                      value="requestDetails"
                      borderBottom="1.5px solid"
                      borderColor="neutral.100"
                      _selected={{ borderColor: 'neutral.700' }}
                    >
                      Request Details
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      textStyle="p2"
                      px={4}
                      py={1}
                      color="neutral.800"
                      value="associatedOrders"
                      borderBottom="1.5px solid"
                      borderColor="neutral.100"
                      _selected={{ borderColor: 'neutral.700' }}
                    >
                      Associated Orders
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="requestDetails">
                    <Field.Root mb={4} mt={6}>
                      <Field.Label>
                        <Text {...sectionTitleStyles}>Size of Shipment</Text>
                      </Field.Label>
                      <Menu.Root>
                        <Text textStyle="p2" color="neutral.800" mt={3}>
                          {requestedSize}
                        </Text>
                      </Menu.Root>
                    </Field.Root>

                    <Field.Root mb={4} mt={3}>
                      <Field.Label>
                        <Text {...sectionTitleStyles} mt={3}>
                          Food Type(s)
                        </Text>
                      </Field.Label>

                      <TagGroup values={selectedFoodTypes} />
                    </Field.Root>

                    <Field.Root mb={4}>
                      <Field.Label>
                        <Text {...sectionTitleStyles} mt={3}>
                          Additional Information
                        </Text>
                      </Field.Label>
                      <Text textStyle="p2" color="neutral.800" mt={3}>
                        {additionalNotes}
                      </Text>
                    </Field.Root>
                  </Tabs.Content>

                  <Tabs.Content value="associatedOrders">
                    {!currentOrder && (
                      <Text mt={5} textStyle="p2">
                        {' '}
                        No associated orders to display{' '}
                      </Text>
                    )}
                    {currentOrder && (
                      <Box
                        borderWidth="1px"
                        borderColor="neutral.100"
                        borderRadius="5px"
                        p={3}
                        mt={6}
                      >
                        <Flex justify="space-between" align="center" mb={3}>
                          <Text {...sectionTitleStyles}>
                            Order {currentOrder.orderId} -
                            <Text as="span" color="neutral.800" textStyle="p2">
                              {' '}
                              Fulfilled by {currentOrder.foodManufacturerName}
                            </Text>
                          </Text>
                          {currentOrder.status === OrderStatus.DELIVERED ? (
                            <Badge
                              {...badgeStyles}
                              bgColor="blue.100"
                              color="blue.core"
                            >
                              {ORDER_STATUS_LABELS[currentOrder.status]}
                            </Badge>
                          ) : (
                            <Badge
                              {...badgeStyles}
                              bgColor="yellow.200"
                              color="yellow.hover"
                            >
                              {ORDER_STATUS_LABELS[currentOrder.status]}
                            </Badge>
                          )}
                        </Flex>
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
                        <Text color="neutral.700" textStyle="p2" mt="3" mb="3">
                          No tracking link available at this time
                        </Text>
                      </Box>
                    )}

                    {orderDetailsList.length > 0 && (
                      <Flex justify="center" mt={7}>
                        <Pagination.Root
                          count={orderDetailsList.length}
                          pageSize={1}
                          page={currentPage}
                          onChange={(page: number) => setCurrentPage(page)}
                        >
                          <ButtonGroup variant="outline" size="sm" gap={4}>
                            <Pagination.PrevTrigger asChild>
                              <IconButton
                                variant="ghost"
                                disabled={currentPage === 1}
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1),
                                  )
                                }
                              >
                                <ChevronLeft />
                              </IconButton>
                            </Pagination.PrevTrigger>

                            <Pagination.Items
                              render={(page) => (
                                <IconButton
                                  variant="outline"
                                  _selected={{ borderColor: 'neutral.800' }}
                                  onClick={() => setCurrentPage(page.value)}
                                >
                                  {page.value}
                                </IconButton>
                              )}
                            />

                            <Pagination.NextTrigger asChild>
                              <IconButton
                                variant="ghost"
                                disabled={
                                  currentPage === orderDetailsList.length
                                }
                                onClick={() =>
                                  setCurrentPage((prev) =>
                                    Math.min(prev + 1, orderDetailsList.length),
                                  )
                                }
                              >
                                <ChevronRight />
                              </IconButton>
                            </Pagination.NextTrigger>
                          </ButtonGroup>
                        </Pagination.Root>
                      </Flex>
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
    </>
  );
};

export default RequestDetailsModal;
