import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  HStack,
  VStack,
  Center,
  Button,
} from '@chakra-ui/react';
import axios from 'axios';
import ApiClient from '@api/apiClient';
import { PantryWithUser, UpdatePantryApplicationDto } from '../../types/types';
import {
  Activity,
  RefrigeratedDonation,
  ReserveFoodForAllergic,
  ClientVisitFrequency,
  ServeAllergicChildren,
  DedicatedAllergyFriendly,
} from '../../types/pantryEnums';
import { formatPhone } from '@utils/utils';
import { TagGroup } from '@components/forms/tagGroup';
import { USPhoneInput } from '@components/forms/usPhoneInput';
import {
  dietaryRestrictionOptions,
  restrictionsOtherOption,
  languageOptions,
  languageOtherOption,
} from '@components/forms/pantryApplicationForm';
import {
  fieldHeaderStyles,
  fieldContentStyles,
  sectionLabelStyles,
  Section,
  Field,
  EditField,
  EditRadio,
  EditSelect,
  EditMultiSelect,
  EditAddressSection,
} from '@components/editableComponents';
import { AuthError } from 'aws-amplify/auth';

const allergenClientOptions = [
  'Less than 10',
  '10 to 20',
  '20 to 50',
  '50 to 100',
  'Greater than 100',
  "I'm not sure",
  'I have an exact number',
];

// The application form no longer offers "Something else", so it is excluded
// from the options a pantry can pick when editing.
const activityEditOptions = Object.values(Activity).filter(
  (activity) => activity !== Activity.SOMETHING_ELSE,
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
  restrictionsOther: string;
  languages: string[];
  languagesOther: string;
  allergenClients: string;
  allergenClientsExact: string;
  refrigeratedDonation: string;
  reserveFoodForAllergic: string;
  reservationExplanation: string;
  dedicatedAllergyFriendly: string;
  clientVisitFrequency: string;
  serveAllergicChildren: string;
  activities: string[];
  activitiesComments: string;
  itemsInStock: string;
  needMoreOptions: string;
};

// Splits a stored multiselect array into the values that match preset options
// and any free-text "other" values. If an other value exists but the "Other"
// option isn't already selected, it is added so the specify input shows.
function splitOther(
  stored: string[],
  options: string[],
  otherOption: string,
): { selected: string[]; other: string } {
  const selected = stored.filter((value) => options.includes(value));
  const custom = stored.filter((value) => !options.includes(value));
  if (custom.length > 0 && !selected.includes(otherOption)) {
    selected.push(otherOption);
  }
  return { selected, other: custom.join(', ') };
}

function buildFormState(app: PantryWithUser): FormState {
  // If allergenClients is not one of the dropdown options it was entered as an exact number
  const storedAllergenClients = app.allergenClients ?? '';
  const isStandardAllergenOption = allergenClientOptions.includes(
    storedAllergenClients,
  );
  const restrictions = splitOther(
    app.restrictions ?? [],
    dietaryRestrictionOptions,
    restrictionsOtherOption,
  );
  const languages = splitOther(
    app.languages ?? [],
    languageOptions,
    languageOtherOption,
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
    restrictions: restrictions.selected,
    restrictionsOther: restrictions.other,
    languages: languages.selected,
    languagesOther: languages.other,
    allergenClients: isStandardAllergenOption
      ? storedAllergenClients
      : 'I have an exact number',
    allergenClientsExact: isStandardAllergenOption ? '' : storedAllergenClients,
    refrigeratedDonation: app.refrigeratedDonation ?? '',
    reserveFoodForAllergic: app.reserveFoodForAllergic ?? '',
    reservationExplanation: app.reservationExplanation ?? '',
    dedicatedAllergyFriendly: app.dedicatedAllergyFriendly ?? '',
    clientVisitFrequency: app.clientVisitFrequency ?? '',
    serveAllergicChildren: app.serveAllergicChildren ?? '',
    activities: app.activities ?? [],
    activitiesComments: app.activitiesComments ?? '',
    itemsInStock: app.itemsInStock ?? '',
    needMoreOptions: app.needMoreOptions ?? '',
  };
}

