import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Text,
  HStack,
  VStack,
  Center,
  Input,
  Button,
  Textarea,
  RadioGroup,
  Stack,
  NativeSelect,
  NativeSelectIndicator,
  Menu,
} from '@chakra-ui/react';
import { ChevronDownIcon } from 'lucide-react';
import ApiClient from '@api/apiClient';
import {
  FoodManufacturer,
  UpdateFoodManufacturerApplicationDto,
} from '../../types/types';
import {
  Allergen,
  DonateWastedFood,
  ManufacturerAttribute,
} from '../../types/manufacturerEnums';
import { formatPhone } from '@utils/utils';
import { TagGroup } from '@components/forms/tagGroup';
import { USPhoneInput } from '@components/forms/usPhoneInput';

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const fieldHeaderStyles = {
  fontSize: '14px',
  color: 'neutral.800' as const,
  fontWeight: 600,
  mb: 1,
};

const fieldContentStyles = {
  fontSize: '14px',
  color: 'neutral.800' as const,
};

const sectionLabelStyles = {
  fontSize: '16px',
  fontWeight: 600,
  fontFamily: 'inter',
  color: 'neutral.800' as const,
  mb: 8,
};

const inputStyles = {
  borderColor: 'neutral.100' as const,
  color: 'neutral.600' as const,
  size: 'sm' as const,
};

const allergenOptions = Object.values(Allergen);
const donateWastedFoodOptions = Object.values(DonateWastedFood);
const manufacturerAttributeOptions = Object.values(ManufacturerAttribute);

