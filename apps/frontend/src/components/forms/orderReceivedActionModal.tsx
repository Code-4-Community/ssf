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
  DatePicker,
  FileUpload,
  Icon,
  Portal,
  parseDate,
  InputGroup,
  Input,
} from '@chakra-ui/react';
import { Upload, Calendar } from 'lucide-react';
import { ConfirmDeliveryDto } from 'types/types';
import apiClient from '@api/apiClient';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

interface OrderReceivedActionModalProps {
  orderId: number;
  orderCreatedAt: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: () => void;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const OrderReceivedActionModal: React.FC<OrderReceivedActionModalProps> = ({
  orderId,
  orderCreatedAt,
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  useModalBodyCleanup();
  const [alertState, setAlertMessage] = useAlert();
  const [feedback, setFeedback] = useState<string>('');
  const [dateReceived, setDateReceived] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [invalidPhotoExists, setInvalidPhotoExists] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isFormValid = dateReceived !== '' && !invalidPhotoExists;

  const minDate = new Date(orderCreatedAt).toISOString().split('T')[0];

  const today = new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setFeedback('');
    setDateReceived('');
    setPhotos([]);
    setInvalidPhotoExists(false);
  };

  const handleSubmit = async () => {
    try {
      if (new Date(dateReceived) < new Date(orderCreatedAt)) {
        setAlertMessage(
          'Date received cannot be earlier than the order creation date',
        );
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (new Date(dateReceived) > today) {
        setAlertMessage('Date received cannot be in the future');
        return;
      }

      // TODO: fix date/time storage/handling
      const dto: ConfirmDeliveryDto = {
        dateReceived: dateReceived,
        feedback: feedback,
      };

      await apiClient.confirmOrderDelivery(orderId, dto, photos);

      resetForm();
      onSuccess();
      onClose();
    } catch {
      resetForm();
      onError();
      onClose();
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="xl"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) {
          resetForm();
          onClose();
        }
      }}
      closeOnInteractOutside
    >
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status="error"
          timeout={6000}
        />
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
              color="neutral.800"
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
                <DatePicker.Root
                  min={parseDate(minDate)}
                  max={parseDate(today)}
                  value={dateReceived ? [parseDate(dateReceived)] : []}
                  onValueChange={({ value }) => {
                    const date = value?.[0];
                    setDateReceived(date ? date.toString() : '');
                  }}
                  closeOnSelect
                  positioning={{ placement: 'top-start' }}
                >
                  <InputGroup
                    as={DatePicker.Control}
                    startElement={
                      <Calendar
                        size={16}
                        color="var(--chakra-colors-neutral-300)"
                      />
                    }
                  >
                    <DatePicker.Trigger asChild>
                      <Input
                        readOnly
                        w="100%"
                        h={10}
                        borderRadius="sm"
                        border="1px solid var(--chakra-colors-neutral-100)"
                        cursor="pointer"
                        placeholder=""
                        color="neutral.800"
                        value={
                          dateReceived
                            ? new Date(
                                dateReceived + 'T00:00:00',
                              ).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : ''
                        }
                      />
                    </DatePicker.Trigger>
                  </InputGroup>
                  <Portal>
                    <DatePicker.Positioner>
                      <DatePicker.Content>
                        <DatePicker.View view="day">
                          <DatePicker.Header />
                          <DatePicker.DayTable />
                        </DatePicker.View>
                        <DatePicker.View view="month">
                          <DatePicker.Header />
                          <DatePicker.MonthTable />
                        </DatePicker.View>
                        <DatePicker.View view="year">
                          <DatePicker.Header />
                          <DatePicker.YearTable />
                        </DatePicker.View>
                      </DatePicker.Content>
                    </DatePicker.Positioner>
                  </Portal>
                </DatePicker.Root>
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
                      setAlertMessage('Exceeded word limit');
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
                  onFileChange={(e: { acceptedFiles?: File[] }) => {
                    const files: File[] = e.acceptedFiles ?? [];
                    const oversized = files.find(
                      (file) => file.size > MAX_FILE_SIZE,
                    );
                    if (oversized) {
                      setErrorMessage(
                        `${oversized.name} exceeds the 5MB size limit.`,
                      );
                      setInvalidPhotoExists(true);
                      return;
                    } else {
                      setInvalidPhotoExists(false);
                    }

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
                    cursor="pointer"
                  >
                    <Icon size="md" color="fg.muted">
                      <Upload />
                    </Icon>
                    <FileUpload.DropzoneContent>
                      <Box textStyle="p2" fontWeight={600}>
                        Click or drag and drop here to upload
                      </Box>
                      <Box textStyle="p2" color="neutral.800">
                        .png, .jpg up to 5MB
                      </Box>
                    </FileUpload.DropzoneContent>
                  </FileUpload.Dropzone>
                  {invalidPhotoExists && (
                    <Text color="red" textStyle="p2" mt={1}>
                      {errorMessage}
                    </Text>
                  )}
                  <FileUpload.List clearable />
                </FileUpload.Root>
              </Field.Root>

              <Flex justifyContent="flex-end" mt={4} gap={2}>
                <Button
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  bg={'white'}
                  color={'black'}
                  borderColor="neutral.100"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleSubmit}
                  bg={isFormValid ? 'blue.hover' : 'neutral.400'}
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
