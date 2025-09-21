import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Text,
} from '@chakra-ui/react';
import { Form, ActionFunction, ActionFunctionArgs } from 'react-router-dom';
import ApiClient from '@api/apiClient';

interface DeliveryConfirmationModalButtonProps {
  requestId: number;
}

const photoNames: string[] = [];
const globalPhotos: File[] = [];

const DeliveryConfirmationModalButton: React.FC<
  DeliveryConfirmationModalButtonProps
> = ({ requestId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      <Button onClick={onOpen}>Confirm Delivery</Button>
      <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
        <ModalOverlay />
        <ModalContent maxW="49em">
          <ModalHeader fontSize={25} fontWeight={700}>
            Delivery Confirmation Form
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form
              method="post"
              action="/confirm-delivery"
              encType="multipart/form-data"
            >
              <input type="hidden" name="requestId" value={requestId} />
              <FormControl isRequired mb="2em">
                <FormLabel fontSize={20} fontWeight={700}>
                  Delivery Date
                </FormLabel>
                <Input
                  type="date"
                  name="deliveryDate"
                  max={new Date().toISOString().split('T')[0]}
                />
                <FormHelperText>Select the delivery date.</FormHelperText>
              </FormControl>
              <FormControl mb="2em">
                <FormLabel fontSize={20} fontWeight={700}>
                  Feedback
                </FormLabel>
                <Textarea
                  name="feedback"
                  placeholder="Share any feedback or issues..."
                  size="sm"
                />
              </FormControl>
              <FormControl mb="2em">
                <FormLabel fontSize={20} fontWeight={700}>
                  Upload Photos
                </FormLabel>
                <Input
                  type="file"
                  name="photos"
                  multiple
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoChange}
                />
                <FormHelperText>
                  Select up to 3 photos to upload.
                </FormHelperText>
                <Box mt={3}>{renderPhotoNames()}</Box>
              </FormControl>
              <HStack spacing="24px" justifyContent="space-between" mt={4}>
                <Button onClick={onClose}>Close</Button>
                <Button type="submit" colorScheme="blue">
                  Confirm Delivery
                </Button>
              </HStack>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// Action function to handle form submission
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
