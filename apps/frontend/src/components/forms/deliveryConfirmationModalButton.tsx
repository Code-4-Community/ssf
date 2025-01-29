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
import {
  Form,
  ActionFunction,
  ActionFunctionArgs,
  redirect,
} from 'react-router-dom';

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
            console.error(`Failed to handle ${file.name}:`, error);
          }
        }
      }
    }

    console.log('Current uploaded photos:', photoNames);
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
                <Input type="date" name="deliveryDate" />
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
                <Button type="submit" colorScheme="blue">
                  Confirm Delivery
                </Button>
                <Button onClick={onClose}>Close</Button>
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

  const confirmDeliveryData = new Map();
  confirmDeliveryData.set('requestId', form.get('requestId'));
  form.delete('requestId');

  const deliveryDate = form.get('deliveryDate');
  if (typeof deliveryDate === 'string') {
    const formattedDate = new Date(deliveryDate);
    const formattedDateString = formattedDate.toISOString();
    confirmDeliveryData.set('dateReceived', formattedDateString);
  } else {
    console.error('Delivery date is missing or invalid.');
  }
  form.delete('deliveryDate');

  confirmDeliveryData.set('feedback', form.get('feedback'));
  form.delete('feedback');

  confirmDeliveryData.set('photos', photoNames);
  form.delete('photos');

  const data = Object.fromEntries(confirmDeliveryData);
  console.log(data);

  try {
    const response = await fetch(
      `/api/requests/${data.requestId}/confirm-delivery`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    if (response.ok) {
      console.log('Delivery confirmation submitted successfully');
      return redirect('/');
    } else {
      console.error(
        'Failed to submit delivery confirmation',
        await response.text(),
      );
      return redirect('/');
    }
  } catch (error) {
    console.error('Error submitting delivery confirmation', error);
    return redirect('/');
  }
};

export default DeliveryConfirmationModalButton;
