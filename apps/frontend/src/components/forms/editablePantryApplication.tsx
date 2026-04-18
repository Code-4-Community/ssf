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
  AllergensConfidence,
  ServeAllergicChildren,
} from '../../types/pantryEnums';
import { formatPhone } from '@utils/utils';
import { TagGroup } from '@components/forms/tagGroup';
import { USPhoneInput } from '@components/forms/usPhoneInput';
import { dietaryRestrictionOptions } from '@components/forms/pantryApplicationForm';
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

const allergenClientOptions = [
  '< 10',
  '10 to 20',
  '20 to 50',
  '50 to 100',
  '> 100',
  "I'm not sure",
  'I have an exact number',
];

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
    activities: app.activities ?? [],
    activitiesComments: app.activitiesComments ?? '',
    itemsInStock: app.itemsInStock ?? '',
    needMoreOptions: app.needMoreOptions ?? '',
    newsletterSubscription:
      app.newsletterSubscription != null
        ? app.newsletterSubscription
          ? 'Yes'
          : 'No'
        : '',
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
    form.activities.includes(Activity.SOMETHING_ELSE) &&
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
        refrigeratedDonation:
          (form.refrigeratedDonation as RefrigeratedDonation) || undefined,
        dedicatedAllergyFriendly: form.dedicatedAllergyFriendly === 'Yes',
        reserveFoodForAllergic:
          (form.reserveFoodForAllergic as ReserveFoodForAllergic) || undefined,
        reservationExplanation:
          form.reserveFoodForAllergic === ReserveFoodForAllergic.YES ||
          form.reserveFoodForAllergic === ReserveFoodForAllergic.SOME
            ? form.reservationExplanation || null
            : null,
        clientVisitFrequency:
          (form.clientVisitFrequency as ClientVisitFrequency) || undefined,
        identifyAllergensConfidence:
          (form.identifyAllergensConfidence as AllergensConfidence) ||
          undefined,
        serveAllergicChildren:
          (form.serveAllergicChildren as ServeAllergicChildren) || undefined,
        activities: form.activities as Activity[],
        activitiesComments: form.activitiesComments || undefined,
        itemsInStock: form.itemsInStock || undefined,
        needMoreOptions: form.needMoreOptions || undefined,
        newsletterSubscription: form.newsletterSubscription === 'Yes',
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
        if (status === 403) {
          setError('You do not have permission to edit this profile.');
        } else if (status === 404) {
          setError('This pantry profile could not be found.');
        } else if (status === 500) {
          setError('A server error occurred while saving. Please try again.');
        } else {
          setError('Failed to save changes. Please try again.');
        }
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
              <TagGroup values={application.activities} />
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
          options={Object.values(RefrigeratedDonation)}
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
          />
        )}

        <EditSelect
          label="How often do allergen-avoidant clients visit your food pantry?"
          name="clientVisitFrequency"
          value={form.clientVisitFrequency}
          options={Object.values(ClientVisitFrequency)}
          onChange={(v) => setField('clientVisitFrequency', v)}
        />

        <EditSelect
          label="Are you confident in identifying the top 9 allergens in an ingredient list?"
          name="identifyAllergensConfidence"
          value={form.identifyAllergensConfidence}
          options={Object.values(AllergensConfidence)}
          helperText="The top 9 allergens are milk, egg, peanut, tree nuts, wheat, soy, fish, shellfish, and sesame."
          onChange={(v) => setField('identifyAllergensConfidence', v)}
        />

        <EditSelect
          label="Do you serve allergen-avoidant or food-allergic children at your pantry?"
          name="serveAllergicChildren"
          value={form.serveAllergicChildren}
          options={Object.values(ServeAllergicChildren)}
          helperText='"Children" is defined as any individual under the age of 18 either living independently or as part of a household.'
          onChange={(v) => setField('serveAllergicChildren', v)}
        />

        <EditMultiSelect
          label="What activities are you open to doing with SSF?"
          value={form.activities}
          options={Object.values(Activity)}
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
          required={form.activities.includes(Activity.SOMETHING_ELSE)}
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
  }
};

export default EditablePantryApplication;
