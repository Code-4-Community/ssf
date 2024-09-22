// Information Needed:
// restrictions (pre-populate from pantries table)
// due date
// donation contents
//  donation type
//  donation size
//  running low on any foods?

import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
  Checkbox,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import {
  Form,
  redirect,
  ActionFunction,
  ActionFunctionArgs,
} from 'react-router-dom';

const FoodRequestForm: React.FC = () => {
  return (
    <Box maxW="400px">
      <Form method="post" action="/food-request">
        <FormControl isRequired mb="40px">
          <FormLabel>Requested Delivery Date</FormLabel>
          <Input name="requestedDeliveryDate" type="date" />
          <FormHelperText>
            We'll reach out to confirm a delivery date and time.
          </FormHelperText>
        </FormControl>
        <FormControl>
          <FormLabel>Dietary Restrictions</FormLabel>
          <Stack spacing={2} direction="column">
            <Checkbox>Milk</Checkbox>
            <Checkbox>Eggs</Checkbox>
            <Checkbox>Fish</Checkbox>
            <Checkbox>Shellfish</Checkbox>
            <Checkbox>Tree Nuts</Checkbox>
            <Checkbox>Peanuts</Checkbox>
            <Checkbox>Wheat</Checkbox>
            <Checkbox>Soybeans</Checkbox>
            <Checkbox>Sesame</Checkbox>
            <Checkbox>Other</Checkbox>
          </Stack>
        </FormControl>
        <FormControl>
          <FormLabel>Requested Items</FormLabel>
        </FormControl>
        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea
            placeholder="Any other details about the food request"
            size="sm"
          />
        </FormControl>
        <Button type="submit">Submit</Button>
      </Form>
    </Box>
  );
};

export const submitFoodRequestForm: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const data = await request.formData();
  const foodRequest = {};
  // API Call to backend

  console.log(foodRequest);
  return redirect('/');
};

export default FoodRequestForm;
