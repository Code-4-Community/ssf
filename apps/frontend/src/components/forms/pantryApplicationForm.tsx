import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
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
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            First and Last Name
          </FormLabel>
          <FormHelperText mb="1em">
            Whom should we contact at your pantry?
          </FormHelperText>
          <Input maxW="20em" name="contactName" type="text" />
        </FormControl>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Email Address
          </FormLabel>
          <FormHelperText mb="1em">
            Please provide the email address of the pantry contact listed above.
          </FormHelperText>
          <Input maxW="20em" name="contactEmail" type="email" />
        </FormControl>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Phone Number
          </FormLabel>
          <FormHelperText mb="1em">
            Please provide the phone number of the pantry contact listed above.
          </FormHelperText>
          <USPhoneInput
            value={phone}
            onChange={setPhone}
            inputProps={{ maxW: '20em', name: 'contactPhone' }}
          />
        </FormControl>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Food Pantry Name
          </FormLabel>
          <Input maxW="20em" name="pantryName" type="text" />
        </FormControl>
        <section>
          <Heading as="h3" size="lg" mb="0.5em">
            Address <span style={{ color: 'red' }}>*</span>
          </Heading>
          <Text mb="1em">
            Please list your address for <b>food</b> shipments.
          </Text>
          <FormControl isRequired mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              Address Line 1
            </FormLabel>
            <Input maxW="20em" name="addressLine1" type="text" />
          </FormControl>
          <FormControl mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              Address Line 2
            </FormLabel>
            <Input maxW="20em" name="addressLine2" type="text" />
          </FormControl>
          <FormControl isRequired mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              City/Town
            </FormLabel>
            <Input maxW="20em" name="addressCity" type="text" />
          </FormControl>
          <FormControl isRequired mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              State/Region/Province
            </FormLabel>
            <Input maxW="20em" name="addressRegion" type="text" />
          </FormControl>
          <FormControl isRequired mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              Zip/Post Code
            </FormLabel>
            <Input maxW="20em" name="addressZip" type="text" />
          </FormControl>
          <FormControl mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              Country
            </FormLabel>
            <Input maxW="20em" name="addressCountry" type="text" />
          </FormControl>
        </section>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Approximately how many allergen-avoidant clients does your pantry
            serve?
          </FormLabel>
          <FormHelperText mb="1em">
            Please note that our target population is NOT individuals with
            diabetic, low sugar/sodium, halal, vegan/vegetarian, or kosher
            needs.
          </FormHelperText>
          <RadioGroup
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
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
        {allergenAvoidantClients === allergenAvoidantClientsExactOption && (
          <FormControl mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              Please provide the exact number, if known:
            </FormLabel>
            <Input
              maxW="20em"
              name="allergenAvoidantClientsExact"
              type="number"
            />
          </FormControl>
        )}
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Which food allergies or other medical dietary restrictions do
            clients at your pantry report?
          </FormLabel>
          <FormHelperText mb="1em">
            Please select all that apply.
          </FormHelperText>
          <CheckboxGroup
            value={dietaryRestrictions}
            onChange={(restrictions) =>
              setDietaryRestrictions(restrictions as string[])
            }
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
                <Checkbox name="dietaryRestrictions" key={value} value={value}>
                  {value}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </FormControl>
        {dietaryRestrictions.find((option) =>
          otherDietaryRestrictionsOptions.includes(option),
        ) && (
          <FormControl mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              If you selected "Other," please specify:
            </FormLabel>
            <Input maxW="20em" name="dietaryRestrictionsOther" type="text" />
          </FormControl>
        )}
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Would you be able to accept refrigerated/frozen donations from us?
          </FormLabel>
          <RadioGroup name="acceptRefrigerated">
            <Stack>
              {['Yes', 'Small quantities only', 'No'].map((value) => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Are you willing to reserve our food shipments for allergen-avoidant
            individuals?
          </FormLabel>
          <FormHelperText mb="1em">
            For example: keeping allergen-friendly items on a separate shelf,
            encouraging non-allergic clients to save these items for clients who
            do not have other safe food options.
          </FormHelperText>
          <RadioGroup
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
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
        {willingToReserve === willingToReserveYesOption && (
          <FormControl isRequired mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              Please explain how you would do this:
            </FormLabel>
            <Textarea maxW="20em" name="howWillReserveYes" />
          </FormControl>
        )}
        {willingToReserve === willingToReserveSomeOption && (
          <FormControl mb="2em">
            <FormLabel fontSize={20} fontWeight={700}>
              If you chose "some," please explain:
            </FormLabel>
            <Textarea maxW="20em" name="howWillReserveSome" />
          </FormControl>
        )}
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Do you have a dedicated shelf or section of your pantry for
            allergy-friendly items?
          </FormLabel>
          <FormHelperText mb="1em">
            If not, we would love to have a conversation and offer resources to
            help you build one!
          </FormHelperText>
          <RadioGroup name="dedicatedShelf">
            <Stack>
              {[
                'Yes, we have a dedicated shelf or box',
                'Yes, we keep allergy-friendly items in a back room',
                'No, we keep allergy-friendly items throughout the pantry, depending on the type of item',
              ].map((value) => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            How often do allergen-avoidant clients visit your food pantry?
          </FormLabel>
          <RadioGroup name="allergenAvoidantVisits">
            <Stack>
              {[
                'Daily',
                'More than once a week',
                'Once a week',
                'A few times a month',
                'Once a month',
              ].map((value) => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Are you confident in identifying the top 9 allergens in an
            ingredient list?
          </FormLabel>
          <FormHelperText mb="1em">
            The top 9 allergens are milk, egg, peanut, tree nuts, wheat, soy,
            fish, shellfish, and sesame.
          </FormHelperText>
          <RadioGroup name="confidentIdentifyingAllergens">
            <Stack>
              {[
                'Very confident',
                'Somewhat confident',
                'Not very confident (we need more education!)',
              ].map((value) => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Do you serve allergen-avoidant or food-allergic children at your
            pantry?
          </FormLabel>
          <FormHelperText mb="1em">
            "Children" is defined as any individual under the age of 18 either
            living independently or as part of a household.
          </FormHelperText>
          <RadioGroup name="allergenAvoidantChildren">
            <Stack>
              {['Yes, many (> 10)', 'Yes, a few (< 10)', 'No'].map((value) => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            What activities are you open to doing with SSF?
          </FormLabel>
          <FormHelperText mb="1em">
            <p>
              Food donations are one part of being a partner pantry. The
              following are additional ways to help us better support you!
              (Please select all that apply.)
            </p>
            <p>Please select at least one option!</p>
          </FormHelperText>
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
                <Checkbox
                  name="activities"
                  key={value}
                  value={value}
                  isRequired={noActivitiesSelected}
                >
                  {value}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </FormControl>
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Please list any comments/concerns related to the previous question.
          </FormLabel>
          <FormHelperText mb="1em">
            If you answered "something else," please elaborate!
          </FormHelperText>
          <Textarea maxW="20em" name="activitiesComments" />
        </FormControl>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            What types of allergen-free items, if any, do you currently have in
            stock? (i.e., gluten-free breads, sunflower seed butters, non-dairy
            beverages, etc.)
          </FormLabel>
          <Textarea maxW="20em" name="allergenFreeItems" />
        </FormControl>
        <FormControl isRequired mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Do allergen-avoidant clients at your pantry ever request a greater
            variety of items or not have enough options?
          </FormLabel>
          <Textarea maxW="20em" name="allergenAvoidantRequests" />
        </FormControl>
        <FormControl mb="2em">
          <FormLabel fontSize={25} fontWeight={700}>
            Would you like to subscribe to our quarterly newsletter?
          </FormLabel>
          <RadioGroup name="subscribeToNewsletter">
            <Stack>
              {['Yes', 'No'].map((value) => (
                <Radio key={value} value={value}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
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
