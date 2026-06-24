import { HStack } from '@chakra-ui/react';
import { Pencil, Trash2 } from 'lucide-react';

interface EditDeleteButtonProps {
  onClick?: () => void;
}

export const EditButton: React.FC<EditDeleteButtonProps> = ({ onClick }) => {
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
      color={'gray.800'}
      background="gray.subtle"
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
      color="red.700"
      background="red.subtle"
      cursor="pointer"
      _hover={{ background: 'red.300' }}
      onClick={onClick}
    >
      <Trash2 size={14} />
    </HStack>
  );
};
