import { Flex, Tag } from '@chakra-ui/react';

interface TagGroupProps {
  values: string[];
  blueVariant?: boolean;
  onRemove?: (value: string) => void;
}

export const TagGroup: React.FC<TagGroupProps> = ({
  values,
  blueVariant,
  onRemove,
}) => {
  if (values.length === 0) return null;

  return (
    <Flex wrap="wrap" mt={1} gap={2}>
      {values.map((value) => (
        <Tag.Root
          key={value}
          bg={blueVariant ? 'teal.100' : 'neutral.100'}
          size={blueVariant ? 'md' : 'xl'}
          p={2}
          border="1px solid"
          borderColor={blueVariant ? 'teal.400' : 'neutral.300'}
          fontWeight={blueVariant ? 400 : 500}
          color="neutral.800"
        >
          <Tag.Label>{value}</Tag.Label>
          {onRemove && (
            <Tag.EndElement ml={4}>
              <Tag.CloseTrigger
                onClick={() => onRemove(value)}
                style={{ cursor: 'pointer' }}
              />
            </Tag.EndElement>
          )}
        </Tag.Root>
      ))}
    </Flex>
  );
};
