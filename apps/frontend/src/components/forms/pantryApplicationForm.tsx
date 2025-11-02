import {
  Box,
  Button,
  Heading,
  Input,
  RadioGroup,
  Stack,
  Text,
  Field,
  Textarea,
  SimpleGrid,
  Portal,
  NativeSelect,
  NativeSelectIndicator,
  Combobox,
  Wrap,
  createListCollection,
  Tag,
} from '@chakra-ui/react';
import {
  ActionFunction,
  ActionFunctionArgs,
  Form,
  redirect,
} from 'react-router-dom';

import React, { useMemo, useState } from 'react';
import { USPhoneInput } from '@components/forms/usPhoneInput';
import ApiClient from '@api/apiClient';
import { PantryApplicationDto } from '../../types/types';
import axios from 'axios';

const otherRestrictionsOptions: string[] = [
  'Other allergy (e.g., yeast, sunflower, etc.)',
  'Other allergic illness (e.g., eosinophilic esophagitis, FPIES, oral allergy syndrome)',
  'Other dietary restriction',
];

const dietaryRestrictionOptions = [
  'Egg allergy',
  'Fish allergy',
  'Milk allergy',
  'Lactose intolerance/dairy sensitivity',
  'Peanut allergy',
  'Shellfish allergy',
  'Soy allergy',
  'Sesame allergy',
  'Tree nut allergy',
  'Wheat allergy',
  'Celiac disease',
  'Gluten sensitivity (not celiac disease)',
  "Gastrointestinal illness (IBS, Crohn's, gastroparesis, etc.)",
  ...otherRestrictionsOptions,
  'Unsure',
];

const activityOptions = [
  'Create a labeled, allergy-friendly shelf or shelves',
  'Provide clients and staff/volunteers with educational pamphlets',
  "Use a spreadsheet to track clients' medical dietary needs and distribution of SSF items per month",
  'Post allergen-free resource flyers throughout pantry',
  'Survey your clients to determine their medical dietary needs',
  'Collect feedback from allergen-avoidant clients on SSF foods',
  'Something else',
];

