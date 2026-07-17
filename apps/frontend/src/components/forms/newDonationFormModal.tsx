import { Text, Dialog } from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { CreateDonationDto, FoodType, RecurrenceEnum } from '../../types/types';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';
import { AlertStatus } from '../../types/types';
import EditableDonationItemsTable, {
  DonationRow,
  RecurrenceData,
} from './editableDonationItemsTable';

interface NewDonationFormModalProps {
  onDonationSuccess: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NewDonationFormModal: React.FC<NewDonationFormModalProps> = ({
  onDonationSuccess,
  isOpen,
  onClose,
}) => {
  useModalBodyCleanup();

  const [alertState, setAlertMessage] = useAlert();

  const handleLogDonation = async (
    rows: DonationRow[],
    recurrence: RecurrenceData | null,
  ) => {
    const donationBody: CreateDonationDto = {
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
