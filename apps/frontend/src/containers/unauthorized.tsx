import { Center } from '@chakra-ui/react';
import PageEmptyState from '@components/pageEmptyState';
import { ROUTES } from '../routes';

export const Unauthorized: React.FC = () => {
  return (
    <Center h="100vh">
      <PageEmptyState
        entity="access"
        subtitle="You are not an authorized user for this page."
        primaryButtonText="Return to home page"
        primaryButtonLink={ROUTES.HOME}
      />
    </Center>
  );
};

export default Unauthorized;
