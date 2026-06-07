import { HStack } from '@chakra-ui/react';
import { Pencil, Trash2 } from 'lucide-react';

interface EditDeleteButtonProps {
  onClick: () => void;
}

export const EditButton: React.FC<EditDeleteButtonProps> = ({ onClick }) => {
  return (
    <HStack
      height={6}
      minWidth={6}
      padding={0.5}
      justify="center"
      align="center"
      gap={1}
      borderRadius="sm"
      color={'neutral.800'}
      background="neutral.50"
      cursor="pointer"
      _hover={{ background: 'neutral.200' }}
      onClick={onClick}
    >
      <Pencil size={14} />
    </HStack>
  );
};

export const DeleteButton: React.FC<EditDeleteButtonProps> = ({ onClick }) => {
  return (
    <HStack
      width={6}
      height={6}
      minWidth={6}
      padding={0.5}
      justify="center"
      align="center"
      gap={1}
      flexShrink={0}
      borderRadius="sm"
      color="red.hover"
      background="red.200"
      cursor="pointer"
      _hover={{ background: 'red.300' }}
      onClick={onClick}
    >
      <Trash2 size={14} />
    </HStack>
  );
};
