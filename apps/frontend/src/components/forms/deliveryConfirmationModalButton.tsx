import {
  Box,
  Field,
  Input,
  Button,
  Dialog,
  Textarea,
  HStack,
  Text,
} from '@chakra-ui/react';
import { Form, ActionFunction, ActionFunctionArgs } from 'react-router-dom';
import ApiClient from '@api/apiClient';
import { useState } from 'react';

interface DeliveryConfirmationModalButtonProps {
  requestId: number;
}

const photoNames: string[] = [];
const globalPhotos: File[] = [];

const DeliveryConfirmationModalButton: React.FC<
  DeliveryConfirmationModalButtonProps
> = ({ requestId }) => {
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      <Button onClick={() => setIsOpen(true)}>Confirm Delivery</Button>
      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="xl">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="49em">
            <Dialog.Header>
              <Dialog.Title fontSize={25} fontWeight={700}>
                Delivery Confirmation Form
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <Form
                method="post"
                action="/confirm-delivery"
                encType="multipart/form-data"
              >
                <input type="hidden" name="requestId" value={requestId} />
                <Field.Root required mb="2em">
                  <Field.Label fontSize={20} fontWeight={700}>
                    Delivery Date
                  </Field.Label>
                  <Input
                    type="date"
                    name="deliveryDate"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Field.HelperText>Select the delivery date.</Field.HelperText>
                </Field.Root>
                <Field.Root mb="2em">
                  <Field.Label fontSize={20} fontWeight={700}>
                    Feedback
                  </Field.Label>
                  <Textarea
                    name="feedback"
                    placeholder="Share any feedback or issues..."
                    size="sm"
                  />
                </Field.Root>
                <Field.Root mb="2em">
                  <Field.Label fontSize={20} fontWeight={700}>
                    Upload Photos
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
                <HStack gap={6} justifyContent="space-between" mt={4}>
                  <Button onClick={() => setIsOpen(false)}>Close</Button>
                  <Button type="submit" colorScheme="blue">
                    Confirm Delivery
                  </Button>
                </HStack>
              </Form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};

export const submitDeliveryConfirmationFormModal: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const confirmDeliveryData = new FormData();

  const requestId = form.get('requestId') as string;
  confirmDeliveryData.append('requestId', requestId);

  const deliveryDate = form.get('deliveryDate');
  if (typeof deliveryDate === 'string') {
    const formattedDate = new Date(deliveryDate).toISOString();
    confirmDeliveryData.append('dateReceived', formattedDate);
  } else {
    alert('Delivery date is missing or invalid.');
  }

  confirmDeliveryData.append('feedback', form.get('feedback') as string);

  if (globalPhotos.length > 0) {
    globalPhotos.forEach((photo) =>
      confirmDeliveryData.append('photos', photo),
    );
  }

  try {
    await ApiClient.confirmDelivery(
      parseInt(requestId, 10),
      confirmDeliveryData,
    );
    alert('Delivery confirmation submitted successfully');
    window.location.href = '/request-form/1';
  } catch (error) {
    alert(`Error submitting delivery confirmation: ${error}`);
    window.location.href = '/request-form/1';
  }
};

export default DeliveryConfirmationModalButton;
