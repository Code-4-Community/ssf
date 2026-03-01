import { Dialog, Text, Box, Button, CloseButton } from '@chakra-ui/react';

interface ConfirmPantryDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  decision: string;
  pantryName: string;
  dateApplied: string;
}

const ConfirmPantryDecisionModal: React.FC<ConfirmPantryDecisionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  decision,
  pantryName,
  dateApplied,
}) => {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => !e.open && onClose()}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="500px">
          <Dialog.Header pb={0}>
            <Dialog.Title fontSize="lg" fontWeight={600}>
              Confirm Action
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body pb={4}>
            <Text mb={4} color="gray.dark">
              Are you sure you want to {decision} this application?
            </Text>

            <Box
              p={6}
              borderRadius="md"
              border="1px solid"
              borderColor="neutral.100"
            >
              <Text textStyle="p2">{pantryName}</Text>
              <Text textStyle="p3" color="neutral.600">
                Applied {dateApplied}
              </Text>
            </Box>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
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
              px={12}
              textStyle="p2"
              fontWeight={600}
            >
              {decision.charAt(0).toUpperCase() + decision.slice(1)}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default ConfirmPantryDecisionModal;
