import React, { useState } from 'react';
import {
  Flex,
  Button,
  Textarea,
  Text,
  Dialog,
  Box,
  Field,
  CloseButton,
  Input,
  FileUpload,
  Icon,
} from '@chakra-ui/react';
import { Upload } from 'lucide-react';
import { ConfirmDeliveryDto } from 'types/types';
import apiClient from '@api/apiClient';

interface OrderReceivedActionModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_FILES = 10;

const OrderReceivedActionModal: React.FC<OrderReceivedActionModalProps> = ({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [dateReceived, setDateReceived] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);

  const isFormValid = dateReceived !== '';

  const resetForm = () => {
    setAlertMessage('');
    setFeedback('');
    setDateReceived('');
    setPhotos([]);
  };

  const handleSubmit = async () => {
    try {
      const dto: ConfirmDeliveryDto = {
        dateReceived: new Date(dateReceived).toISOString(),
        feedback: feedback,
      };

      await apiClient.confirmOrderDelivery(orderId, dto, photos);

      setAlertMessage('Delivery Confirmed');
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      setAlertMessage('Delivery could not be confirmed.');
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="xl"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      {alertMessage && (
        // TODO: add Justin's alert component/uncomment below out and remove text component
        // <FloatingAlert message={alertMessage} status="error" timeout={6000} />
        <Text>{alertMessage}</Text>
      )}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW={650}>
          <Dialog.Header pb={0} mt={2}>
            <Dialog.Title
              color="black"
              fontSize="lg"
              fontWeight={700}
              fontFamily="inter"
            >
              Action Required
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text
              mb={5}
              color="#52525B"
              textStyle="p2"
              pt={0}
              mt={2}
              textAlign={'left'}
            >
              As this order arrives, please confirm the donation receipt and
              delivery of the order by filling out the details below.
            </Text>
            <Box>
              <Field.Root required mb={4}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Date Received
                  </Text>
                </Field.Label>
                <Input
                  type="date"
                  textStyle="p2"
                  w="full"
                  bg="white"
                  borderColor="neutral.100"
                  color="neutral.700"
                  borderWidth="1px"
                  borderRadius="4px"
                  onChange={(e) => setDateReceived(e.target.value)}
                  value={dateReceived}
                />
              </Field.Root>

              <Field.Root mb={4}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Feedback
                  </Text>
                </Field.Label>
                <Textarea
                  pl={2.5}
                  size="lg"
                  textStyle="p2"
                  color="neutral.800"
                  borderColor="neutral.100"
                  minH={150}
                  value={feedback}
                  onChange={(e) => {
                    const inputText = e.target.value;
                    const words = inputText.trim().split(/\s+/);

                    if (words.length <= 250) {
                      setFeedback(e.target.value);
                    } else {
                      alert('Exceeded word limit');
                    }
                  }}
                />

                <Field.HelperText color="neutral.600">
                  Max 250 words
                </Field.HelperText>
              </Field.Root>

              <Field.Root mb={4}>
                <Field.Label>
                  <Text textStyle="p2" fontWeight={600} color="neutral.800">
                    Photos
                  </Text>
                </Field.Label>
                <FileUpload.Root
                  accept={['image/png', 'image/jpeg', 'image/jpg']}
                  alignItems="stretch"
                  maxFiles={MAX_FILES}
                  onFileChange={(e: any) => {
                    const files: File[] = e?.acceptedFiles ?? [];
                    setPhotos(files);
                  }}
                >
                  <FileUpload.HiddenInput />
                  <FileUpload.Dropzone
                    borderColor="neutral.100"
                    borderRadius="4px"
                    borderStyle="solid"
                    borderWidth="1px"
                    minH="150px"
                  >
                    <Icon size="md" color="fg.muted">
                      <Upload />
                    </Icon>
                    <FileUpload.DropzoneContent>
                      <Box textStyle="p2" fontWeight={600}>
                        Drag and drop here to upload
                      </Box>
                      <Box textStyle="p2" color="neutral.800">
                        .png, .jpg up to 5MB
                      </Box>
                    </FileUpload.DropzoneContent>
                  </FileUpload.Dropzone>
                  <FileUpload.List clearable />
                </FileUpload.Root>
              </Field.Root>

              <Flex justifyContent="flex-end" mt={4} gap={2}>
                <Button
                  onClick={onClose}
                  bg={'white'}
                  color={'black'}
                  borderColor="neutral.100"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  bg={isFormValid ? '#213C4A' : 'neutral.400'}
                  color={'white'}
                  disabled={!isFormValid}
                >
                  Continue
                </Button>
              </Flex>
            </Box>
          </Dialog.Body>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="lg" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default OrderReceivedActionModal;
