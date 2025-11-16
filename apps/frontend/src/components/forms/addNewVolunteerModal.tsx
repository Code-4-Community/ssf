import {
    Dialog,
    Button,
    Text,
    Flex,
} from '@chakra-ui/react';
import { useState } from 'react';
import ApiClient from '@api/apiClient';

const NewVolunteerModal: React.FC = () => {

  const handleSubmit = async () => {

  }

  return (
    <Dialog.Root >
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
          </Dialog.Header>
          <Dialog.Body>
            <Text mb="1.5em">
              Complete all information in the form to register a new volunteer.
            </Text>
            <Text mb="1.5em">Log a new donation</Text>
            <Flex justifyContent="space-between" mt={4}>
              <Button>Close</Button>
              <Button>Submit</Button>
            </Flex>
          </Dialog.Body>
          <Dialog.CloseTrigger />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};






export default NewVolunteerModal;