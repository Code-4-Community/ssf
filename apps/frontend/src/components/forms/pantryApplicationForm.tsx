import {
  Box,
  Button,
  Checkbox,
  Field,
  Heading,
  Input,
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
  const [activities, setActivities] = useState<string[]>([]);

  const noActivitiesSelected: boolean = activities.length === 0;

  const allergenAvoidantClientsExactOption: string = 'I have an exact number';
  const otherDietaryRestrictionsOptions: string[] = [
    'Other allergy (e.g., yeast, sunflower, etc.)',
    'Other allergic illness (e.g., eosinophilic esophagitis, FPIES, oral allergy syndrome)',
    'Other dietary restriction',
  ];
  const willingToReserveYesOption: string = 'Yes';
  const willingToReserveSomeOption: string = 'Some';

  const [allergenAvoidantClients, setAllergenAvoidantClients] = useState<string | undefined>();
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [willingToReserve, setWillingToReserve] = useState<string | undefined>();

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
          <Field.Label>
            <Text fontSize={25} fontWeight={700}>
              First and Last Name
            </Text>
          </Field.Label>
          <Field.HelperText mb="1em">
            Whom should we contact at your pantry?
          </Field.HelperText>
          <Input maxW="20em" name="contactName" type="text" />
        </Field.Root>

        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Email Address
          </Field.Label>
          <Field.HelperText mb="1em">
            Please provide the email address of the pantry contact listed above.
          </Field.HelperText>
          <Input maxW="20em" name="contactEmail" type="email" />
        </Field.Root>

        <Field.Root required mb="2em">
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

        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Food Pantry Name
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
            <Field.Label fontSize={20} fontWeight={700}>Address Line 1</Field.Label>
            <Input maxW="20em" name="addressLine1" type="text" />
          </Field.Root>

          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>Address Line 2</Field.Label>
            <Input maxW="20em" name="addressLine2" type="text" />
          </Field.Root>

          <Field.Root required mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>City/Town</Field.Label>
            <Input maxW="20em" name="addressCity" type="text" />
          </Field.Root>

          <Field.Root required mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>State/Region/Province</Field.Label>
            <Input maxW="20em" name="addressRegion" type="text" />
          </Field.Root>

          <Field.Root required mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>Zip/Post Code</Field.Label>
            <Input maxW="20em" name="addressZip" type="text" />
          </Field.Root>

          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>Country</Field.Label>
            <Input maxW="20em" name="addressCountry" type="text" />
          </Field.Root>
        </section>

        <Field.Root required mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Approximately how many allergen-avoidant clients does your pantry serve?
          </Field.Label>
          <Field.HelperText mb="1em">
            Please note that our target population is NOT individuals with diabetic, low sugar/sodium, halal, vegan/vegetarian, or kosher needs.
          </Field.HelperText>
          <RadioGroup.Root
            name="allergenAvoidantClients"
            value={allergenAvoidantClients}
            onValueChange={(e) => setAllergenAvoidantClients(e.value ?? undefined)}
          >
            <Stack>
              {['< 10', '10 to 20', '20 to 50', '50 to 100', '> 100', "I'm not sure", allergenAvoidantClientsExactOption].map((value) => (
                <RadioGroup.Item key={value} value={value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemControl />
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
            <Input maxW="20em" name="allergenAvoidantClientsExact" type="number" />
          </Field.Root>
        )}

        <Field.Root mb="2em">
          <Field.Label fontSize={25} fontWeight={700}>
            Which food allergies or other medical dietary restrictions do clients at your pantry report?
          </Field.Label>
          <Field.HelperText mb="1em">Please select all that apply.</Field.HelperText>
          <CheckboxGroup.Root
            value={dietaryRestrictions}
            onValueChange={(e) => setDietaryRestrictions(e.value)}
          >
            <Stack>
              {['Egg allergy', 'Fish allergy', 'Milk allergy', 'Lactose intolerance/dairy sensitivity', 'Peanut allergy', 'Shellfish allergy', 'Soy allergy', 'Sesame allergy', 'Tree nut allergy', 'Wheat allergy', 'Celiac disease', 'Gluten sensitivity (not celiac disease)', "Gastrointestinal illness (IBS, Crohn's, gastroparesis, etc.)", ...otherDietaryRestrictionsOptions, 'Unsure'].map((value) => (
                <Checkbox name="dietaryRestrictions" key={value} value={value}>
                  {value}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup.Root>
        </Field.Root>

        {dietaryRestrictions.find((option) => otherDietaryRestrictionsOptions.includes(option)) && (
          <Field.Root mb="2em">
            <Field.Label fontSize={20} fontWeight={700}>
              If you selected "Other," please specify:
            </Field.Label>
            <Input maxW="20em" name="dietaryRestrictionsOther" type="text" />
          </Field.Root>
        )}

        {/* Continue with similar pattern for remaining fields... */}
        
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

  pantryApplicationData.set('dietaryRestrictions', form.getAll('dietaryRestrictions'));
  form.delete('dietaryRestrictions');

  pantryApplicationData.set('activities', form.getAll('activities'));
  form.delete('activities');

  form.forEach((value, key) => pantryApplicationData.set(key, value));

  const data = Object.fromEntries(pantryApplicationData);
  console.log(data);
  return redirect('/');
};

export default PantryApplicationForm;
