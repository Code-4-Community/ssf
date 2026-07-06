import {
  Dialog,
  Button,
  Text,
  Flex,
  Field,
  Input,
  CloseButton,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import { AlertStatus, Role, UserDto } from '../../types/types';
import ApiClient from '@api/apiClient';
import { USPhoneInput } from './usPhoneInput';
import { PlusIcon } from 'lucide-react';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';
import { useAlert } from '../../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';

interface NewVolunteerModalProps {
  onSubmitSuccess?: () => void;
  onSubmitFail?: () => void;
}

const NewVolunteerModal: React.FC<NewVolunteerModalProps> = ({
  onSubmitSuccess,
  onSubmitFail,
}) => {
  useModalBodyCleanup();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isOpen, setIsOpen] = useState(false);

  const [alertState, setAlertMessage] = useAlert();

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !phone || phone === '+1') {
      setAlertMessage('Please fill in all fields. *', AlertStatus.ERROR);
      return;
    }

    const newVolunteer: UserDto = {
      firstName,
      lastName,
      email,
      phone,
      role: Role.VOLUNTEER,
    };

    try {
      await ApiClient.postUser(newVolunteer);
      if (onSubmitSuccess) onSubmitSuccess();
      handleClear();
    } catch (error: unknown) {
      let hasEmailError = false;
      let hasPhoneError = false;

      if (typeof error === 'object' && error !== null) {
        const e = error as {
          response?: { data?: { message?: string | string[] } };
        };
        const message = e.response?.data?.message;

        hasEmailError =
          Array.isArray(message) &&
          message.some(
            (msg) =>
              typeof msg === 'string' && msg.toLowerCase().includes('email'),
          );

        hasPhoneError =
          Array.isArray(message) &&
          message.some(
            (msg) =>
              typeof msg === 'string' && msg.toLowerCase().includes('phone'),
          );
      }

      if (hasEmailError) {
        setAlertMessage('Please specify a valid email. *', AlertStatus.ERROR);
      } else if (hasPhoneError) {
        setAlertMessage(
          'Please specify a valid phone number. *',
          AlertStatus.ERROR,
        );
      } else {
        if (onSubmitFail) onSubmitFail();
        handleClear();
      }
    }
  };

  const handleClear = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button
          pl={3}
          borderColor="neutral.200"
          variant="outline"
          color="neutral.600"
          fontFamily="ibm"
          fontWeight="semibold"
          fontSize="14px"
          gap={1}
        >
          <Box as={PlusIcon} boxSize="17px" strokeWidth={2.5} />
          Add
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner alignItems="center">
        <Dialog.Content maxW="40em" mt="-8">
          <Dialog.Header pb={1}>
            <Dialog.Title
              fontSize="18px"
              fontWeight={600}
              fontFamily="Inter"
              color="#000"
            >
              Add New User
            </Dialog.Title>
            <CloseButton
              onClick={() => setIsOpen(false)}
              size="md"
              position="absolute"
              top={3}
              right={3}
            />
          </Dialog.Header>
          <Dialog.Body color="neutral.800" fontWeight={600} textStyle="p2">
            <Text mb="1.5em" color="#52525B" fontWeight={400}>
              Complete all information in the form to register a new user.
            </Text>
            <Flex gap={8} justifyContent="flex-start" my={4}>
              <Field.Root>
                <Field.Label
                  textStyle="p2"
                  color="neutral.800"
                  fontWeight={600}
                >
                  First Name
                </Field.Label>
                <Input
                  color="neutral.700"
                  textStyle="p2"
                  fontWeight={400}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label
                  textStyle="p2"
                  color="neutral.800"
                  fontWeight={600}
                >
                  Last Name
                </Field.Label>
                <Input
                  color="neutral.700"
                  textStyle="p2"
                  fontWeight={400}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Field.Root>
            </Flex>
            <Field.Root>
              <Field.Label textStyle="p2" color="neutral.800" fontWeight={600}>
                Email
              </Field.Label>
              <Input
                color="neutral.700"
                textStyle="p2"
                fontWeight={400}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field.Root>
            <Field.Root my={4}>
              <Field.Label textStyle="p2" color="neutral.800" fontWeight={600}>
                Phone Number
              </Field.Label>
              <USPhoneInput
                value={phone}
                onChange={setPhone}
                inputProps={{
                  color: 'neutral.700',
                  textStyle: 'p2',
                  fontWeight: 400,
                }}
              />
            </Field.Root>
            {alertState && (
              <FloatingAlert
                key={alertState.id}
                message={alertState.message}
                status={alertState.status}
                timeout={6000}
              />
            )}
            <Flex justifyContent="flex-end" mt={10} gap={2.5}>
              <Button
                textStyle="p2"
                fontWeight={600}
                color="neutral.800"
                variant="outline"
                onClick={handleClear}
              >
                Cancel
              </Button>
              <Button
                textStyle="p2"
                fontWeight={600}
                bg={'blue.hover'}
                color={'white'}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Flex>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default NewVolunteerModal;
