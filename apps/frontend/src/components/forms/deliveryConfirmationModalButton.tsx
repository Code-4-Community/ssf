import {
  Box,
  Heading,
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

const DeliveryConfirmationModalButton: React.FC<
  DeliveryConfirmationModalButtonProps
> = ({ requestId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
            <Form method="POST" action="/food-request">
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
                  Upload Photos (Max: 3)
                </FormLabel>
                <Input
                  type="file"
                  name="photos"
                  multiple
                  accept=".jpg,.jpeg,.png"
                />
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

export const submitDeliveryConfirmationFormModal: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();

  const confirmDeliveryData = new Map();

  confirmDeliveryData.set('requestId', form.get('requestId'));
  form.delete('requestId');
  confirmDeliveryData.set('dateReceived', form.get('deliveryDate'));
  form.delete('deliveryDate');
  confirmDeliveryData.set('feedback', form.get('feedback'));
  form.delete('feedback');
  confirmDeliveryData.set('photos', form.getAll('photos'));
  form.delete('photos');

  const data = Object.fromEntries(confirmDeliveryData);

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
    } else {
      console.error(
        'Failed to submit delivery confirmation',
        await response.text(),
      );
    }
  } catch (error) {
    console.error('Error submitting delivery confirmation', error);
  }

  return redirect('/');
};

export default DeliveryConfirmationModalButton;