function validateRequired(form: FormState): boolean {
  return (
    !!form.shipmentLine1.trim() &&
    !!form.shipmentCity.trim() &&
    !!form.shipmentState.trim() &&
    !!form.shipmentZip.trim() &&
    !!form.mailingLine1.trim() &&
    !!form.mailingCity.trim() &&
    !!form.mailingState.trim() &&
    !!form.mailingZip.trim() &&
    !!form.acceptFoodDeliveries &&
    !!form.deliveryWindowInstructions.trim() &&
    !!form.allergenClients &&
    !(
      form.allergenClients === 'I have an exact number' &&
      !form.allergenClientsExact.trim()
    ) &&
    form.restrictions.length > 0 &&
    !(
      form.restrictions.includes(restrictionsOtherOption) &&
      !form.restrictionsOther.trim()
    ) &&
    !!form.refrigeratedDonation &&
    !!form.dedicatedAllergyFriendly &&
    !!form.reserveFoodForAllergic &&
    !(
      (form.reserveFoodForAllergic === ReserveFoodForAllergic.YES ||
        form.reserveFoodForAllergic === ReserveFoodForAllergic.SOME) &&
      !form.reservationExplanation.trim()
    ) &&
    !!form.clientVisitFrequency &&
    !!form.serveAllergicChildren &&
    form.languages.length > 0 &&
    !(
      form.languages.includes(languageOtherOption) &&
      !form.languagesOther.trim()
    ) &&
    !!form.itemsInStock.trim() &&
    !!form.needMoreOptions.trim()
  );
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
      if (pantryId) {
        const data = await ApiClient.getPantry(pantryId);
        setApplication(data);
        setForm(buildFormState(data));
      }
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
      const restrictions = [...form.restrictions];
      if (
        form.restrictions.includes(restrictionsOtherOption) &&
        form.restrictionsOther.trim()
      ) {
        restrictions.push(form.restrictionsOther.trim());
      }
      const languages = form.languages.filter(
        (language) => language !== languageOtherOption,
      );
      if (
        form.languages.includes(languageOtherOption) &&
        form.languagesOther.trim()
      ) {
        languages.push(form.languagesOther.trim());
      }

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
        restrictions,
        languages,
        refrigeratedDonation:
          (form.refrigeratedDonation as RefrigeratedDonation) || undefined,
        dedicatedAllergyFriendly:
          (form.dedicatedAllergyFriendly as DedicatedAllergyFriendly) ||
          undefined,
        reserveFoodForAllergic:
          (form.reserveFoodForAllergic as ReserveFoodForAllergic) || undefined,
        reservationExplanation:
          form.reserveFoodForAllergic === ReserveFoodForAllergic.YES ||
          form.reserveFoodForAllergic === ReserveFoodForAllergic.SOME
            ? form.reservationExplanation || null
            : null,
        clientVisitFrequency:
          (form.clientVisitFrequency as ClientVisitFrequency) || undefined,
        serveAllergicChildren:
          (form.serveAllergicChildren as ServeAllergicChildren) || undefined,
        activities: form.activities as Activity[],
        activitiesComments: form.activitiesComments || undefined,
        itemsInStock: form.itemsInStock || undefined,
        needMoreOptions: form.needMoreOptions || undefined,
      };
      const updated = await ApiClient.updatePantryApplicationData(
        application.pantryId,
        formData,
      );
      const updatedWithUser: PantryWithUser = {
        ...application,
        ...updated,
        pantryUser: application.pantryUser,
      };
      setApplication(updatedWithUser);
      setForm(buildFormState(updatedWithUser));
      onEditingChange(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          const messages = err.response?.data?.message;
          setError(
            Array.isArray(messages)
              ? messages.join(' ')
              : 'Invalid input. Please check your entries and try again.',
          );
        } else if (status === 403) {
          setError('You do not have permission to edit this profile.');
        } else if (status === 404) {
          setError('This pantry profile could not be found.');
        } else if (status === 500) {
          setError('A server error occurred while saving. Please try again.');
        } else {
          setError('Failed to save changes. Please try again.');
        }
      } else if (err instanceof AuthError) {
        setError(
          'Your session may have expired. Please refresh or log in again.',
        );
      }
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
      <VStack align="stretch" gap={4}>
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

        <Section title="Delivery Preferences">
          <Field
            label="Able to accept food deliveries during standard business hours (Mon–Fri)?"
            value={application.acceptFoodDeliveries ? 'Yes' : 'No'}
          />
          <Field
            label="Delivery window restrictions"
            value={application.deliveryWindowInstructions}
          />
        </Section>

        <Section title="Pantry Details">
          <Field
            label="Clients with food allergies or adverse reactions served"
            value={application.allergenClients}
          />

          <Box mb={10}>
            <Text {...fieldHeaderStyles}>
              Food allergies / dietary restrictions clients report
            </Text>
            {application.restrictions?.length ? (
              <TagGroup values={application.restrictions} />
            ) : (
              <Text {...fieldContentStyles}>-</Text>
            )}
          </Box>

          <Grid templateColumns="repeat(2, 1fr)" columnGap={6}>
            <Field
              label="Able to accept frozen/refrigerated donations?"
              value={application.refrigeratedDonation}
            />
            <Field
              label="Dedicated shelf/section for allergen-friendly items?"
              value={application.dedicatedAllergyFriendly}
            />
            <Field
              label="Willing to reserve food shipments for allergen-avoidant individuals?"
              value={application.reserveFoodForAllergic}
            />
            <GridItem colSpan={2}>
              <Field
                label="How allergen-friendly foods will reach allergic clients"
                value={application.reservationExplanation}
              />
            </GridItem>
            <Field
              label="How often allergen-avoidant clients visit"
              value={application.clientVisitFrequency}
            />
            <Field
              label="Serves allergen-avoidant children?"
              value={application.serveAllergicChildren}
            />
          </Grid>

          <Box mb={10}>
            <Text {...fieldHeaderStyles}>
              Languages allergen-avoidant clients speak
            </Text>
            {application.languages?.length ? (
              <TagGroup values={application.languages} />
            ) : (
              <Text {...fieldContentStyles}>-</Text>
            )}
          </Box>

          <Box mb={10}>
            <Text {...fieldHeaderStyles}>
              Activities open to doing with SSF
            </Text>
            {application.activities?.length ? (
              <TagGroup values={application.activities} />
            ) : (
              <Text {...fieldContentStyles}>-</Text>
            )}
          </Box>

          <Field
            label="Comments about activities"
            value={application.activitiesComments}
          />
          <Field
            label="Allergen-free items currently in stock"
            value={application.itemsInStock}
          />
          <Field
            label="Have clients requested more food options?"
            value={application.needMoreOptions}
          />
        </Section>
      </VStack>
    );
  } else {
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
          requiredSuffixes={['Line1', 'City', 'State', 'Zip']}
        />

        <EditAddressSection
          title="Mailing Address"
          prefix="mailing"
          form={form}
          onChange={setField}
          requiredSuffixes={['Line1', 'City', 'State', 'Zip']}
        />

        <EditRadio
          label="Would your pantry be able to accept food deliveries during standard business hours Mon-Fri?"
          name="acceptFoodDeliveries"
          value={form.acceptFoodDeliveries}
          options={['Yes', 'No']}
          onChange={(v) => setField('acceptFoodDeliveries', v)}
          required
        />

        <EditField
          label="Please note any delivery window restrictions."
          name="deliveryWindowInstructions"
          value={form.deliveryWindowInstructions}
          onChange={(v) => setField('deliveryWindowInstructions', v)}
          textarea
          required
        />

        <Text {...sectionLabelStyles}>Pantry Details</Text>

        <EditSelect
          label="How many clients with food allergies or other adverse reactions to foods does your pantry serve?"
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
          required
        />

        {form.restrictions.includes(restrictionsOtherOption) && (
          <EditField
            label='If you selected "Other," please specify:'
            name="restrictionsOther"
            value={form.restrictionsOther}
            onChange={(v) => setField('restrictionsOther', v)}
            required
          />
        )}

        <EditRadio
          label="Would you be able to accept frozen donations that require refrigeration or freezing?"
          name="refrigeratedDonation"
          value={form.refrigeratedDonation}
          options={Object.values(RefrigeratedDonation)}
          onChange={(v) => setField('refrigeratedDonation', v)}
          required
        />

        <EditRadio
          label="Do you have a dedicated shelf or section of your pantry for allergy-friendly items?"
          name="dedicatedAllergyFriendly"
          value={form.dedicatedAllergyFriendly}
          options={Object.values(DedicatedAllergyFriendly)}
          onChange={(v) => setField('dedicatedAllergyFriendly', v)}
          required
        />

        <EditRadio
          label="Are you willing to reserve our food shipments for allergen-avoidant individuals?"
          name="reserveFoodForAllergic"
          value={form.reserveFoodForAllergic}
          options={Object.values(ReserveFoodForAllergic)}
          helperText="For example, grouping allergen-friendly items on a separate shelf or in separate bins and encouraging non-allergic clients to save these items for clients who do not have other safe food options."
          onChange={(v) => setField('reserveFoodForAllergic', v)}
          required
        />

        {(form.reserveFoodForAllergic === ReserveFoodForAllergic.YES ||
          form.reserveFoodForAllergic === ReserveFoodForAllergic.SOME) && (
          <EditField
            label={
              form.reserveFoodForAllergic === ReserveFoodForAllergic.YES
                ? 'How would you work to ensure that allergen-friendly foods are distributed to clients with food allergies or other adverse reactions to foods?'
                : 'Please explain why you selected "Some."'
            }
            name="reservationExplanation"
            value={form.reservationExplanation}
            onChange={(v) => setField('reservationExplanation', v)}
            textarea
            required
          />
        )}

        <EditSelect
          label="How often do allergen-avoidant clients visit your food pantry?"
          name="clientVisitFrequency"
          value={form.clientVisitFrequency}
          options={Object.values(ClientVisitFrequency)}
          onChange={(v) => setField('clientVisitFrequency', v)}
          required
        />

        <EditSelect
          label="Does your pantry serve allergen-avoidant children?"
          name="serveAllergicChildren"
          value={form.serveAllergicChildren}
          options={Object.values(ServeAllergicChildren)}
          onChange={(v) => setField('serveAllergicChildren', v)}
          required
        />

        <EditMultiSelect
          label="What languages do allergen-avoidant clients at your pantry speak?"
          value={form.languages}
          options={languageOptions}
          onChange={(v) =>
            setForm((prev) => (prev ? { ...prev, languages: v } : prev))
          }
          triggerLabel="Select languages"
          required
        />

        {form.languages.includes(languageOtherOption) && (
          <EditField
            label='If you selected "Other," please specify:'
            name="languagesOther"
            value={form.languagesOther}
            onChange={(v) => setField('languagesOther', v)}
            required
          />
        )}

        <EditMultiSelect
          label="Which of the following activities would you be willing to do with SSF?"
          value={form.activities}
          options={activityEditOptions}
          onChange={(v) =>
            setForm((prev) => (prev ? { ...prev, activities: v } : prev))
          }
          triggerLabel="Select activities"
          helperText="Check all that apply."
        />

        <EditField
          label="Please share any comments about your answer."
          name="activitiesComments"
          value={form.activitiesComments}
          onChange={(v) => setField('activitiesComments', v)}
          textarea
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
          label="Have allergen-avoidant clients at your pantry requested more food options?"
          name="needMoreOptions"
          value={form.needMoreOptions}
          onChange={(v) => setField('needMoreOptions', v)}
          textarea
          required
          helperText="Please share any feedback you have received."
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
  }
};

export default EditablePantryApplication;