// ---------------------------------------------------------------------------
// Read-only sub-components
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, children }) => (
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
const Field: React.FC<FieldProps> = ({ label, value, fallback = '-' }) => (
  <Box mb={10}>
    <Text {...fieldHeaderStyles}>{label}</Text>
    <Text {...fieldContentStyles}>{value || fallback}</Text>
  </Box>
);

// Edit Mode Subcomponents
interface EditFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  helperText?: string;
  required?: boolean;
}
const EditField: React.FC<EditFieldProps> = ({
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
const EditRadio: React.FC<EditRadioProps> = ({
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
const EditSelect: React.FC<EditSelectProps> = ({
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
const EditMultiSelect: React.FC<EditMultiSelectProps> = ({
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

type FormState = {
  secondaryContactFirstName: string;
  secondaryContactLastName: string;
  secondaryContactEmail: string;
  secondaryContactPhone: string;
  foodManufacturerName: string;
  foodManufacturerWebsite: string;
  unlistedProductAllergens: string[];
  facilityFreeAllergens: string[];
  productsGlutenFree: string;
  productsContainSulfites: string;
  productsSustainableExplanation: string;
  inKindDonations: string;
  donateWastedFood: string;
  manufacturerAttribute: string;
  additionalComments: string;
  newsletterSubscription: string;
};

function buildFormState(app: FoodManufacturer): FormState {
  return {
    secondaryContactFirstName: app.secondaryContactFirstName ?? '',
    secondaryContactLastName: app.secondaryContactLastName ?? '',
    secondaryContactEmail: app.secondaryContactEmail ?? '',
    secondaryContactPhone: app.secondaryContactPhone ?? '',
    foodManufacturerName: app.foodManufacturerName ?? '',
    foodManufacturerWebsite: app.foodManufacturerWebsite ?? '',
    unlistedProductAllergens: app.unlistedProductAllergens ?? [],
    facilityFreeAllergens: app.facilityFreeAllergens ?? [],
    productsGlutenFree: app.productsGlutenFree ? 'Yes, always' : 'No',
    productsContainSulfites: app.productsContainSulfites ? 'Yes' : 'No',
    productsSustainableExplanation: app.productsSustainableExplanation ?? '',
    inKindDonations: app.inKindDonations ? 'Yes' : 'No',
    donateWastedFood: app.donateWastedFood ?? '',
    manufacturerAttribute: app.manufacturerAttribute ?? '',
    additionalComments: app.additionalComments ?? '',
    newsletterSubscription:
      app.newsletterSubscription != null
        ? app.newsletterSubscription
          ? 'Yes'
          : 'No'
        : '',
  };
}

function validateRequired(form: FormState): boolean {
  if (!form.foodManufacturerName.trim()) return false;
  if (!form.foodManufacturerWebsite.trim()) return false;
  if (form.unlistedProductAllergens.length === 0) return false;
  if (form.facilityFreeAllergens.length === 0) return false;
  if (!form.productsGlutenFree) return false;
  if (!form.productsContainSulfites) return false;
  if (!form.productsSustainableExplanation.trim()) return false;
  if (!form.inKindDonations) return false;
  if (!form.donateWastedFood) return false;
  return true;
}

interface EditableFMApplicationProps {
  isEditing: boolean;
  onEditingChange: (v: boolean) => void;
}

const EditableFMApplication: React.FC<EditableFMApplicationProps> = ({
  isEditing,
  onEditingChange,
}) => {
  const [application, setApplication] = useState<FoodManufacturer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);

  const fetchApplication = useCallback(async () => {
    try {
      const manufacturerId = await ApiClient.getCurrentUserFoodManufacturerId();
      const data = await ApiClient.getFoodManufacturer(manufacturerId);
      setApplication(data);
      setForm(buildFormState(data));
    } catch {
      setError('Could not load application details. Please try again later.');
    }
  }, []);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  useEffect(() => {
    if (!isEditing && application) setForm(buildFormState(application));
  }, [isEditing, application]);

  const setField = (name: string, value: string) =>
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));

  const handleCancel = () => {
    if (application) setForm(buildFormState(application));
    onEditingChange(false);
  };

  const handleSave = async () => {
    if (!form || !application) return;

    if (!validateRequired(form)) {
      setError('Please complete all required fields before saving.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const formData: UpdateFoodManufacturerApplicationDto = {
        secondaryContactFirstName: form.secondaryContactFirstName || undefined,
        secondaryContactLastName: form.secondaryContactLastName || undefined,
        secondaryContactEmail: form.secondaryContactEmail || undefined,
        secondaryContactPhone: form.secondaryContactPhone || undefined,
        foodManufacturerName: form.foodManufacturerName || undefined,
        foodManufacturerWebsite: form.foodManufacturerWebsite || undefined,
        unlistedProductAllergens: form.unlistedProductAllergens as Allergen[],
        facilityFreeAllergens: form.facilityFreeAllergens as Allergen[],
        productsGlutenFree: form.productsGlutenFree === 'Yes, always',
        productsContainSulfites: form.productsContainSulfites === 'Yes',
        productsSustainableExplanation:
          form.productsSustainableExplanation || undefined,
        inKindDonations: form.inKindDonations === 'Yes',
        donateWastedFood:
          (form.donateWastedFood as DonateWastedFood) || undefined,
        manufacturerAttribute:
          (form.manufacturerAttribute as ManufacturerAttribute) || undefined,
        additionalComments: form.additionalComments || undefined,
        newsletterSubscription: form.newsletterSubscription
          ? form.newsletterSubscription === 'Yes'
          : undefined,
      };
      const updated = await ApiClient.updateFoodManufacturerApplicationData(
        application.foodManufacturerId,
        formData,
      );
      const updatedWithRelations = {
        ...application,
        ...updated,
        foodManufacturerRepresentative:
          application.foodManufacturerRepresentative,
        donations: application.donations,
      };
      setApplication(updatedWithRelations);
      setForm(buildFormState(updatedWithRelations));
      onEditingChange(false);
    } catch {
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!application || !form) {
    return (
      <Center py={16}>
        <Text textStyle="p2" color="neutral.500">
          {error ?? 'Application not found.'}
        </Text>
      </Center>
    );
  }

  // Read-only view
  if (!isEditing) {
    return (
      <VStack align="stretch" gap={10}>
        <Section title="Secondary Point of Contact">
          <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
            <Field
              label="First Name"
              value={application.secondaryContactFirstName}
            />
            <Field
              label="Last Name"
              value={application.secondaryContactLastName}
            />
            <Field
              label="Email Address"
              value={application.secondaryContactEmail}
            />
            <Field
              label="Phone Number"
              value={formatPhone(application.secondaryContactPhone)}
            />
          </Grid>
        </Section>

        <Section title="Company Information">
          <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
            <Field
              label="Company Name"
              value={application.foodManufacturerName}
            />
            <Field
              label="Company Website"
              value={application.foodManufacturerWebsite}
            />
          </Grid>
        </Section>

        <Section title="Product Details">
          <Box mb={10}>
            <Text {...fieldHeaderStyles}>
              Allergens not listed in product ingredients
            </Text>
            {application.unlistedProductAllergens?.length ? (
              <TagGroup values={application.unlistedProductAllergens} />
            ) : (
              <Text {...fieldContentStyles}>-</Text>
            )}
          </Box>
          <Box mb={10}>
            <Text {...fieldHeaderStyles}>
              Allergens that facilities are free from
            </Text>
            {application.facilityFreeAllergens?.length ? (
              <TagGroup values={application.facilityFreeAllergens} />
            ) : (
              <Text {...fieldContentStyles}>-</Text>
            )}
          </Box>
          <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
            <Field
              label="Are products certified gluten-free"
              value={application.productsGlutenFree ? 'Yes, always' : 'No'}
            />
            <Field
              label="Does product contain sulfites?"
              value={application.productsContainSulfites ? 'Yes' : 'No'}
            />
            <Field
              label="Provides in-kind food donations"
              value={application.inKindDonations ? 'Yes' : 'No'}
            />
            <Field
              label="Donates food-rescue"
              value={application.donateWastedFood}
            />
          </Grid>
          <Field
            label="Are your products sustainable or environmentally conscious?"
            value={application.productsSustainableExplanation}
          />
          <Field label="Pantry is" value={application.manufacturerAttribute} />
          <Field
            label="Additional Information"
            value={application.additionalComments}
          />
          <Field
            label="Subscribed to Newsletter"
            value={
              application.newsletterSubscription != null
                ? application.newsletterSubscription
                  ? 'Yes'
                  : 'No'
                : undefined
            }
          />
        </Section>
      </VStack>
    );
  }

  // Editing view
  return (
    <VStack align="stretch" gap={2}>
      <Box mb={4}>
        <Text {...sectionLabelStyles}>Secondary Point of Contact</Text>
        <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
          <EditField
            label="First Name"
            name="secondaryContactFirstName"
            value={form.secondaryContactFirstName}
            onChange={(v) => setField('secondaryContactFirstName', v)}
          />
          <EditField
            label="Last Name"
            name="secondaryContactLastName"
            value={form.secondaryContactLastName}
            onChange={(v) => setField('secondaryContactLastName', v)}
          />
          <EditField
            label="Email Address"
            name="secondaryContactEmail"
            value={form.secondaryContactEmail}
            onChange={(v) => setField('secondaryContactEmail', v)}
          />
          <Box mb={6}>
            <Text {...fieldHeaderStyles} mb={2}>
              Phone Number
            </Text>
            <USPhoneInput
              value={form.secondaryContactPhone}
              onChange={(v) => setField('secondaryContactPhone', v)}
              allowEmpty
              inputProps={{
                name: 'secondaryContactPhone',
                borderColor: 'neutral.100',
                color: 'neutral.600',
                size: 'sm',
              }}
            />
          </Box>
        </Grid>
      </Box>

      <Box mb={4}>
        <Text {...sectionLabelStyles}>Company Information</Text>
        <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
          <EditField
            label="Company Name"
            name="foodManufacturerName"
            value={form.foodManufacturerName}
            onChange={(v) => setField('foodManufacturerName', v)}
            required
          />
          <EditField
            label="Company Website"
            name="foodManufacturerWebsite"
            value={form.foodManufacturerWebsite}
            onChange={(v) => setField('foodManufacturerWebsite', v)}
            required
          />
        </Grid>
      </Box>

      <Text {...sectionLabelStyles}>Product Details</Text>

      <EditMultiSelect
        label="Allergens not listed in product ingredients"
        value={form.unlistedProductAllergens}
        options={allergenOptions}
        onChange={(v) =>
          setForm((prev) =>
            prev ? { ...prev, unlistedProductAllergens: v } : prev,
          )
        }
        triggerLabel="Select allergens"
        required
      />

      <EditMultiSelect
        label="Allergens that facilities are free from"
        value={form.facilityFreeAllergens}
        options={allergenOptions}
        onChange={(v) =>
          setForm((prev) =>
            prev ? { ...prev, facilityFreeAllergens: v } : prev,
          )
        }
        triggerLabel="Select allergens"
        required
      />

      <EditRadio
        label="Are products certified gluten-free"
        name="productsGlutenFree"
        value={form.productsGlutenFree}
        options={['Yes, always', 'No']}
        onChange={(v) => setField('productsGlutenFree', v)}
        required
      />

      <EditRadio
        label="Does product contain sulfites?"
        name="productsContainSulfites"
        value={form.productsContainSulfites}
        options={['Yes', 'No']}
        onChange={(v) => setField('productsContainSulfites', v)}
        required
      />

      <EditRadio
        label="Provides in-kind food donations"
        name="inKindDonations"
        value={form.inKindDonations}
        options={['Yes', 'No']}
        onChange={(v) => setField('inKindDonations', v)}
        required
      />

      <EditRadio
        label="Donates food-rescue"
        name="donateWastedFood"
        value={form.donateWastedFood}
        options={donateWastedFoodOptions}
        onChange={(v) => setField('donateWastedFood', v)}
        required
      />

      <EditField
        label="Are your products sustainable or environmentally conscious?"
        name="productsSustainableExplanation"
        value={form.productsSustainableExplanation}
        onChange={(v) => setField('productsSustainableExplanation', v)}
        textarea
        required
      />

      <EditSelect
        label="Pantry is"
        name="manufacturerAttribute"
        value={form.manufacturerAttribute}
        options={manufacturerAttributeOptions}
        onChange={(v) => setField('manufacturerAttribute', v)}
      />

      <EditField
        label="Additional Information"
        name="additionalComments"
        value={form.additionalComments}
        onChange={(v) => setField('additionalComments', v)}
        textarea
      />

      <EditRadio
        label="Subscribed to Newsletter"
        name="newsletterSubscription"
        value={form.newsletterSubscription}
        options={['Yes', 'No']}
        onChange={(v) => setField('newsletterSubscription', v)}
      />

      {error && (
        <Text color="red" fontSize="14px" mb={2}>
          {error}
        </Text>
      )}

      <HStack justify="flex-end" gap={3} mt={6}>
        <Button
          variant="outline"
          size="sm"
          color="neutral.800"
          onClick={handleCancel}
          disabled={isSaving}
          borderColor="neutral.200"
          fontWeight={600}
        >
          Cancel
        </Button>
        <Button
          color="white"
          bg="blue.hover"
          variant="solid"
          size="sm"
          px={7}
          onClick={handleSave}
          loading={isSaving}
          fontWeight={600}
        >
          Save Changes
        </Button>
      </HStack>
    </VStack>
  );
};

export default EditableFMApplication;
