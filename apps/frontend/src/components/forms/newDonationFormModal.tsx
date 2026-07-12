import { useEffect, useState } from 'react';
import { Text, Dialog, Menu, Box, Button, Field } from '@chakra-ui/react';
import { ChevronDownIcon } from 'lucide-react';
import ApiClient from '@api/apiClient';
import {
  CreateDonationDto,
  FoodType,
  ManufacturerSummary,
  RecurrenceEnum,
} from '../../types/types';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';
import { AlertStatus } from '../../types/types';
import EditableDonationItemsTable, {
  DonationRow,
  RecurrenceData,
} from './editableDonationItemsTable';

interface NewDonationFormModalProps {
  foodManufacturerId: number;
  onDonationSuccess: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NewDonationFormModal: React.FC<NewDonationFormModalProps> = ({
  foodManufacturerId,
  onDonationSuccess,
  isOpen,
  onClose,
}) => {
  useModalBodyCleanup();

  const [alertState, setAlertMessage] = useAlert();
  const [manufacturers, setManufacturers] = useState<ManufacturerSummary[]>([]);
  const [selectedFmId, setSelectedFmId] = useState<number>(foodManufacturerId);

  // Load the manufacturers this representative can donate for so they can
  // choose which one the donation is for.
  useEffect(() => {
    if (!isOpen) return;
    const loadManufacturers = async () => {
      try {
        const mine = await ApiClient.getMyFoodManufacturers();
        setManufacturers(mine);
        // Default to the manufacturer the page is currently on, falling back to
        // the first approved one only if that isn't an option.
        const preferred = mine.some(
          (m) => m.foodManufacturerId === foodManufacturerId,
        )
          ? foodManufacturerId
          : mine[0]?.foodManufacturerId ?? foodManufacturerId;
        setSelectedFmId(preferred);
      } catch {
        setAlertMessage('Error loading food manufacturers', AlertStatus.ERROR);
      }
    };
    loadManufacturers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, foodManufacturerId]);

  const selectedManufacturerName = manufacturers.find(
    (m) => m.foodManufacturerId === selectedFmId,
  )?.foodManufacturerName;

  const handleLogDonation = async (
    rows: DonationRow[],
    recurrence: RecurrenceData | null,
  ) => {
    const donationBody: CreateDonationDto = {
      foodManufacturerId: selectedFmId,
      recurrenceFreq: recurrence?.recurrenceFreq,
      recurrence: recurrence?.recurrence ?? RecurrenceEnum.NONE,
      repeatOnDays: recurrence?.repeatOnDays,
      occurrencesRemaining: recurrence?.occurrencesRemaining,
      items: rows.map((row) => ({
        itemName: row.foodItem,
        quantity: parseInt(row.numItems),
        ozPerItem: parseFloat(row.ozPerItem),
        estimatedValue: parseFloat(row.valuePerItem),
        foodType: row.foodType as FoodType,
        foodRescue: row.foodRescue,
      })),
    };

    try {
      await ApiClient.postDonation(donationBody);
      onDonationSuccess();
      onClose();
    } catch {
      setAlertMessage('Error submitting new donation', AlertStatus.ERROR);
    }
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
          status={alertState.status}
          timeout={6000}
        />
      )}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="75vw" maxH="90vh">
          <Dialog.CloseTrigger />

          <Dialog.Header asChild>
            <Dialog.Title fontSize={18} fontWeight={600}>
              Log New Donation
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Text mt={-4} color="neutral.700">
              Please fill out the following information to record donation
              details.
            </Text>
            <Text mb={4} fontWeight={600} color="neutral.700">
              Please do not include shipping/delivery costs in Food Donation
              Value.
            </Text>

            {manufacturers.length > 1 && (
              <Field.Root required mb={4}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Food Manufacturer
                  </Text>
                </Field.Label>
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button
                      pl={2.5}
                      _disabled={{ color: 'neutral.800', opacity: 1 }}
                      textStyle="p2"
                      w="full"
                      bgColor="white"
                      color={
                        selectedManufacturerName ? 'neutral.800' : 'neutral.300'
                      }
                      borderColor="neutral.100"
                      borderWidth="1px"
                      borderRadius="4px"
                      justifyContent="space-between"
                    >
                      {selectedManufacturerName || 'Select food manufacturer'}
                      <Box color="neutral.300">
                        <ChevronDownIcon />
                      </Box>
                    </Button>
                  </Menu.Trigger>

                  <Menu.Positioner w="full">
                    <Menu.Content>
                      <Menu.RadioItemGroup
                        value={String(selectedFmId)}
                        onValueChange={(val: { value: string }) =>
                          setSelectedFmId(Number(val.value))
                        }
                      >
                        {manufacturers.map((m, idx) => (
                          <Menu.RadioItem
                            key={m.foodManufacturerId}
                            value={String(m.foodManufacturerId)}
                            pl={1}
                            mt={idx === 0 ? 0 : 2}
                          >
                            {m.foodManufacturerName}
                          </Menu.RadioItem>
                        ))}
                      </Menu.RadioItemGroup>
                    </Menu.Content>
                  </Menu.Positioner>
                </Menu.Root>
              </Field.Root>
            )}

            <EditableDonationItemsTable
              showRecurrence
              onCancel={onClose}
              onSubmit={handleLogDonation}
              submitButtonLabel="Submit Donation"
            ></EditableDonationItemsTable>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default NewDonationFormModal;
