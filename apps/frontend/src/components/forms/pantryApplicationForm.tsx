import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  Input,
  RadioGroup,
  Stack,
  Text,
  Field,
  Textarea,
  Fieldset,
} from '@chakra-ui/react';
import {
  ActionFunction,
  ActionFunctionArgs,
  Form,
  redirect,
} from 'react-router-dom';

import React, { useState } from 'react';
import { USPhoneInput } from '@components/forms/usPhoneInput';
import ApiClient from '@api/apiClient';
import { PantryApplicationDto } from 'types/pantryTypes';
import axios from 'axios';

const PantryApplicationForm: React.FC = () => {
  const [contactPhone, setContactPhone] = useState<string>('');

  // We need to keep track of the activities selected so we can provide custom
  // validation (at least one activity chosen).
  const [activities, setActivities] = useState<string[]>([]);

  const noActivitiesSelected: boolean = activities.length === 0;

  // Option values and state below are for options that, when selected

  const allergenClientsExactOption: string = 'I have an exact number';
  const otherRestrictionsOptions: string[] = [
    'Other allergy (e.g., yeast, sunflower, etc.)',
    'Other allergic illness (e.g., eosinophilic esophagitis, FPIES, oral allergy syndrome)',
    'Other dietary restriction',
  ];
  const reserveFoodForAllergicYesOption: string = 'Yes';
  const reserveFoodForAllergicSomeOption: string = 'Some';

  const [allergenClients, setAllergenClients] = useState<string | undefined>();
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [reserveFoodForAllergic, setReserveFoodForAllergic] = useState<
    string | undefined
  >();

  return (
    <Box minW="35em" maxW="50em" m="5em">
      <Form method="post" action="/pantry-application">
        <Heading size="2xl" mb=".5em">
          SSF Pantry Sign-Up Form
        </Heading>
        <Box as="section" mb="1em">
          <Text>
            Welcome! We are excited to have you join us in our mission to secure
            allergen-safe food and promote food equity.
          </Text>
          <Text>Please fill out the following information to get started.</Text>
        </Box>
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            First Name
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Field.HelperText mb="1em">
            Whom should we contact at your pantry?
          </Field.HelperText>
          <Input maxW="20em" name="contactFirstName" type="text" />
        </Field.Root>
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Last Name
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Field.HelperText mb="1em">
            Whom should we contact at your pantry?
          </Field.HelperText>
          <Input maxW="20em" name="contactLastName" type="text" />
        </Field.Root>
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Email Address
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Field.HelperText mb="1em">
            Please provide the email address of the pantry contact listed above.
          </Field.HelperText>
          <Input maxW="20em" name="contactEmail" type="email" />
        </Field.Root>
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Phone Number
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Field.HelperText mb="1em">
            Please provide the phone number of the pantry contact listed above.
          </Field.HelperText>
          <USPhoneInput
            value={contactPhone}
            onChange={setContactPhone}
            inputProps={{ maxW: '20em', name: 'contactPhone' }}
          />
        </Field.Root>
        <Field.Root required mb="2em">
          <Field.Label asChild>
            <Text fontSize={25} fontWeight={700}>
              Food Pantry Name
              <Field.RequiredIndicator color="red" />
            </Text>
          </Field.Label>
          <Input maxW="20em" name="pantryName" type="text" />
        </Field.Root>
        <section>
          <Heading as="h3" size="lg" mb="0.5em">
            Address <span style={{ color: 'red' }}>*</span>
          </Heading>
          <Text mb="1em">
            Please list your address for <b>food</b> shipments.
          </Text>
          <Field.Root required mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Address Line 1
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Input maxW="20em" name="addressLine1" type="text" />
          </Field.Root>
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Address Line 2
            </Field.Label>
            <Input maxW="20em" name="addressLine2" type="text" />
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              City/Town
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Input maxW="20em" name="addressCity" type="text" />
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              State/Region/Province
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Input maxW="20em" name="addressRegion" type="text" />
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Zip/Post Code
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Input maxW="20em" name="addressZip" type="text" />
          </Field.Root>
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Country
            </Field.Label>
            <Input maxW="20em" name="addressCountry" type="text" />
          </Field.Root>
        </section>
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Approximately how many allergen-avoidant clients does your pantry
            serve?
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Field.HelperText mb="1em">
            Please note that our target population is NOT individuals with
            diabetic, low sugar/sodium, halal, vegan/vegetarian, or kosher
            needs.
          </Field.HelperText>
          <RadioGroup.Root
            name="allergenClients"
            value={allergenClients}
            onValueChange={setAllergenClients}
          >
            <Stack>
              {[
                '< 10',
                '10 to 20',
                '20 to 50',
                '50 to 100',
                '> 100',
                "I'm not sure",
                allergenClientsExactOption,
              ].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Field.Root>
        {allergenClients === allergenClientsExactOption && (
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Please provide the exact number, if known:
            </Field.Label>
            <Input maxW="20em" name="allergenClientsExact" type="number" />
          </Field.Root>
        )}
        <Fieldset.Root mb="2em">
          <Fieldset.Legend fontSize={25} fontWeight={700}>
            Which food allergies or other medical dietary restrictions do
            clients at your pantry report?
          </Fieldset.Legend>
          <Fieldset.HelperText mb="1em">
            Please select all that apply.
          </Fieldset.HelperText>
          <CheckboxGroup value={restrictions} onValueChange={setRestrictions}>
            <Stack>
              {[
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
              ].map((value) => (
                <Checkbox.Root key={value} value={value} name="restrictions">
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{value}</Checkbox.Label>
                </Checkbox.Root>
              ))}
            </Stack>
          </CheckboxGroup>
        </Fieldset.Root>
        {restrictions.find((option) =>
          otherRestrictionsOptions.includes(option),
        ) && (
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              If you selected "Other," please specify:
            </Field.Label>
            <Input maxW="20em" name="restrictionsOther" type="text" />
          </Field.Root>
        )}
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Would you be able to accept refrigerated/frozen donations from us?
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <RadioGroup.Root name="refrigeratedDonation">
            <Stack>
              {['Yes', 'Small quantities only', 'No'].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Field.Root>
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Are you willing to reserve our food shipments for allergen-avoidant
            individuals?
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Field.HelperText mb="1em">
            For example: keeping allergen-friendly items on a separate shelf,
            encouraging non-allergic clients to save these items for clients who
            do not have other safe food options.
          </Field.HelperText>
          <RadioGroup.Root
            name="reserveFoodForAllergic"
            value={reserveFoodForAllergic}
            onValueChange={setReserveFoodForAllergic}
          >
            <Stack>
              {[
                reserveFoodForAllergicYesOption,
                reserveFoodForAllergicSomeOption,
                'No',
              ].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Field.Root>
        {reserveFoodForAllergic === reserveFoodForAllergicYesOption && (
          <Field.Root required mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Please explain how you would do this:
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Textarea maxW="20em" name="reservationExplanation" />
          </Field.Root>
        )}
        {reserveFoodForAllergic === reserveFoodForAllergicSomeOption && (
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              If you chose "some," please explain:
            </Field.Label>
            <Textarea maxW="20em" name="reservationExplanation" />
          </Field.Root>
        )}
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Do you have a dedicated shelf or section of your pantry for
            allergy-friendly items?
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Field.HelperText mb="1em">
            If not, we would love to have a conversation and offer resources to
            help you build one!
          </Field.HelperText>
          <RadioGroup.Root name="dedicatedAllergyFriendly">
            <Stack>
              {[
                'Yes, we have a dedicated shelf or box',
                'Yes, we keep allergy-friendly items in a back room',
                'No, we keep allergy-friendly items throughout the pantry, depending on the type of item',
              ].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Field.Root>
        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            How often do allergen-avoidant clients visit your food pantry?
          </Field.Label>
          <RadioGroup.Root name="clientVisitFrequency">
            <Stack>
              {[
                'Daily',
                'More than once a week',
                'Once a week',
                'A few times a month',
                'Once a month',
              ].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Field.Root>
        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Are you confident in identifying the top 9 allergens in an
            ingredient list?
          </Field.Label>
          <Field.HelperText mb="1em">
            The top 9 allergens are milk, egg, peanut, tree nuts, wheat, soy,
            fish, shellfish, and sesame.
          </Field.HelperText>
          <RadioGroup.Root name="identifyAllergensConfidence">
            <Stack>
              {[
                'Very confident',
                'Somewhat confident',
                'Not very confident (we need more education!)',
              ].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Field.Root>
        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Do you serve allergen-avoidant or food-allergic children at your
            pantry?
          </Field.Label>
          <Field.HelperText mb="1em">
            "Children" is defined as any individual under the age of 18 either
            living independently or as part of a household.
          </Field.HelperText>
          <RadioGroup.Root name="serveAllergicChildren">
            <Stack>
              {['Yes, many (> 10)', 'Yes, a few (< 10)', 'No'].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Field.Root>
        <Fieldset.Root required mb="2em">
          <Fieldset.Legend fontSize={25} fontWeight={700}>
            What activities are you open to doing with SSF?{' '}
            <Text as="span" color="red">
              *
            </Text>
          </Fieldset.Legend>
          <Fieldset.HelperText mb="1em">
            <p>
              Food donations are one part of being a partner pantry. The
              following are additional ways to help us better support you!
              (Please select all that apply.)
            </p>
            <p>Please select at least one option!</p>
          </Fieldset.HelperText>
          {/* TODO: Fix input validation message */}
          <CheckboxGroup
            value={activities}
            onValueChange={(activities) =>
              setActivities(activities as string[])
            }
          >
            <Stack>
              {[
                'Create a labeled, allergy-friendly shelf or shelves',
                'Provide clients and staff/volunteers with educational pamphlets',
                "Use a spreadsheet to track clients' medical dietary needs and distribution of SSF items per month",
                'Post allergen-free resource flyers throughout pantry',
                'Survey your clients to determine their medical dietary needs',
                'Collect feedback from allergen-avoidant clients on SSF foods',
                'Something else',
              ].map((value) => (
                <Checkbox.Root
                  name="activities"
                  key={value}
                  value={value}
                  required={noActivitiesSelected}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{value}</Checkbox.Label>
                </Checkbox.Root>
              ))}
            </Stack>
          </CheckboxGroup>
        </Fieldset.Root>
        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Please list any comments/concerns related to the previous question.
          </Field.Label>
          <Field.HelperText mb="1em">
            If you answered "something else," please elaborate!
          </Field.HelperText>
          <Textarea maxW="20em" name="activitiesComments" />
        </Field.Root>
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            What types of allergen-free items, if any, do you currently have in
            stock? (i.e., gluten-free breads, sunflower seed butters, non-dairy
            beverages, etc.)
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Textarea maxW="20em" name="itemsInStock" />
        </Field.Root>
        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Do allergen-avoidant clients at your pantry ever request a greater
            variety of items or not have enough options?
            <Field.RequiredIndicator color="red" />
          </Field.Label>
          <Textarea maxW="20em" name="needMoreOptions" />
        </Field.Root>
        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Would you like to subscribe to our quarterly newsletter?
          </Field.Label>
          <RadioGroup.Root name="newsletterSubscription">
            <Stack>
              {['Yes', 'No'].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{value}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Field.Root>
        <Button type="submit">Submit</Button>
      </Form>
    </Box>
  );
};

export const submitPantryApplicationForm: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();

  const pantryApplicationData = new Map();

  // Backend enum mappings (reverse from frontend labels)
  const AllergyFriendlyStorageMap: Record<string, string> = {
    'Yes, we have a dedicated shelf or box': 'Yes, dedicated shelf',
    'Yes, we keep allergy-friendly items in a back room': 'Yes, back room',
    'No, we keep allergy-friendly items throughout the pantry, depending on the type of item': 'No, throughout pantry',
  };

  // Handle questions with checkboxes (we create an array of all
  // selected options)

  const restrictions = form.getAll('restrictions');
  const restrictionsOther = form.get('restrictionsOther');

  if (restrictionsOther !== null && restrictionsOther !== '') {
    restrictions.push(restrictionsOther);
  }

  pantryApplicationData.set('restrictions', restrictions);
  form.delete('restrictions');

  pantryApplicationData.set('activities', form.getAll('activities'));
  form.delete('activities');

  const dedicatedShelfRaw = form.get('dedicatedAllergyFriendly') as string;
  const convertedShelf = AllergyFriendlyStorageMap[dedicatedShelfRaw];
  pantryApplicationData.set('dedicatedAllergyFriendly', convertedShelf);
  form.delete('dedicatedAllergyFriendly');

  // Handle all other questions
  form.forEach((value, key) => pantryApplicationData.set(key, value));

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
      }
    },
  );

  return submissionSuccessful ? redirect('/') : null;
};

export default PantryApplicationForm;
