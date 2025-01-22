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
} from '@chakra-ui/react';
import React, { useState } from 'react';

const DeliveryConfirmationForm: React.FC = () => {
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    setPhotos((prevFiles) => {
      const allFiles = [...prevFiles, ...newFiles];
      // Remove duplicates
      const uniqueFiles = Array.from(
        new Map(allFiles.map((file) => [file.name, file])).values(),
      );
      return uniqueFiles.slice(0, 3);
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('deliveryDate', deliveryDate);
    if (feedback) {
      formData.append('feedback', feedback);
    }
    photos.forEach((photo) => {
      formData.append('photoPaths', photo);
    });

    try {
      const response = await fetch(
        'http://localhost:3000/deliveries/food-requests/123/confirm-delivery',
        {
          method: 'POST',
          body: formData,
        },
      );

      if (response.ok) {
        const data = await response.json();
        setStatusMessage('Delivery confirmation successful!');
        console.log('Response:', data);
      } else {
        const errorData = await response.json();
        setStatusMessage(`Error: ${errorData.message}`);
        console.error('Error:', errorData);
      }
    } catch (error) {
      setStatusMessage('An unexpected error occurred.');
      console.error('Error:', error);
    }
  };

  return (
    <Box
      maxW="40em"
      mx="auto"
      mt="8"
      p="6"
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="md"
    >
      <form onSubmit={handleSubmit}>
        <Heading size="lg" mb="6" textAlign="center">
          Delivery Confirmation
        </Heading>
        <FormControl isRequired mb="6">
          <FormLabel fontSize="lg" fontWeight="semibold">
            Delivery Date
          </FormLabel>
          <Input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />
          <FormHelperText>Select the delivery date.</FormHelperText>
        </FormControl>
        <FormControl mb="6">
          <FormLabel fontSize="lg" fontWeight="semibold">
            Feedback
          </FormLabel>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share any feedback or issues..."
            size="md"
          />
        </FormControl>
        <FormControl mb="8">
          <FormLabel fontSize="lg" fontWeight="semibold">
            Upload Photos (Max: 3)
          </FormLabel>
          <Input
            type="file"
            onChange={handlePhotoChange}
            multiple
            accept=".jpg,.jpeg,.png"
          />
          {photos.length > 0 && (
            <SimpleGrid columns={1} spacing="2" mt="4">
              {photos.map((photo, idx) => (
                <Box
                  key={idx}
                  fontSize="sm"
                  p="2"
                  borderWidth="1px"
                  borderRadius="md"
                >
                  {photo.name}
                </Box>
              ))}
            </SimpleGrid>
          )}
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg" w="full" mt="4">
          Confirm Delivery
        </Button>
        {statusMessage && (
          <Box
            mt="4"
            color={
              statusMessage.includes('successful') ? 'green.500' : 'red.500'
            }
          >
            {statusMessage}
          </Box>
        )}
      </form>
    </Box>
  );
};

export default DeliveryConfirmationForm;
