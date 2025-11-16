import {
    Dialog,
    Button,
    Text,
    Flex,
    Field,
    Input,
    CloseButton,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Role, UserDto } from "../../types/types";
import ApiClient from '@api/apiClient';

const NewVolunteerModal: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !phone) {
      setError("Please fill in all fields.*");
      return;
    }

    setError("");

    const newVolunteer: UserDto = {
      firstName,
      lastName,
      email,
      phone,
      role: Role.STANDARD_VOLUNTEER
    };

    try {
      await ApiClient.postUser(newVolunteer);
    } catch (error) {
      alert('Error creating new user');
    }

  }

  const handleCancel = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setError("");
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          + Add
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="49em">
          <Dialog.Header>
            <Dialog.Title fontSize={25} fontWeight={700}>
              Add New Volunteer
            </Dialog.Title>
            <CloseButton onClick={() => setIsOpen(false)} size="sm" position="absolute" top={3} right={3}/>
          </Dialog.Header>
          <Dialog.Body>
            <Text mb="1.5em">
              Complete all information in the form to register a new volunteer.
            </Text>
            <Flex gap={8} justifyContent="flex-start" my={4}>
              <Field.Root>
                <Field.Label>First Name</Field.Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
              </Field.Root>
              <Field.Root>
                <Field.Label>Last Name</Field.Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)}/>
              </Field.Root>
            </Flex>
            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)}/>
            </Field.Root>
            <Field.Root my={4}>
              <Field.Label>Phone Number</Field.Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)}/>
            </Field.Root>
            {error && (
              <Text color="red" mb={3} fontWeight="semibold">
                {error}
              </Text>
            )}
            <Flex justifyContent="flex-end" mt={4} gap={4}>
              <Button variant='outline' onClick={handleSubmit}>Submit</Button>
              <Button variant='outline' onClick={handleCancel}>Cancel</Button>
            </Flex>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};






export default NewVolunteerModal;