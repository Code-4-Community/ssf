import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
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
import { PantryWithUser, UpdatePantryApplicationDto } from '../../types/types';
import { Activity } from '../../types/pantryEnums';
import { formatPhone } from '@utils/utils';
import { TagGroup } from '@components/forms/tagGroup';
import { USPhoneInput } from '@components/forms/usPhoneInput';
import {
  dietaryRestrictionOptions,
  activityOptions,
} from '@components/forms/pantryApplicationForm';

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

const allergenClientOptions = [
  '< 10',
  '10 to 20',
  '20 to 50',
  '50 to 100',
  '> 100',
  "I'm not sure",
  'I have an exact number',
];

// Maps between stored Activity enum values and display strings shown in the form
const activityDisplayMap: Record<string, string> = {
  [Activity.CREATE_LABELED_SHELF]:
    'Create a labeled, allergy-friendly shelf or shelves',
  [Activity.PROVIDE_EDUCATIONAL_PAMPHLETS]:
    'Provide clients and staff/volunteers with educational pamphlets',
  [Activity.TRACK_DIETARY_NEEDS]:
    "Use a spreadsheet to track clients' medical dietary needs and distribution of SSF items per month",
  [Activity.POST_RESOURCE_FLYERS]:
    'Post allergen-free resource flyers throughout pantry',
  [Activity.SURVEY_CLIENTS]:
    'Survey your clients to determine their medical dietary needs',
  [Activity.COLLECT_FEEDBACK]:
    'Collect feedback from allergen-avoidant clients on SSF foods',
  [Activity.SOMETHING_ELSE]: 'Something else',
};
const activityStorageMap: Record<string, Activity> = Object.fromEntries(
  Object.entries(activityDisplayMap).map(([k, v]) => [v, k as Activity]),
);

const clientVisitOptions = [
  'Daily',
  'More than once a week',
  'Once a week',
  'A few times a month',
  'Once a month',
];
const identifyAllergensOptions = [
  'Very confident',
  'Somewhat confident',
  'Not very confident (we need more education!)',
];
const serveChildrenOptions = ['Yes, many (> 10)', 'Yes, a few (< 10)', 'No'];

// Read-only Mode Subcomponents
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

interface AddressSectionProps {
  title: string;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}
const AddressSection: React.FC<AddressSectionProps> = ({
  title,
  line1,
  line2,
  city,
  state,
  zip,
  country,
}) => (
  <Section title={title}>
    <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
      <Field label="Address Line 1" value={line1} />
      <Field label="Address Line 2" value={line2} />
      <Field label="City/Town" value={city} />
      <Field label="State/Region/Province" value={state} />
      <Field label="Zip/Postal Code" value={zip} />
      <Field
        label="Country"
        value={
          country === 'US' ? 'United States of America' : country ?? undefined
        }
      />
    </Grid>
  </Section>
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
}
const EditSelect: React.FC<EditSelectProps> = ({
  label,
  name,
  value,
  options,
  onChange,
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
    <NativeSelect.Root borderColor="neutral.100">
      <NativeSelect.Field
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputStyles}
      >
        <option value="">Select an option</option>
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
}
const EditAddressSection: React.FC<EditAddressSectionProps> = ({
  title,
  prefix,
  form,
  onChange,
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
          />
        ))}
      </Grid>
    </Box>
  );
};

type FormState = {
  secondaryContactFirstName: string;
  secondaryContactLastName: string;
  secondaryContactEmail: string;
  secondaryContactPhone: string;
  shipmentLine1: string;
  shipmentLine2: string;
  shipmentCity: string;
  shipmentState: string;
  shipmentZip: string;
  shipmentCountry: string;
  mailingLine1: string;
  mailingLine2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  mailingCountry: string;
  acceptFoodDeliveries: string;
  deliveryWindowInstructions: string;
  restrictions: string[];
  allergenClients: string;
  allergenClientsExact: string;
  refrigeratedDonation: string;
  reserveFoodForAllergic: string;
  reservationExplanation: string;
  dedicatedAllergyFriendly: string;
  clientVisitFrequency: string;
  identifyAllergensConfidence: string;
  serveAllergicChildren: string;
  activities: string[];
  activitiesComments: string;
  itemsInStock: string;
  needMoreOptions: string;
  newsletterSubscription: string;
};

