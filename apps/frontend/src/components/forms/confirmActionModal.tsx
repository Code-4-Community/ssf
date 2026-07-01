import { Dialog, Text, Button, CloseButton } from '@chakra-ui/react';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  volunteerName: string;
  action: 'activate' | 'deactivate';
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  volunteerName,
  action,
}) => {
  useModalBodyCleanup();

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => !e.open && onClose()}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Dialog.Content maxW="500px">
          <Dialog.Header pb={0}>
            <Dialog.Title fontSize="lg" fontWeight={600}>
              {action === 'activate' ? 'Activate user' : 'Deactivate user'}
            </Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body pb={4}>
            <Text color="gray.dark">
              Are you sure you want to {action} {volunteerName}?
            </Text>
          </Dialog.Body>

          <Dialog.Footer gap={2}>
            <Button
              variant="outline"
              onClick={onClose}
              borderColor="neutral.200"
              color="neutral.800"
              textStyle="p2"
              fontWeight={600}
            >
              Cancel
            </Button>
            <Button
              bg="blue.hover"
              color="white"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              _hover={{ bg: 'neutral.800' }}
              px={8}
              textStyle="p2"
              fontWeight={600}
            >
              Confirm
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default ConfirmActionModal;
