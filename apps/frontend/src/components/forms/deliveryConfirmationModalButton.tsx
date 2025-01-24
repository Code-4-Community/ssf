import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
  Textarea,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  RadioGroup,
  Radio,
  Checkbox,
  CheckboxGroup,
} from '@chakra-ui/react';
import {
  Form,
  ActionFunction,
  ActionFunctionArgs,
  redirect,
} from 'react-router-dom';

const DeliveryConfirmationModalButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = new FormData(event.target as HTMLFormElement);
    const formData = new Map();

    formData.set('deliveryDate', form.get('deliveryDate'));
    formData.set('feedback', form.get('feedback'));
    formData.set('photos', form.getAll('photos'));

    const data = Object.fromEntries(formData);
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
            <Form onSubmit={handleSubmit}>
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
  const formData = new Map();

  formData.set('deliveryDate', form.get('deliveryDate'));
  formData.set('feedback', form.get('feedback'));
  formData.set('photos', form.getAll('photos'));

  const data = Object.fromEntries(formData);

  try {
    const response = await fetch(
      'http://localhost:3000/deliveries/food-requests/123/confirm-delivery',
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.ok) {
      // Additional behavior after a successful submission
      console.log('Delivery confirmation submitted successfully');
    } else {
      console.error(
        'Error submitting delivery confirmation',
        await response.text(),
      );
    }
  } catch (error) {
    console.error('Error submitting delivery confirmation', error);
  }

  return redirect('/');
};

export default DeliveryConfirmationModalButton;
