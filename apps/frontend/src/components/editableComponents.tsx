import React from 'react';
import {
  Box,
  Text,
  Input,
  Textarea,
  RadioGroup,
  Stack,
  NativeSelect,
  NativeSelectIndicator,
  Menu,
  Button,
  Grid,
} from '@chakra-ui/react';
import { ChevronDownIcon } from 'lucide-react';
import { TagGroup } from '@components/forms/tagGroup';

export const fieldHeaderStyles = {
  fontSize: '14px',
  color: 'neutral.800',
  fontWeight: 600,
  mb: 1,
};

export const fieldContentStyles = {
  fontSize: '14px',
  color: 'neutral.800',
};

export const sectionLabelStyles = {
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'inter',
  color: 'neutral.800',
  mb: 8,
};

export const inputStyles = {
  borderColor: 'neutral.100',
  color: 'neutral.600',
  size: 'sm' as const,
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
export const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Box>
    <Text {...sectionLabelStyles}>{title}</Text>
    {children}
  </Box>
);

interface FieldProps {
  label: string;
  value?: string | null;
  fallback?: string;
}
export const Field: React.FC<FieldProps> = ({
  label,
  value,
  fallback = '-',
}) => (
  <Box mb={14}>
    <Text {...fieldHeaderStyles}>{label}</Text>
    <Text {...fieldContentStyles}>{value || fallback}</Text>
  </Box>
);

interface EditFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  helperText?: string;
  required?: boolean;
}
export const EditField: React.FC<EditFieldProps> = ({
  label,
  name,
  value,
  onChange,
  textarea,
  helperText,
  required,
}) => (
  <Box mb={6}>
    <Text {...fieldHeaderStyles} mb={2}>
      {label}
      {required && (
        <Text as="span" color="red" ml="1">
          *
        </Text>
      )}
    </Text>
    {textarea ? (
      <Textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputStyles}
        color="neutral.800"
        autoresize
        placeholder="-"
      />
    ) : (
      <Input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputStyles}
      />
    )}
    {helperText && (
      <Text fontSize="13px" color="neutral.600" mt={1}>
        {helperText}
      </Text>
    )}
  </Box>
);

interface EditRadioProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  helperText?: string;
  required?: boolean;
}
export const EditRadio: React.FC<EditRadioProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  helperText,
  required,
}) => (
  <Box mb={6}>
    <Text {...fieldHeaderStyles} mb={helperText ? 1 : 2}>
      {label}
      {required && (
        <Text as="span" color="red" ml="1">
          *
        </Text>
      )}
    </Text>
    {helperText && (
      <Text fontSize="13px" color="neutral.600" mb={2}>
        {helperText}
      </Text>
    )}
    <RadioGroup.Root
      name={name}
      value={value}
      variant="solid"
      colorPalette="neutral"
      onValueChange={(e: { value: string }) => onChange(e.value)}
    >
      <Stack>
        {options.map((opt) => (
          <RadioGroup.Item key={opt} value={opt}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }}>
              <RadioGroup.ItemIndicator
                border="1px solid"
                borderColor="neutral.100"
              />
            </RadioGroup.ItemControl>
            <RadioGroup.ItemText color="neutral.700" textStyle="p2">
              {opt}
            </RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </Stack>
    </RadioGroup.Root>
  </Box>
);

interface EditSelectProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
}
export const EditSelect: React.FC<EditSelectProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  helperText,
  required,
  placeholder,
}) => (
  <Box mb={6}>
    <Text {...fieldHeaderStyles} mb={2}>
      {label}
      {required && (
        <Text as="span" color="red" ml="1">
          *
        </Text>
      )}
    </Text>
    <NativeSelect.Root borderColor="neutral.100">
      <NativeSelect.Field
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputStyles}
      >
        <option value="">{placeholder ?? 'Select an option'}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelectIndicator />
    </NativeSelect.Root>
    {helperText && (
      <Text fontSize="13px" color="neutral.600" mt={1}>
        {helperText}
      </Text>
    )}
  </Box>
);

interface EditMultiSelectProps {
  label: string;
  value: string[];
  options: string[];
  onChange: (v: string[]) => void;
  triggerLabel?: string;
  helperText?: string;
  required?: boolean;
}
export const EditMultiSelect: React.FC<EditMultiSelectProps> = ({
  label,
  value,
  options,
  onChange,
  triggerLabel,
  helperText,
  required,
}) => (
  <Box mb={6}>
    <Text {...fieldHeaderStyles} mb={2}>
      {label}
      {required && (
        <Text as="span" color="red" ml="1">
          *
        </Text>
      )}
    </Text>
    <Menu.Root closeOnSelect={false} colorPalette="neutral">
      <Menu.Trigger asChild>
        <Button
          pl={3}
          pr={2}
          w="full"
          bgColor="white"
          color="neutral.800"
          borderColor="neutral.100"
          justifyContent="space-between"
          textStyle="p2"
          size="sm"
          borderWidth="1px"
          borderStyle="solid"
        >
          {value.length > 0 ? `Select more` : triggerLabel ?? 'Select options'}
          <ChevronDownIcon />
        </Button>
      </Menu.Trigger>
      <Menu.Positioner w="full">
        <Menu.Content maxH="400px" overflowY="auto">
          {options.map((opt) => (
            <Menu.CheckboxItem
              key={opt}
              checked={value.includes(opt)}
              onCheckedChange={(checked: boolean) =>
                onChange(
                  checked ? [...value, opt] : value.filter((i) => i !== opt),
                )
              }
              display="flex"
              alignItems="center"
            >
              <Box
                position="absolute"
                left={1}
                ml={0.5}
                w={5}
                h={5}
                borderWidth="1px"
                borderRadius="4px"
                borderColor="neutral.200"
              />
              <Menu.ItemIndicator />
              <Text
                ml={0.5}
                color="neutral.800"
                fontWeight={500}
                fontFamily="Inter"
              >
                {opt}
              </Text>
            </Menu.CheckboxItem>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
    {value.length > 0 && (
      <TagGroup
        values={value}
        onRemove={(v) => onChange(value.filter((i) => i !== v))}
        blueVariant
      />
    )}
    {helperText && (
      <Text fontSize="13px" color="neutral.600" mt={1}>
        {helperText}
      </Text>
    )}
  </Box>
);

const ADDRESS_FIELDS = [
  { suffix: 'Line1', label: 'Address Line 1' },
  { suffix: 'Line2', label: 'Address Line 2' },
  { suffix: 'City', label: 'City/Town' },
  { suffix: 'State', label: 'State/Region/Province' },
  { suffix: 'Zip', label: 'Zip/Postal Code' },
  { suffix: 'Country', label: 'Country' },
];

interface EditAddressSectionProps {
  title: string;
  prefix: string;
  form: { [key: string]: string | boolean | string[] };
  onChange: (name: string, value: string) => void;
  requiredSuffixes: string[];
}

export const EditAddressSection: React.FC<EditAddressSectionProps> = ({
  title,
  prefix,
  form,
  onChange,
  requiredSuffixes,
}) => {
  const str = (key: string) => (form[key] as string) ?? '';
  return (
    <Box mb={6}>
      <Text {...sectionLabelStyles}>{title}</Text>
      <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
        {ADDRESS_FIELDS.map(({ suffix, label }) => (
          <EditField
            key={suffix}
            label={label}
            name={`${prefix}${suffix}`}
            value={str(`${prefix}${suffix}`)}
            onChange={(v) => onChange(`${prefix}${suffix}`, v)}
            required={requiredSuffixes.includes(suffix)}
          />
        ))}
      </Grid>
    </Box>
  );
};