function buildFormState(app: PantryWithUser): FormState {
  // If allergenClients is not one of the dropdown options it was entered as an exact number
  const storedAllergenClients = app.allergenClients ?? '';
  const isStandardAllergenOption = allergenClientOptions.includes(
    storedAllergenClients,
  );
  return {
    secondaryContactFirstName: app.secondaryContactFirstName ?? '',
    secondaryContactLastName: app.secondaryContactLastName ?? '',
    secondaryContactEmail: app.secondaryContactEmail ?? '',
    secondaryContactPhone: app.secondaryContactPhone ?? '',
    shipmentLine1: app.shipmentAddressLine1 ?? '',
    shipmentLine2: app.shipmentAddressLine2 ?? '',
    shipmentCity: app.shipmentAddressCity ?? '',
    shipmentState: app.shipmentAddressState ?? '',
    shipmentZip: app.shipmentAddressZip ?? '',
    shipmentCountry: app.shipmentAddressCountry ?? '',
    mailingLine1: app.mailingAddressLine1 ?? '',
    mailingLine2: app.mailingAddressLine2 ?? '',
    mailingCity: app.mailingAddressCity ?? '',
    mailingState: app.mailingAddressState ?? '',
    mailingZip: app.mailingAddressZip ?? '',
    mailingCountry: app.mailingAddressCountry ?? '',
    acceptFoodDeliveries: app.acceptFoodDeliveries ? 'Yes' : 'No',
    deliveryWindowInstructions: app.deliveryWindowInstructions ?? '',
    restrictions: app.restrictions ?? [],
    allergenClients: isStandardAllergenOption
      ? storedAllergenClients
      : 'I have an exact number',
    allergenClientsExact: isStandardAllergenOption ? '' : storedAllergenClients,
    refrigeratedDonation: app.refrigeratedDonation ?? '',
    reserveFoodForAllergic: app.reserveFoodForAllergic ?? '',
    reservationExplanation: app.reservationExplanation ?? '',
    dedicatedAllergyFriendly: app.dedicatedAllergyFriendly ? 'Yes' : 'No',
    clientVisitFrequency: app.clientVisitFrequency ?? '',
    identifyAllergensConfidence: app.identifyAllergensConfidence ?? '',
    serveAllergicChildren: app.serveAllergicChildren ?? '',
    activities: (app.activities ?? []).map((a) => activityDisplayMap[a] ?? a),
    activitiesComments: app.activitiesComments ?? '',
    itemsInStock: app.itemsInStock ?? '',
    needMoreOptions: app.needMoreOptions ?? '',
    newsletterSubscription: app.newsletterSubscription ? 'Yes' : 'No',
  };
}

function validateRequired(form: FormState): boolean {
  if (!form.allergenClients) return false;
  if (
    form.allergenClients === 'I have an exact number' &&
    !form.allergenClientsExact.trim()
  )
    return false;
  if (!form.refrigeratedDonation) return false;
  if (!form.dedicatedAllergyFriendly) return false;
  if (!form.reserveFoodForAllergic) return false;
  if (form.activities.length === 0) return false;
  if (!form.itemsInStock.trim()) return false;
  if (!form.needMoreOptions.trim()) return false;
  if (
    form.activities.includes('Something else') &&
    !form.activitiesComments.trim()
  )
    return false;
  return true;
}

interface EditablePantryApplicationProps {
  isEditing: boolean;
  onEditingChange: (v: boolean) => void;
}

