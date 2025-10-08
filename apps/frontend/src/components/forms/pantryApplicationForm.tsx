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
} from '@chakra-ui/react';
import {
  ActionFunction,
  ActionFunctionArgs,
  Form,
  redirect,
} from 'react-router-dom';

import React, { useState } from 'react';
import { USPhoneInput } from '@components/forms/usPhoneInput';

const PantryApplicationForm: React.FC = () => {
  const [phone, setPhone] = useState<string>('');

  // We need to keep track of the activities selected so we can provide custom
  // validation (at least one activity chosen).
  const [activities, setActivities] = useState<string[]>([]);

  const noActivitiesSelected: boolean = activities.length === 0;

  // Option values and state below are for options that, when selected

  const allergenAvoidantClientsExactOption: string = 'I have an exact number';
  const otherDietaryRestrictionsOptions: string[] = [
    'Other allergy (e.g., yeast, sunflower, etc.)',
    'Other allergic illness (e.g., eosinophilic esophagitis, FPIES, oral allergy syndrome)',
    'Other dietary restriction',
  ];
  const willingToReserveYesOption: string = 'Yes';
  const willingToReserveSomeOption: string = 'Some';

  const [allergenAvoidantClients, setAllergenAvoidantClients] = useState<
    string | undefined
  >();
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [willingToReserve, setWillingToReserve] = useState<
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
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            First and Last Name
          </Field.Label>
          <Field.HelperText mb="1em">
            Whom should we contact at your pantry?
          </Field.HelperText>
          <Input maxW="20em" name="contactName" type="text" />
        </Field.Root>
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Email Address
          </Field.Label>
          <Field.HelperText mb="1em">
            Please provide the email address of the pantry contact listed above.
          </Field.HelperText>
          <Input maxW="20em" name="contactEmail" type="email" />
        </Field.Root>
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Phone Number
          </Field.Label>
          <Field.HelperText mb="1em">
            Please provide the phone number of the pantry contact listed above.
          </Field.HelperText>
          <USPhoneInput
            value={phone}
            onChange={setPhone}
            inputProps={{ maxW: '20em', name: 'contactPhone' }}
          />
        </Field.Root>
        <Field.Root isRequired mb="2em">
          <Field.Label asChild>
            <Text fontSize={25} fontWeight={700}>
              Food Pantry Name
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
          <Field.Root isRequired mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Address Line 1
            </Field.Label>
            <Input maxW="20em" name="addressLine1" type="text" />
          </Field.Root>
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Address Line 2
            </Field.Label>
            <Input maxW="20em" name="addressLine2" type="text" />
          </Field.Root>
          <Field.Root isRequired mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              City/Town
            </Field.Label>
            <Input maxW="20em" name="addressCity" type="text" />
          </Field.Root>
          <Field.Root isRequired mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              State/Region/Province
            </Field.Label>
            <Input maxW="20em" name="addressRegion" type="text" />
          </Field.Root>
          <Field.Root isRequired mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Zip/Post Code
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
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Approximately how many allergen-avoidant clients does your pantry
            serve?
          </Field.Label>
          <Field.HelperText mb="1em">
            Please note that our target population is NOT individuals with
            diabetic, low sugar/sodium, halal, vegan/vegetarian, or kosher
            needs.
          </Field.HelperText>
          <RadioGroup.Root
            name="allergenAvoidantClients"
            value={allergenAvoidantClients}
            onChange={setAllergenAvoidantClients}
          >
            <Stack>
              {[
                '< 10',
                '10 to 20',
                '20 to 50',
                '50 to 100',
                '> 100',
                "I'm not sure",
                allergenAvoidantClientsExactOption,
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
        {allergenAvoidantClients === allergenAvoidantClientsExactOption && (
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Please provide the exact number, if known:
            </Field.Label>
            <Input
              maxW="20em"
              name="allergenAvoidantClientsExact"
              type="number"
            />
          </Field.Root>
        )}
        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Which food allergies or other medical dietary restrictions do
            clients at your pantry report?
          </Field.Label>
          <Field.HelperText mb="1em">
            Please select all that apply.
          </Field.HelperText>
          <CheckboxGroup
            value={dietaryRestrictions}
            onValueChange={setDietaryRestrictions}
          >
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
                ...otherDietaryRestrictionsOptions,
                'Unsure',
              ].map((value) => (
                <Checkbox.Root
                  key={value}
                  value={value}
                  name="dietaryRestrictions"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>{value}</Checkbox.Label>
                </Checkbox.Root>
              ))}
            </Stack>
          </CheckboxGroup>
        </Field.Root>
        {dietaryRestrictions.find((option) =>
          otherDietaryRestrictionsOptions.includes(option),
        ) && (
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              If you selected "Other," please specify:
            </Field.Label>
            <Input maxW="20em" name="dietaryRestrictionsOther" type="text" />
          </Field.Root>
        )}
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Would you be able to accept refrigerated/frozen donations from us?
          </Field.Label>
          <RadioGroup.Root name="acceptRefrigerated">
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
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Are you willing to reserve our food shipments for allergen-avoidant
            individuals?
          </Field.Label>
          <Field.HelperText mb="1em">
            For example: keeping allergen-friendly items on a separate shelf,
            encouraging non-allergic clients to save these items for clients who
            do not have other safe food options.
          </Field.HelperText>
          <RadioGroup.Root
            name="willingToReserve"
            value={willingToReserve}
            onChange={setWillingToReserve}
          >
            <Stack>
              {[
                willingToReserveYesOption,
                willingToReserveSomeOption,
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
        {willingToReserve === willingToReserveYesOption && (
          <Field.Root isRequired mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              Please explain how you would do this:
            </Field.Label>
            <Textarea maxW="20em" name="howWillReserveYes" />
          </Field.Root>
        )}
        {willingToReserve === willingToReserveSomeOption && (
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              If you chose "some," please explain:
            </Field.Label>
            <Textarea maxW="20em" name="howWillReserveSome" />
          </Field.Root>
        )}
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Do you have a dedicated shelf or section of your pantry for
            allergy-friendly items?
          </Field.Label>
          <Field.HelperText mb="1em">
            If not, we would love to have a conversation and offer resources to
            help you build one!
          </Field.HelperText>
          <RadioGroup.Root name="dedicatedShelf">
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
          <RadioGroup.Root name="allergenAvoidantVisits">
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
          <RadioGroup.Root name="confidentIdentifyingAllergens">
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
          <RadioGroup.Root name="allergenAvoidantChildren">
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
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            What activities are you open to doing with SSF?
          </Field.Label>
          <Field.HelperText mb="1em">
            <p>
              Food donations are one part of being a partner pantry. The
              following are additional ways to help us better support you!
              (Please select all that apply.)
            </p>
            <p>Please select at least one option!</p>
          </Field.HelperText>
          {/* TODO: Fix input validation message */}
          <CheckboxGroup
            value={activities}
            onChange={(activities) => setActivities(activities as string[])}
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
        </Field.Root>
        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Please list any comments/concerns related to the previous question.
          </Field.Label>
          <Field.HelperText mb="1em">
            If you answered "something else," please elaborate!
          </Field.HelperText>
          <Textarea maxW="20em" name="activitiesComments" />
        </Field.Root>
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            What types of allergen-free items, if any, do you currently have in
            stock? (i.e., gluten-free breads, sunflower seed butters, non-dairy
            beverages, etc.)
          </Field.Label>
          <Textarea maxW="20em" name="allergenFreeItems" />
        </Field.Root>
        <Field.Root isRequired mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Do allergen-avoidant clients at your pantry ever request a greater
            variety of items or not have enough options?
          </Field.Label>
          <Textarea maxW="20em" name="allergenAvoidantRequests" />
        </Field.Root>
        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Would you like to subscribe to our quarterly newsletter?
          </Field.Label>
          <RadioGroup.Root name="subscribeToNewsletter">
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

  // Handle questions with checkboxes (we create an array of all
  // selected options)

  pantryApplicationData.set(
    'dietaryRestrictions',
    form.getAll('dietaryRestrictions'),
  );
  form.delete('dietaryRestrictions');

  pantryApplicationData.set('activities', form.getAll('activities'));
  form.delete('activities');

  // Handle all other questions
  form.forEach((value, key) => pantryApplicationData.set(key, value));

  const data = Object.fromEntries(pantryApplicationData);

  // TODO: API Call to update database
  console.log(data);
  return redirect('/');
};

export default PantryApplicationForm;
