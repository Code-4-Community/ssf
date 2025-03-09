import React from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
import { FoodRequest } from 'types/types';
import FoodRequestFormModal from './requestFormModalButton';

interface ReadOnlyRequestFormModalButtonProps {
  request: FoodRequest;
}

const ReadOnlyRequestFormModalButton: React.FC<
  ReadOnlyRequestFormModalButtonProps
> = ({ request }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>View Request</Button>
      <FoodRequestFormModal
        previousRequest={request}
        buttonText=""
        readOnly={true}
      />
    </>
  );
};

export default ReadOnlyRequestFormModalButton;
