import DeliveryConfirmationForm from '@components/forms/deliveryConfirmationForm';
import { Center } from '@chakra-ui/react';

// This should be the page for the food requests form (storing all the different food requests),
// and it should have the DeliveryConfirmationForm as an option to click on only for requests that
// have not have their delivery confirmed
// Can implement other components though:
// Can use a get request to retrieve the information from the database once it is set up for each field in SS
const FoodRequests: React.FC = () => {
  return (
    <Center>
      <DeliveryConfirmationForm />
    </Center>
  );
};

export default FoodRequests;