const EditablePantryApplication: React.FC<EditablePantryApplicationProps> = ({
  isEditing,
  onEditingChange,
}) => {
  const [application, setApplication] = useState<PantryWithUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);

  const fetchApplication = useCallback(async () => {
    try {
      const pantryId = await ApiClient.getCurrentUserPantryId();
      const data = await ApiClient.getPantry(pantryId);
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
      const formData: UpdatePantryApplicationDto = {
        secondaryContactFirstName: form.secondaryContactFirstName || undefined,
        secondaryContactLastName: form.secondaryContactLastName || undefined,
        secondaryContactEmail: form.secondaryContactEmail || undefined,
        secondaryContactPhone: form.secondaryContactPhone || undefined,
        shipmentAddressLine1: form.shipmentLine1 || undefined,
        shipmentAddressLine2: form.shipmentLine2 || undefined,
        shipmentAddressCity: form.shipmentCity || undefined,
        shipmentAddressState: form.shipmentState || undefined,
        shipmentAddressZip: form.shipmentZip || undefined,
        shipmentAddressCountry: form.shipmentCountry || undefined,
        mailingAddressLine1: form.mailingLine1 || undefined,
        mailingAddressLine2: form.mailingLine2 || undefined,
        mailingAddressCity: form.mailingCity || undefined,
        mailingAddressState: form.mailingState || undefined,
        mailingAddressZip: form.mailingZip || undefined,
        mailingAddressCountry: form.mailingCountry || undefined,
        acceptFoodDeliveries: form.acceptFoodDeliveries === 'Yes',
        deliveryWindowInstructions:
          form.deliveryWindowInstructions || undefined,
        allergenClients:
          form.allergenClients === 'I have an exact number'
            ? form.allergenClientsExact || undefined
            : form.allergenClients || undefined,
        restrictions: form.restrictions,
        refrigeratedDonation: form.refrigeratedDonation || undefined,
        dedicatedAllergyFriendly: form.dedicatedAllergyFriendly === 'Yes',
        reserveFoodForAllergic: form.reserveFoodForAllergic || undefined,
        reservationExplanation:
          form.reserveFoodForAllergic === 'Yes' ||
          form.reserveFoodForAllergic === 'Some'
            ? form.reservationExplanation || undefined
            : null,
        clientVisitFrequency: form.clientVisitFrequency || undefined,
        identifyAllergensConfidence:
          form.identifyAllergensConfidence || undefined,
        serveAllergicChildren: form.serveAllergicChildren || undefined,
        activities: form.activities.map((a) => activityStorageMap[a] ?? a),
        activitiesComments: form.activitiesComments || undefined,
        itemsInStock: form.itemsInStock || undefined,
        needMoreOptions: form.needMoreOptions || undefined,
        newsletterSubscription: form.newsletterSubscription === 'Yes',
      };
      const updated = await ApiClient.updatePantryApplication(
        application.pantryId,
        formData,
      );
      const updatedWithUser = {
        ...application,
        ...updated,
        pantryUser: application.pantryUser,
      };
      setApplication(updatedWithUser);
      setForm(buildFormState(updatedWithUser));
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

        <Section title="Shipping Address">
          <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
            <Field
              label="Address Line 1"
              value={application.shipmentAddressLine1}
            />
            <Field
              label="Address Line 2"
              value={application.shipmentAddressLine2}
            />
            <Field label="City/Town" value={application.shipmentAddressCity} />
            <Field
              label="State/Region/Province"
              value={application.shipmentAddressState}
            />
            <Field
              label="Zip/Postal Code"
              value={application.shipmentAddressZip}
            />
            <Field
              label="Country"
              value={
                application.shipmentAddressCountry === 'US'
                  ? 'United States of America'
                  : application.shipmentAddressCountry ?? undefined
              }
            />
          </Grid>
          <Field
            label="Accepts Food Deliveries Mon–Fri?"
            value={application.acceptFoodDeliveries ? 'Yes' : 'No'}
          />
          <Field
            label="Delivery Window Restrictions"
            value={application.deliveryWindowInstructions}
          />
        </Section>

        <AddressSection
          title="Mailing Address"
          line1={application.mailingAddressLine1}
          line2={application.mailingAddressLine2}
          city={application.mailingAddressCity}
          state={application.mailingAddressState}
          zip={application.mailingAddressZip}
          country={application.mailingAddressCountry}
        />

        <Section title="Pantry Details">
          <Box mb={10}>
            <Text {...fieldHeaderStyles}>Food Allergies and Restrictions</Text>
            {application.restrictions?.length ? (
              <TagGroup values={application.restrictions} />
            ) : (
              <Text {...fieldContentStyles}>-</Text>
            )}
          </Box>

          <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
            <Field
              label="Approximate # of Clients"
              value={application.allergenClients}
            />
            <Field
              label="Accepts Refrigerated Donations?"
              value={application.refrigeratedDonation}
            />
            <Field
              label="Willing to Reserve Food for Allergen-Avoidant Individuals?"
              value={application.reserveFoodForAllergic}
            />
            <Field
              label="Dedicated Section for Allergy-Friendly Items?"
              value={application.dedicatedAllergyFriendly ? 'Yes' : 'No'}
            />
            <GridItem colSpan={2}>
              <Field
                label="Justification"
                value={application.reservationExplanation}
              />
            </GridItem>
            <Field
              label="How Often Do Allergen-Avoidant Clients Visit?"
              value={application.clientVisitFrequency}
            />
            <Field
              label="Confident in Identifying the Top 9 Allergens?"
              value={application.identifyAllergensConfidence}
            />
            <Field
              label="Serves Allergen-Avoidant Children?"
              value={application.serveAllergicChildren}
            />
          </Grid>

          <Box mb={10}>
            <Text {...fieldHeaderStyles}>Activities with SSF</Text>
            {application.activities?.length ? (
              <TagGroup
                values={application.activities.map(
                  (a) => activityDisplayMap[a] ?? a,
                )}
              />
            ) : (
              <Text {...fieldContentStyles}>-</Text>
            )}
          </Box>

          <Field
            label="Comments/Concerns"
            value={application.activitiesComments}
          />
          <Field
            label="Allergen-free Items in Stock"
            value={application.itemsInStock}
          />
          <Field label="Client Requests" value={application.needMoreOptions} />
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

      <EditAddressSection
        title="Shipping Address"
        prefix="shipment"
        form={form}
        onChange={setField}
      />

      <EditRadio
        label="Would your pantry be able to accept food deliveries during standard business hours Mon-Fri?"
        name="acceptFoodDeliveries"
        value={form.acceptFoodDeliveries}
        options={['Yes', 'No']}
        onChange={(v) => setField('acceptFoodDeliveries', v)}
      />

      <EditField
        label="Please note any delivery window restrictions."
        name="deliveryWindowInstructions"
        value={form.deliveryWindowInstructions}
        onChange={(v) => setField('deliveryWindowInstructions', v)}
        textarea
      />

      <EditAddressSection
        title="Mailing Address"
        prefix="mailing"
        form={form}
        onChange={setField}
      />

      <Text {...sectionLabelStyles}>Pantry Details</Text>

      <EditSelect
        label="Approximately how many allergen-avoidant clients does your pantry serve?"
        name="allergenClients"
        value={form.allergenClients}
        options={allergenClientOptions}
        onChange={(v) => setField('allergenClients', v)}
        required
      />

      {form.allergenClients === 'I have an exact number' && (
        <EditField
          label="Please provide the exact number, if known"
          name="allergenClientsExact"
          value={form.allergenClientsExact}
          onChange={(v) => setField('allergenClientsExact', v)}
          required
        />
      )}

      <EditMultiSelect
        label="Which food allergies or other medical dietary restrictions do clients at your pantry report?"
        value={form.restrictions}
        options={dietaryRestrictionOptions}
        onChange={(v) =>
          setForm((prev) => (prev ? { ...prev, restrictions: v } : prev))
        }
        triggerLabel="Select restrictions"
      />

      <EditRadio
        label="Would you be able to accept frozen donations that require refrigeration or freezing?"
        name="refrigeratedDonation"
        value={form.refrigeratedDonation}
        options={['Yes, always', 'No', 'Sometimes (check in before sending)']}
        onChange={(v) => setField('refrigeratedDonation', v)}
        required
      />

      <EditRadio
        label="Do you have a dedicated shelf or section of your pantry for allergy-friendly items?"
        name="dedicatedAllergyFriendly"
        value={form.dedicatedAllergyFriendly}
        options={['Yes', 'No']}
        onChange={(v) => setField('dedicatedAllergyFriendly', v)}
        required
      />

      <EditRadio
        label="Are you willing to reserve our food shipments for allergen-avoidant individuals?"
        name="reserveFoodForAllergic"
        value={form.reserveFoodForAllergic}
        options={['Yes', 'Some', 'No']}
        helperText="For example, grouping allergen-friendly items on a separate shelf or in separate bins and encouraging non-allergic clients to save these items for clients who do not have other safe food options."
        onChange={(v) => setField('reserveFoodForAllergic', v)}
        required
      />

      {(form.reserveFoodForAllergic === 'Yes' ||
        form.reserveFoodForAllergic === 'Some') && (
        <EditField
          label={
            form.reserveFoodForAllergic === 'Yes'
              ? 'How would you work to ensure that allergen-friendly foods are distributed to clients with food allergies or other adverse reactions to foods?'
              : 'Please explain why you selected "Some."'
          }
          name="reservationExplanation"
          value={form.reservationExplanation}
          onChange={(v) => setField('reservationExplanation', v)}
          textarea
        />
      )}

      <EditSelect
        label="How often do allergen-avoidant clients visit your food pantry?"
        name="clientVisitFrequency"
        value={form.clientVisitFrequency}
        options={clientVisitOptions}
        onChange={(v) => setField('clientVisitFrequency', v)}
      />

      <EditSelect
        label="Are you confident in identifying the top 9 allergens in an ingredient list?"
        name="identifyAllergensConfidence"
        value={form.identifyAllergensConfidence}
        options={identifyAllergensOptions}
        helperText="The top 9 allergens are milk, egg, peanut, tree nuts, wheat, soy, fish, shellfish, and sesame."
        onChange={(v) => setField('identifyAllergensConfidence', v)}
      />

      <EditSelect
        label="Do you serve allergen-avoidant or food-allergic children at your pantry?"
        name="serveAllergicChildren"
        value={form.serveAllergicChildren}
        options={serveChildrenOptions}
        helperText='"Children" is defined as any individual under the age of 18 either living independently or as part of a household.'
        onChange={(v) => setField('serveAllergicChildren', v)}
      />

      <EditMultiSelect
        label="What activities are you open to doing with SSF?"
        value={form.activities}
        options={activityOptions}
        onChange={(v) =>
          setForm((prev) => (prev ? { ...prev, activities: v } : prev))
        }
        triggerLabel="Select activities"
        helperText="Food donations are one part of being a partner pantry. The following are additional ways to help us better support you! Please select all that apply."
        required
      />

      <EditField
        label="Please list any comments/concerns related to the previous question."
        name="activitiesComments"
        value={form.activitiesComments}
        onChange={(v) => setField('activitiesComments', v)}
        textarea
        required={form.activities.includes('Something else')}
        helperText='If you answered "Something Else," please elaborate.'
      />

      <EditField
        label="What types of allergen-free items, if any, do you currently have in stock?"
        name="itemsInStock"
        value={form.itemsInStock}
        onChange={(v) => setField('itemsInStock', v)}
        textarea
        required
        helperText="For example, gluten-free breads, sunflower seed butters, nondairy beverages, etc."
      />

      <EditField
        label="Do allergen-avoidant clients at your pantry ever request a greater variety of items or not have enough options? Please explain."
        name="needMoreOptions"
        value={form.needMoreOptions}
        onChange={(v) => setField('needMoreOptions', v)}
        textarea
        required
      />

      <EditRadio
        label="Would you like to subscribe to our quarterly newsletter?"
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

export default EditablePantryApplication;