const PantryApplicationForm: React.FC = () => {
  const [contactPhone, setContactPhone] = useState<string>('');
  const [activities, setActivities] = useState<string[]>([]);
  const noActivitiesSelected: boolean = activities.length === 0;
  const allergenClientsExactOption: string = 'I have an exact number';

  const [allergenClients, setAllergenClients] = useState<string | undefined>();
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [reserveFoodForAllergic, setReserveFoodForAllergic] = useState<string>();
  const [clientVisitFrequency, setClientVisitFrequency] = useState<
    string | undefined
  >();
  const [identifyAllergensConfidence, setIdentifyAllergensConfidence] = useState<
    string | undefined
  >();
  const [serveAllergicChildren, setServeAllergicChildren] = useState<
    string | undefined
  >();
  const [refrigeratedDonation, setRefrigeratedDonation] = useState<string | undefined>();
  const [searchRestriction, setSearchRestriction] = useState<string>('');
  const [searchActivity, setSearchActivity] = useState<string>('');

  const sectionTitleStyles = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    fontSize: 'md',
  };

  const sectionSubtitleStyles = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: '400',
    color: 'gray',
    mb: '2em',
    fontSize: 'sm',
  }

  const fieldHeaderStyles = {
    color: 'neutral.800',
    fontFamily: "'Inter', sans-serif",
    fontSize: 'sm',
    fontWeight: '600',
  };

  const filteredRestrictions = useMemo(
    () =>
      dietaryRestrictionOptions.filter((option) =>
        option.toLowerCase().includes(searchRestriction.toLowerCase()),
      ),
    [searchRestriction],
  );

  const restrictionsCollection = useMemo(
    () => createListCollection({ items: filteredRestrictions}),
    [filteredRestrictions],
  );

  const filteredActivities = useMemo(
    () =>
      activityOptions.filter((option) =>
        option.toLowerCase().includes(searchActivity.toLowerCase()),
      ),
    [searchActivity],
  );

  const activitiesCollection = useMemo(
    () => createListCollection({ items: filteredActivities}),
    [filteredActivities],
  );

  return (
    <Box width="100%" mx="11em" my="4em">
      <Box as="section" mb="2em">
        <Heading size="3xl" fontWeight="normal" mb=".5em">
          Welcome to the Securing Safe Food Partner Pantry Application.
        </Heading>
        <Text color="gray">
          Thank you for your interest in partnering with Securing Safe Food (SSF) to help serve clients 
          with food allergies and other adverse reactions to foods. This application helps us understand 
          your pantry’s capacity and interest in distributing allergen-friendly food. We’ll ask about 
          your pantry’s current practices, storage capabilities, and communication preferences. Please 
          answer as accurately as possible. If you have any questions or need help, don’t hesitate to 
          contact the SSF team.
        </Text>
      </Box>
      <Box 
        as="section" bg="#FEFEFE" p={6} 
        border="1px solid" borderColor="neutral.200" rounded="sm"
      >
        <Form method="post" action="/pantry-application">
          <Heading 
            as="h3" fontSize="xl" color="neutral.800"
            fontFamily="'Inter', sans-serif" fontWeight={600}>
            Pantry Application
          </Heading>
          <Text color="gray" mb="2em" fontSize="lg">
            Please fill out the folllowing information to get started.
          </Text>
          <Text {...sectionTitleStyles}>
            Point of Contact Information
          </Text>
          <Text {...sectionSubtitleStyles}>
            Please provide information about whom we should contact at your pantry.
          </Text>
          <SimpleGrid columns={2} columnGap={8} rowGap={4} mb="2em">
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                First Name
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <Input name="contactFirstName" type="text" borderColor="neutral.100" />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Last Name
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <Input name="contactLastName" type="text" borderColor="neutral.100" />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Phone Number
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <USPhoneInput
                value={contactPhone}
                onChange={setContactPhone}
                inputProps={{ name: 'contactPhone', borderColor: 'neutral.100' }}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Email Address
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <Input name="contactEmail" type="email" borderColor="neutral.100" />
            </Field.Root>
          </SimpleGrid>

          <Text {...sectionTitleStyles}>
            Address
          </Text>
          <Text {...sectionSubtitleStyles}>
            Please list your address for <b>food</b> shipments.
          </Text>
          <SimpleGrid columns={2} columnGap={8} rowGap={4} mb="2em">
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Address Line 1
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <Input name="addressLine1" type="text" borderColor="neutral.100" />
            </Field.Root>
            <Field.Root>
              <Field.Label {...fieldHeaderStyles}>
                Address Line 2
              </Field.Label>
              <Input name="addressLine2" type="text" borderColor="neutral.100" />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                City/Town
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <Input name="addressCity" type="text" borderColor="neutral.100" />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                State/Region/Province
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <Input name="addressState" type="text" borderColor="neutral.100" />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Zip/Post Code
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <Input name="addressZip" type="text" borderColor="neutral.100" />
            </Field.Root>
            <Field.Root>
              <Field.Label {...fieldHeaderStyles}>
                Country
              </Field.Label>
              <Input name="addressCountry" type="text" borderColor="neutral.100" />
            </Field.Root>
          </SimpleGrid>

          <Text {...sectionTitleStyles} mb="2em">
            Pantry Details
          </Text>
          <Field.Root required mb="2em">
            <Field.Label asChild>
              <Text {...fieldHeaderStyles}>
                Pantry Name
                <Field.RequiredIndicator color="red"/>
              </Text>
            </Field.Label>
            <Input name="pantryName" type="text" borderColor="neutral.100" />
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Approximately how many allergen-avoidant clients does your pantry
              serve?
              <Field.RequiredIndicator color="red"/>
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={allergenClients}
                onChange={(e) => setAllergenClients(e.target.value)}
                placeholder="Select an option"
                borderColor="neutral.100"
                name="allergenClients"
              >
                {[
                  '< 10',
                  '10 to 20',
                  '20 to 50',
                  '50 to 100',
                  '> 100',
                  "I'm not sure",
                  allergenClientsExactOption,
                ].map((value) => (
                  <option value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelectIndicator />
            </NativeSelect.Root>
          </Field.Root>
          {allergenClients === allergenClientsExactOption && (
            <Field.Root required mb="2em">
              <Field.Label>
                Please provide the exact number, if known
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                maxW="10em"
                name="allergenClientsExact"
                type="number"
                borderColor="neutral.100"
                min="0"
              />
            </Field.Root>
          )}
          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Which food allergies or other medical dietary restrictions do
              clients at your pantry report?
            </Field.Label>
            <Combobox.Root
              multiple
              closeOnSelect={false}
              value={restrictions}
              collection={restrictionsCollection}
              onValueChange={(e: {value: string[]}) => setRestrictions(e.value)}
              onInputValueChange={(e: {inputValue: string}) => setSearchRestriction(e.inputValue)}
            >
              <Combobox.Control>
                <Combobox.Input placeholder="Type to search" borderColor="neutral.100" />
                <Combobox.IndicatorGroup>
                  <Combobox.Trigger />
                </Combobox.IndicatorGroup>
              </Combobox.Control>

              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content>
                    <Combobox.ItemGroup>
                      {filteredRestrictions.map((value) => (
                        <Combobox.Item 
                          key={value} 
                          item={value}
                          name="restrictions"
                          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.backgroundColor = '')}
                        >
                          {value}
                          <Combobox.ItemIndicator />
                        </Combobox.Item>
                      ))}
                      <Combobox.Empty>No dietary restrictions found</Combobox.Empty>
                    </Combobox.ItemGroup>
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>

              <Wrap gap="2">
                {restrictions.map((value) => (
                  <>
                    <input key={value} type="hidden" name="restrictions" value={value} />
                    <Tag.Root 
                      key={value}
                      bg="teal.100"
                      p={2}
                      border="1px solid"
                      borderColor="teal.400"
                    >
                      <Tag.Label>{value}</Tag.Label>
                      <Tag.EndElement ml={4}>
                        <Tag.CloseTrigger 
                          onClick={() =>
                            setRestrictions((prev) =>
                              prev.filter((item) => item !== value)
                            )
                          }
                          style={{ cursor: 'pointer' }}
                        />
                      </Tag.EndElement>
                    </Tag.Root>
                  </>
                ))}
              </Wrap>
            </Combobox.Root>
          </Field.Root>

          {restrictions.find((option) =>
            otherRestrictionsOptions.includes(option),
          ) && (
            <Field.Root mb="2em">
              <Field.Label {...fieldHeaderStyles}>
                If you selected "Other," please specify:
              </Field.Label>
              <Input maxW="20em" name="restrictionsOther" type="text" />
            </Field.Root>
          )}
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Would you be able to accept refrigerated/frozen donations from us?
              <Field.RequiredIndicator color="red"/>
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={refrigeratedDonation}
                onChange={(e) => setRefrigeratedDonation(e.target.value)}
                placeholder="Select an option"
                borderColor="neutral.100" 
                name="refrigeratedDonation"
              >
                {['Yes', 'Small quantities only', 'No'].map((value) => (
                  <option value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelectIndicator />
            </NativeSelect.Root>
          </Field.Root>

          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Would your pantry be able to accept food deliveries during standard business hours?{' '}
              <Field.RequiredIndicator color="red"/>
            </Field.Label>
            <RadioGroup.Root 
              name="acceptFoodDeliveries"
              variant="solid"
            >
              <Stack>
                {['Yes', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }} >
                      <RadioGroup.ItemIndicator 
                        border="1px solid" 
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>

          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Please note any delivery window instructions.
            </Field.Label>
            <Textarea name="deliveryWindowInstructions" borderColor="neutral.100" />
          </Field.Root>

          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Are you willing to reserve our food shipments for allergen-avoidant
                individuals?{' '}
              <Field.RequiredIndicator color="red"/>
            </Field.Label>
            <RadioGroup.Root 
              name="reserveFoodForAllergic"
              variant="solid"
              onValueChange={(e: {value: string}) => setReserveFoodForAllergic(e.value)}
            >
              <Stack>
                {['Yes', 'Some', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }} >
                      <RadioGroup.ItemIndicator 
                        border="1px solid" 
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>

          {reserveFoodForAllergic && ['Some', 'Yes'].includes(reserveFoodForAllergic) && (
            <Field.Root required mb="2em">
              <Field.Label {...fieldHeaderStyles}>
                Please explain how you would do this.
                <Field.RequiredIndicator color="red"/>
              </Field.Label>
              <Textarea name="reservationExplanation" borderColor="neutral.100" autoresize />
              <Field.HelperText color="neutral.600">
                For example: keeping allergen-friendly items on a separate shelf, encouraging non-allergic 
                clients to save these items for clients who do not have other safe food options.
              </Field.HelperText>
            </Field.Root>
          )}

          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Do you have a dedicated shelf or section of your pantry for
              allergy-friendly items?
              <Field.RequiredIndicator color="red"/>
            </Field.Label>
            <RadioGroup.Root 
              name="dedicatedAllergyFriendly"
              variant="solid"
            >
              <Stack>
                {['Yes', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }} >
                      <RadioGroup.ItemIndicator 
                        border="1px solid" 
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>

          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              How often do allergen-avoidant clients visit your food pantry?
            </Field.Label>
            <NativeSelect.Root >
              <NativeSelect.Field
                value={clientVisitFrequency}
                onChange={(e) => setClientVisitFrequency(e.target.value)}
                placeholder="Select an option"
                name="clientVisitFrequency"
                borderColor="neutral.100"
              >
                {[
                  'Daily',
                  'More than once a week',
                  'Once a week',
                  'A few times a month',
                  'Once a month',
                ].map((value) => (
                  <option value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelectIndicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Are you confident in identifying the top 9 allergens in an
              ingredient list?
            </Field.Label>
            <NativeSelect.Root >
              <NativeSelect.Field
                value={identifyAllergensConfidence}
                onChange={(e) => setIdentifyAllergensConfidence(e.target.value)}
                placeholder="Select an option"
                name="identifyAllergensConfidence"
                borderColor="neutral.100"
              >
                {[
                  'Very confident',
                  'Somewhat confident',
                  'Not very confident (we need more education!)',
                ].map((value) => (
                  <option value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelectIndicator />
            </NativeSelect.Root>
            <Field.HelperText color="neutral.600">
              The top 9 allergens are milk, egg, peanut, tree nuts, wheat, soy,
              fish, shellfish, and sesame.
            </Field.HelperText>
          </Field.Root>
          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Do you serve allergen-avoidant or food-allergic children at your
              pantry?
            </Field.Label>
            <NativeSelect.Root >
              <NativeSelect.Field
                value={serveAllergicChildren}
                onChange={(e) => setServeAllergicChildren(e.target.value)}
                placeholder="Select an option"
                name="serveAllergicChildren"
                borderColor="neutral.100"
              >
                {['Yes, many (> 10)', 'Yes, a few (< 10)', 'No'].map((value) => (
                  <option value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelectIndicator />
            </NativeSelect.Root>
            <Field.HelperText color="neutral.600">
              "Children" is defined as any individual under the age of 18 either
              living independently or as part of a household.
            </Field.HelperText>
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              What activities are you open to doing with SSF?{" "}
              <Field.RequiredIndicator color="red"/>
            </Field.Label>
            <Combobox.Root
              multiple
              closeOnSelect={false}
              value={activities}
              collection={activitiesCollection}
              onValueChange={(e: {value: string[]}) => setActivities(e.value)}
              onInputValueChange={(e: {inputValue: string}) => setSearchActivity(e.inputValue)}
              required={noActivitiesSelected}
            >
              <Combobox.Control name="activities">
                <Combobox.Input placeholder="Type to search" borderColor="neutral.100"/>
                <Combobox.IndicatorGroup>
                  <Combobox.Trigger />
                </Combobox.IndicatorGroup>
              </Combobox.Control>

              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content>
                    <Combobox.ItemGroup>
                      {filteredActivities.map((value) => (
                        <Combobox.Item 
                          key={value} 
                          item={value}
                          onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                          onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.backgroundColor = '')}
                        >
                          {value}
                          <Combobox.ItemIndicator />
                        </Combobox.Item>
                      ))}
                      <Combobox.Empty>No activities found</Combobox.Empty>
                    </Combobox.ItemGroup>
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>

              <Wrap gap="2">
                {activities.map((value) => (
                  <>
                    <input key={value} type="hidden" name="activities" value={value} />
                    <Tag.Root 
                      key={value}
                      bg="teal.100"
                      p={2}
                      border="1px solid"
                      borderColor="teal.400"
                    >
                      <Tag.Label>{value}</Tag.Label>
                      <Tag.EndElement ml={4}>
                        <Tag.CloseTrigger 
                          onClick={() =>
                            setActivities((prev) =>
                              prev.filter((item) => item !== value)
                            )
                          }
                          style={{ cursor: 'pointer' }}
                        />
                      </Tag.EndElement>
                    </Tag.Root>
                  </>
                ))}
              </Wrap>
            </Combobox.Root>
            <Field.HelperText color="neutral.600">
              Food donations are one part of being a partner pantry. The
              following are additional ways to help us better support you!
              Please select all that apply.
            </Field.HelperText>
          </Field.Root>

          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Please list any comments/concerns related to the previous question.
            </Field.Label>
            <Textarea name="activitiesComments" borderColor="neutral.100" autoresize/>
            <Field.HelperText color="neutral.600">
              If you answered "Something Else", please elaborate.
            </Field.HelperText>
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              What types of allergen-free items, if any, do you currently have in
              stock?
              <Field.RequiredIndicator color="red"/>
            </Field.Label>
            <Textarea name="itemsInStock" borderColor="neutral.100" autoresize />
            <Field.HelperText color="neutral.600">
              For example, gluten-free breads, sunflower seed butters, nondairy beverages, etc.
            </Field.HelperText>
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Do allergen-avoidant clients at your pantry ever request a greater
              variety of items or not have enough options? Please explain.
              <Field.RequiredIndicator color="red"/>
            </Field.Label>
            <Textarea name="needMoreOptions" borderColor="neutral.100" autoresize />
          </Field.Root>

          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Would you like to subscribe to our quarterly newsletter?
            </Field.Label>
            <RadioGroup.Root 
              name="newsletterSubscription"
              variant="solid"
            >
              <Stack>
                {['Yes', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }} >
                      <RadioGroup.ItemIndicator 
                        border="1px solid" 
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              border="1px solid" 
              color="neutral.800" 
              borderColor="neutral.200"
              fontWeight={600}
            >
              Cancel
            </Button>
            <Button 
              type="submit" bg="blue.ssf" 
              fontWeight={600} px={8}
            >
              Submit Application
            </Button>
          </Box>
        </Form>
      </Box>
    </Box>
  );
};

export const submitPantryApplicationForm: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();

  const pantryApplicationData = new Map();

  const restrictions = form.getAll('restrictions');
  const restrictionsOther = form.get('restrictionsOther');

  if (restrictionsOther !== null && restrictionsOther !== '') {
    restrictions.push(restrictionsOther);
  }

  pantryApplicationData.set('restrictions', restrictions);
  form.delete('restrictions');

  pantryApplicationData.set('activities', form.getAll('activities'));
  form.delete('activities');

  // Handle all other questions
  form.forEach((value, key) => {
    if (value === '') {
      pantryApplicationData.set(key, null);
    } else {
      pantryApplicationData.set(key, value)
    }
  });

  pantryApplicationData.set('newsletterSubscription', form.get("newsletterSubscription") === "Yes");
  pantryApplicationData.set('acceptFoodDeliveries', form.get("acceptFoodDeliveries") === "Yes");
  pantryApplicationData.set('dedicatedAllergyFriendly', form.get("dedicatedAllergyFriendly") === "Yes");

  console.log('Pantry Application Data:', Object.fromEntries(pantryApplicationData));

  // Replace the answer for allergenClients with the answer
  // for allergenClientsExact if it is given

  const allergenClientsExact = pantryApplicationData.get(
    'allergenClientsExact',
  );

  if ((allergenClientsExact ?? '') !== '') {
    pantryApplicationData.set('allergenClients', allergenClientsExact);
  }

  const data = Object.fromEntries(pantryApplicationData);

  let submissionSuccessful: boolean = false;

  await ApiClient.postPantry(data as PantryApplicationDto).then(
    () => (submissionSuccessful = true),
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        alert(
          'Form submission failed with the following errors: \n\n' +
            // Creates a bullet-point list of the errors
            // returned from the backend
            error.response?.data?.message
              .map((line: string) => '- ' + line)
              .join('\n'),
        );
      } else {
        alert('Form submission failed; please try again');
        console.log(error)
      }
    },
  );

  return submissionSuccessful ? redirect('/pantry-application/submitted') : null;
};

export default PantryApplicationForm;
