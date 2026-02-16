import {
  Box,
  Field,
  Input,
  Button,
  Textarea,
  HStack,
  Text,
  Dialog,
} from '@chakra-ui/react';
import { Form, ActionFunction, ActionFunctionArgs, redirect } from 'react-router-dom';
import ApiClient from '@api/apiClient';

interface DeliveryConfirmationModalProps {
  requestId: number;
  isOpen: boolean;
  onClose: () => void;
  pantryId: number;
}

const photoNames: string[] = [];
const globalPhotos: File[] = [];

const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  requestId,
  isOpen,
  onClose,
  pantryId,
}) => {
  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (files) {
      for (const file of Array.from(files)) {
        if (!photoNames.some((photo) => photo.includes(file.name))) {
          try {
            photoNames.push(file.name);
            globalPhotos.push(file);
          } catch (error) {
            alert('Failed to handle ' + file.name + ': ' + error);
          }
        }
      }
    }
  };

  const renderPhotoNames = () => {
    return globalPhotos.map((photo, index) => (
      <Box key={index} mb={2}>
        <Text fontSize="sm" mt={1}>
          {photo.name}
        </Text>
      </Box>
    ));
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      size="xl"
      closeOnInteractOutside
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="49em">
          <Dialog.Header>
            <Dialog.Title fontSize={25} fontWeight={700}>
              Delivery Confirmation Form
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Form
              method="post"
              action="/confirm-delivery"
              encType="multipart/form-data"
            >
              <input type="hidden" name="pantryId" value={pantryId} />
              <input type="hidden" name="requestId" value={requestId} />
              <Field.Root required mb="2em">
                <Field.Label>
                  <Text fontSize={20} fontWeight={700}>
                    Delivery Date
                  </Text>
                  <Field.RequiredIndicator
                    color="red"
                    fontSize={20}
                    fontWeight={700}
                  />
                </Field.Label>
                <Input
                  type="date"
                  name="deliveryDate"
                  max={new Date().toISOString().split('T')[0]}
                />
                <Field.HelperText>Select the delivery date.</Field.HelperText>
              </Field.Root>
              <Field.Root mb="2em">
                <Field.Label asChild>
                  <Text fontSize={20} fontWeight={700}>
                    Feedback
                  </Text>
                </Field.Label>
                <Textarea
                  name="feedback"
                  placeholder="Share any feedback or issues..."
                  size="sm"
                />
              </Field.Root>
              <Field.Root mb="2em">
                <Field.Label asChild>
                  <Text fontSize={20} fontWeight={700}>
                    Upload Photos
                  </Text>
                </Field.Label>
                <Input
                  type="file"
                  name="photos"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoChange}
                />
                <Field.HelperText>
                  Select up to 3 photos to upload.
                </Field.HelperText>
                <Box mt={3}>{renderPhotoNames()}</Box>
              </Field.Root>
              <HStack gap="24px" justifyContent="space-between" mt={4}>
                <Button onClick={onClose}>Close</Button>
                <Button type="submit" bg="blue">
                  Confirm Delivery
                </Button>
              </HStack>
            </Form>
          </Dialog.Body>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

// Action function to handle form submission
export const submitDeliveryConfirmationFormModal: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const confirmDeliveryData = new FormData();

  const pantryId = form.get('pantryId') as string;
  const requestId = form.get('requestId') as string;
  confirmDeliveryData.append('requestId', requestId);

  const deliveryDate = form.get('deliveryDate');
  if (typeof deliveryDate === 'string') {
    const formattedDate = new Date(deliveryDate).toISOString();
    confirmDeliveryData.append('dateReceived', formattedDate);
  } else {
    alert('Delivery date is missing or invalid.');
    return redirect(`/request-form/${pantryId}`);
  }

  confirmDeliveryData.append('feedback', form.get('feedback') as string);

  if (globalPhotos.length > 0) {
    globalPhotos.forEach((photo) =>
      confirmDeliveryData.append('photos', photo),
    );
  }

  try {
    await ApiClient.confirmDelivery(parseInt(requestId, 10), confirmDeliveryData);
    alert('Delivery confirmation submitted successfully');
    return redirect(`/request-form/${pantryId}`);
  } catch (error) {
    alert(`Error submitting delivery confirmation: ${error}`);
    return redirect(`/request-form/${pantryId}`);
  }
};

export default DeliveryConfirmationModal;