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
  NativeSelect,
  NativeSelectIndicator,
  Tag,
  Separator,
  Checkbox,
  Menu,
  Flex,
} from '@chakra-ui/react';
import {
  ActionFunction,
  ActionFunctionArgs,
  Form,
  redirect,
} from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import { USPhoneInput } from '@components/forms/usPhoneInput';
import { PantryApplicationDto } from '../../types/types';
import ApiClient from '@api/apiClient';
import { Activity } from '../../types/pantryEnums';
import axios from 'axios';
import { ChevronDownIcon } from 'lucide-react';

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
  const [secondaryContactPhone, setSecondaryContactPhone] =
    useState<string>('');
  const [activities, setActivities] = useState<string[]>([]);
  const allergenClientsExactOption: string = 'I have an exact number';

  const [allergenClients, setAllergenClients] = useState<string | undefined>();
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [reserveFoodForAllergic, setReserveFoodForAllergic] =
    useState<string>();
  const [differentMailingAddress, setDifferentMailingAddress] = useState<
    boolean | null
  >();
  const [otherEmailContact, setOtherEmailContact] = useState<boolean>(false);

  const sectionTitleStyles = {
    fontFamily: 'inter',
    fontWeight: '600',
    fontSize: 'md',
    color: 'gray.dark',
    mb: '1.75em',
  };

  const sectionSubtitleStyles = {
    fontFamily: 'inter',
    fontWeight: '400',
    color: 'gray.light',
    mb: '2.25em',
    fontSize: 'sm',
  };

  const fieldHeaderStyles = {
    color: 'neutral.800',
    fontFamily: 'inter',
    fontSize: 'sm',
    fontWeight: '600',
  };

  return (
    <Box width="100%" mx="11em" my="4em">
      <Box as="section" mb="2.75em">
        <Heading textStyle="h1" fontWeight="normal" mb=".5em">
          Partner Pantry Application
        </Heading>
        <Text textStyle="p" color="gray.light">
          Thank you for your interest in partnering with Securing Safe Food
          (SSF) to help serve clients with food allergies and other adverse
          reactions to foods.
        </Text>
      </Box>
      <Box
        as="section"
        bg="#FEFEFE"
        p="2em"
        border="1px solid"
        borderColor="neutral.200"
        rounded="sm"
      >
        <Form method="post" action="/pantry-application">
          <Heading textStyle="h3" mb="1em" color="gray.dark">
            Pantry Application Form
          </Heading>
          <Stack
            gap="1em"
            mb="2em"
            color="gray.light"
            textStyle="p"
            fontWeight="400"
          >
            <Text>
              This application helps us understand your pantry’s capacity and
              interest in distributing allergen-friendly food. We’ll ask about
              your pantry’s current practices, storage capabilities, and
              communication preferences.
            </Text>
            <Text mb=".5em">
              Please answer as accurately as possible. If you have any questions
              or need help, don’t hesitate to contact the SSF team.
            </Text>
            <Separator size="sm" color="neutral.100" />
          </Stack>

          <Text {...sectionTitleStyles}>Primary Contact Information</Text>
          <SimpleGrid columns={2} columnGap={9} rowGap={10} mb="2.5em">
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                First Name
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="contactFirstName"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Last Name
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="contactLastName"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Phone Number
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <USPhoneInput
                value={contactPhone}
                onChange={setContactPhone}
                inputProps={{
                  name: 'contactPhone',
                  borderColor: 'neutral.100',
                }}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Email Address
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="contactEmail"
                type="email"
                borderColor="neutral.100"
              />
            </Field.Root>
          </SimpleGrid>
          <Field.Root required mb=".75em">
            <Field.Label {...fieldHeaderStyles} mb=".5em">
              Is there someone at your pantry who can regularly check and
              respond to emails from SSF as needed?{' '}
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root
              name="hasEmailContact"
              variant="solid"
              onValueChange={(e: { value: string }) =>
                setOtherEmailContact(e.value === 'Other')
              }
            >
              <Stack>
                {['Yes', 'No', 'Other'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput required />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }}>
                      <RadioGroup.ItemIndicator
                        border="1px solid"
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText color="neutral.700" textStyle="p2">
                      {value}
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>
          <Field.Root required={otherEmailContact} mb="2.5em">
            <Input
              name="emailContactOther"
              type="text"
              borderColor="neutral.100"
              placeholder="If you selected other, please specify."
              _placeholder={{ color: 'neutral.800' }}
              maxW="30em"
            />
          </Field.Root>

          <Separator size="sm" color="neutral.100" mb="3em" />

          <Text {...sectionTitleStyles}>Secondary Contact Information</Text>
          <SimpleGrid columns={2} columnGap={9} rowGap={9} mb="4em">
            <Field.Root>
              <Field.Label {...fieldHeaderStyles}>First Name</Field.Label>
              <Input
                name="secondaryContactFirstName"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label {...fieldHeaderStyles}>Last Name</Field.Label>
              <Input
                name="secondaryContactLastName"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label {...fieldHeaderStyles}>Phone Number</Field.Label>
              <USPhoneInput
                value={secondaryContactPhone}
                onChange={setSecondaryContactPhone}
                allowEmpty={true}
                inputProps={{
                  name: 'secondaryContactPhone',
                  borderColor: 'neutral.100',
                }}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label {...fieldHeaderStyles}>Email Address</Field.Label>
              <Input
                name="secondaryContactEmail"
                type="email"
                borderColor="neutral.100"
              />
            </Field.Root>
          </SimpleGrid>

          <Separator size="sm" color="neutral.100" mb="3em" />

          <Text {...sectionTitleStyles} mb="0">
            Food Shipment Address
          </Text>
          <Text {...sectionSubtitleStyles}>
            Please list your address for <b>food shipments</b>.
          </Text>
          <SimpleGrid columns={2} columnGap={9} rowGap={9} mb="2em">
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Address Line 1
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="shipmentAddressLine1"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label {...fieldHeaderStyles}>Address Line 2</Field.Label>
              <Input
                name="shipmentAddressLine2"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                City/Town
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="shipmentAddressCity"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                State/Region/Province
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="shipmentAddressState"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Zip/Post Code
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="shipmentAddressZip"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label {...fieldHeaderStyles}>Country</Field.Label>
              <Input
                name="shipmentAddressCountry"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
          </SimpleGrid>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles} mb=".5em">
              Does this address differ from your pantry's mailing address for
              documents? <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root
              variant="solid"
              onValueChange={(e: { value: string }) =>
                setDifferentMailingAddress(e.value === 'Yes')
              }
              name="differentMailingAddress"
            >
              <Stack>
                {['Yes', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput required />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }}>
                      <RadioGroup.ItemIndicator
                        border="1px solid"
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText color="neutral.700" textStyle="p2">
                      {value}
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles} mb=".5em">
              Would your pantry be able to accept food deliveries during
              standard business hours Mon-Fri?{' '}
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root name="acceptFoodDeliveries" variant="solid">
              <Stack>
                {['Yes', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput required />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }}>
                      <RadioGroup.ItemIndicator
                        border="1px solid"
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText color="neutral.700" textStyle="p2">
                      {value}
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>
          <Field.Root mb="4em">
            <Field.Label {...fieldHeaderStyles}>
              Please note any delivery window restrictions.
            </Field.Label>
            <Textarea
              name="deliveryWindowInstructions"
              borderColor="neutral.100"
            />
          </Field.Root>

          <Separator size="sm" color="neutral.100" my="3em" />

          {differentMailingAddress && (
            <>
              <Text {...sectionTitleStyles} mb="0">
                Mailing Address
              </Text>
              <Text {...sectionSubtitleStyles}>
                Please list your mailing address for <b>documents</b>.
              </Text>
              <SimpleGrid columns={2} columnGap={9} rowGap={9} mb="4em">
                <Field.Root required={differentMailingAddress}>
                  <Field.Label {...fieldHeaderStyles}>
                    Address Line 1
                    <Field.RequiredIndicator color="red" />
                  </Field.Label>
                  <Input
                    name="mailingAddressLine1"
                    type="text"
                    borderColor="neutral.100"
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label {...fieldHeaderStyles}>
                    Address Line 2
                  </Field.Label>
                  <Input
                    name="mailingAddressLine2"
                    type="text"
                    borderColor="neutral.100"
                  />
                </Field.Root>
                <Field.Root required={differentMailingAddress}>
                  <Field.Label {...fieldHeaderStyles}>
                    City/Town
                    <Field.RequiredIndicator color="red" />
                  </Field.Label>
                  <Input
                    name="mailingAddressCity"
                    type="text"
                    borderColor="neutral.100"
                  />
                </Field.Root>
                <Field.Root required={differentMailingAddress}>
                  <Field.Label {...fieldHeaderStyles}>
                    State/Region/Province
                    <Field.RequiredIndicator color="red" />
                  </Field.Label>
                  <Input
                    name="mailingAddressState"
                    type="text"
                    borderColor="neutral.100"
                  />
                </Field.Root>
                <Field.Root required={differentMailingAddress}>
                  <Field.Label {...fieldHeaderStyles}>
                    Zip/Post Code
                    <Field.RequiredIndicator color="red" />
                  </Field.Label>
                  <Input
                    name="mailingAddressZip"
                    type="text"
                    borderColor="neutral.100"
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label {...fieldHeaderStyles}>Country</Field.Label>
                  <Input
                    name="mailingAddressCountry"
                    type="text"
                    borderColor="neutral.100"
                  />
                </Field.Root>
              </SimpleGrid>

              <Separator size="sm" color="neutral.100" my="3em" />
            </>
          )}

          <Text {...sectionTitleStyles}>Pantry Details</Text>
          <Field.Root required mb="2em">
            <Field.Label asChild>
              <Text {...fieldHeaderStyles}>
                Pantry Name
                <Field.RequiredIndicator color="red" />
              </Text>
            </Field.Label>
            <Input name="pantryName" type="text" borderColor="neutral.100" />
          </Field.Root>
          <Field.Root required mb="2em" invalid={!allergenClients}>
            <Field.Label {...fieldHeaderStyles}>
              Approximately how many allergen-avoidant clients does your pantry
              serve?
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={allergenClients}
                onChange={(e) => setAllergenClients(e.target.value)}
                placeholder="Select an option"
                color="neutral.800"
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
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelectIndicator />
            </NativeSelect.Root>
          </Field.Root>
          {allergenClients === allergenClientsExactOption && (
            <Field.Root required mb="2em">
              <Field.Label {...fieldHeaderStyles}>
                Please provide the exact number, if known
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                maxW="10em"
                name="allergenClientsExact"
                type="number"
                color="neutral.800"
                borderColor="neutral.100"
                min="0"
              />
            </Field.Root>
          )}
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Which food allergies or other medical dietary restrictions do
              clients at your pantry report?
              <Field.RequiredIndicator color="red" />
            </Field.Label>

            {restrictions.map((value) => (
              <input
                type="hidden"
                name="restrictions"
                key={value}
                value={value}
              />
            ))}

            <Menu.Root closeOnSelect={false}>
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
                >
                  {restrictions.length > 0
                    ? `Select more restrictions`
                    : 'Select restrictions'}
                  <ChevronDownIcon />

                  <input
                    type="text"
                    name="restrictions-required"
                    value={restrictions.length > 0 ? 'selected' : ''}
                    required
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                    }}
                  />
                </Button>
              </Menu.Trigger>

              <Menu.Positioner w="full">
                <Menu.Content maxH="500px" overflowY="auto">
                  {dietaryRestrictionOptions.map((value) => {
                    const isChecked = restrictions.includes(value);
                    return (
                      <Menu.CheckboxItem
                        key={value}
                        checked={isChecked}
                        onCheckedChange={(checked: boolean) => {
                          setRestrictions((prev) =>
                            checked
                              ? [...prev, value]
                              : prev.filter((i) => i !== value),
                          );
                        }}
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
                          {value}
                        </Text>
                      </Menu.CheckboxItem>
                    );
                  })}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>

            {restrictions.length > 0 && (
              <Flex wrap="wrap" mt={1} gap={2}>
                {restrictions.map((value) => (
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
                            prev.filter((item) => item !== value),
                          )
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    </Tag.EndElement>
                  </Tag.Root>
                ))}
              </Flex>
            )}
          </Field.Root>

          {restrictions.find((option) =>
            otherRestrictionsOptions.includes(option),
          ) && (
            <Field.Root
              required={restrictions.find((option) =>
                otherRestrictionsOptions.includes(option),
              )}
              mb="2em"
            >
              <Field.Label {...fieldHeaderStyles}>
                If you selected "Other," please specify:
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input maxW="20em" name="restrictionsOther" type="text" />
            </Field.Root>
          )}
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Would you be able to accept frozen donations that require
              refrigeration or freezing?
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root name="refrigeratedDonation" variant="solid">
              <Stack>
                {[
                  'Yes, always',
                  'No',
                  'Sometimes (check in before sending)',
                ].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput required />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }}>
                      <RadioGroup.ItemIndicator
                        border="1px solid"
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText color="neutral.700" textStyle="p2">
                      {value}
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>

          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Do you have a dedicated shelf or section of your pantry for
              allergy-friendly items?
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root name="dedicatedAllergyFriendly" variant="solid">
              <Stack>
                {['Yes', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput required />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }}>
                      <RadioGroup.ItemIndicator
                        border="1px solid"
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText color="neutral.700" textStyle="p2">
                      {value}
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>

          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Are you willing to reserve our food shipments for
              allergen-avoidant individuals?{' '}
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Field.HelperText color="neutral.600" mb=".5em">
              For example, grouping allergen-friendly items on a separate shelf
              or in separate bins and encouraging non-allergic clients to save
              these items for clients who do not have other safe food options.
            </Field.HelperText>
            <RadioGroup.Root
              name="reserveFoodForAllergic"
              variant="solid"
              onValueChange={(e: { value: string }) =>
                setReserveFoodForAllergic(e.value)
              }
            >
              <Stack>
                {['Yes', 'Some', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput required />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }}>
                      <RadioGroup.ItemIndicator
                        border="1px solid"
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText color="neutral.700" textStyle="p2">
                      {value}
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>

          {reserveFoodForAllergic === 'Yes' && (
            <Field.Root mb="2em">
              <Field.Label {...fieldHeaderStyles}>
                How would you work to ensure that allergen-friendly foods are
                distributed to clients with food allergies or other adverse
                reactions to foods?
              </Field.Label>
              <Textarea
                name="reservationExplanation"
                borderColor="neutral.100"
                autoresize
              />
            </Field.Root>
          )}

          {reserveFoodForAllergic === 'Some' && (
            <Field.Root mb="2em">
              <Field.Label {...fieldHeaderStyles}>
                Please explain why you selected "Some."
              </Field.Label>
              <Textarea
                name="reservationExplanation"
                borderColor="neutral.100"
                autoresize
              />
            </Field.Root>
          )}

          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              How often do allergen-avoidant clients visit your food pantry?
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select an option"
                name="clientVisitFrequency"
                borderColor="neutral.100"
                color="neutral.800"
              >
                {[
                  'Daily',
                  'More than once a week',
                  'Once a week',
                  'A few times a month',
                  'Once a month',
                ].map((value) => (
                  <option key={value} value={value}>
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
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select an option"
                name="identifyAllergensConfidence"
                borderColor="neutral.100"
                color="neutral.800"
              >
                {[
                  'Very confident',
                  'Somewhat confident',
                  'Not very confident (we need more education!)',
                ].map((value) => (
                  <option key={value} value={value}>
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
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select an option"
                name="serveAllergicChildren"
                borderColor="neutral.100"
                color="neutral.800"
              >
                {['Yes, many (> 10)', 'Yes, a few (< 10)', 'No'].map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ),
                )}
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
              What activities are you open to doing with SSF?
              <Field.RequiredIndicator color="red" />
            </Field.Label>

            {activities.map((value) => (
              <input
                type="hidden"
                name="activities"
                key={value}
                value={value}
              />
            ))}

            <Menu.Root closeOnSelect={false}>
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
                >
                  {activities.length > 0
                    ? `Select more activities`
                    : 'Select activities'}
                  <ChevronDownIcon />

                  <input
                    type="text"
                    name="activities-required"
                    value={activities.length > 0 ? 'selected' : ''}
                    required
                    style={{
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                    }}
                  />
                </Button>
              </Menu.Trigger>

              <Menu.Positioner w="full">
                <Menu.Content maxH="500px" overflowY="auto">
                  {activityOptions.map((value) => {
                    const isChecked = activities.includes(value);
                    return (
                      <Menu.CheckboxItem
                        key={value}
                        checked={isChecked}
                        onCheckedChange={(checked: boolean) => {
                          setActivities((prev) =>
                            checked
                              ? [...prev, value]
                              : prev.filter((i) => i !== value),
                          );
                        }}
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
                          {value}
                        </Text>
                      </Menu.CheckboxItem>
                    );
                  })}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>

            {activities.length > 0 && (
              <Flex wrap="wrap" mt={1} gap={2}>
                {activities.map((value) => (
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
                            prev.filter((item) => item !== value),
                          )
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    </Tag.EndElement>
                  </Tag.Root>
                ))}
              </Flex>
            )}
            <Field.HelperText color="neutral.600">
              Food donations are one part of being a partner pantry. The
              following are additional ways to help us better support you!
              Please select all that apply.
            </Field.HelperText>
          </Field.Root>
          <Field.Root required={activities.includes('Something else')} mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Please list any comments/concerns related to the previous
              question.
              {activities.includes('Something else') && (
                <Field.RequiredIndicator color="red" />
              )}
            </Field.Label>
            <Textarea
              name="activitiesComments"
              borderColor="neutral.100"
              autoresize
            />
            <Field.HelperText color="neutral.600">
              If you answered "Something Else," please elaborate.
            </Field.HelperText>
          </Field.Root>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              What types of allergen-free items, if any, do you currently have
              in stock?
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Textarea
              name="itemsInStock"
              borderColor="neutral.100"
              autoresize
            />
            <Field.HelperText color="neutral.600">
              For example, gluten-free breads, sunflower seed butters, nondairy
              beverages, etc.
            </Field.HelperText>
          </Field.Root>
          <Field.Root required mb="4em">
            <Field.Label {...fieldHeaderStyles}>
              Do allergen-avoidant clients at your pantry ever request a greater
              variety of items or not have enough options? Please explain.
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Textarea
              name="needMoreOptions"
              borderColor="neutral.100"
              autoresize
            />
          </Field.Root>

          <Separator size="sm" color="neutral.100" my="3em" />

          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Would you like to subscribe to our quarterly newsletter?
            </Field.Label>
            <RadioGroup.Root name="newsletterSubscription" variant="solid">
              <Stack>
                {['Yes', 'No'].map((value) => (
                  <RadioGroup.Item key={value} value={value}>
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl _checked={{ bg: 'neutral.800' }}>
                      <RadioGroup.ItemIndicator
                        border="1px solid"
                        borderColor="neutral.100"
                      />
                    </RadioGroup.ItemControl>
                    <RadioGroup.ItemText color="neutral.700" textStyle="p2">
                      {value}
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>
            </RadioGroup.Root>
          </Field.Root>
          <Field.Root required mb="4em">
            <Checkbox.Root>
              <Checkbox.HiddenInput />
              <Checkbox.Control
                border="1px solid"
                borderColor="neutral.100"
                _checked={{ bg: 'neutral.800' }}
              />
              <Checkbox.Label {...fieldHeaderStyles}>
                By submitting this form, you agree to our Privacy Policy.{' '}
                <Field.RequiredIndicator color="red" />
              </Checkbox.Label>
            </Checkbox.Root>
          </Field.Root>
          <Box display="flex" gap={2} justifyContent="flex-end" mb={6}>
            <Button
              border="1px solid"
              color="neutral.800"
              borderColor="neutral.200"
              fontWeight={600}
              bg="white"
            >
              Cancel
            </Button>
            <Button type="submit" bg="blue.ssf" fontWeight={600} px={8}>
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

  const ActivityStorageMap: Record<string, string> = {
    'Create a labeled, allergy-friendly shelf or shelves':
      Activity.CREATE_LABELED_SHELF,
    'Provide clients and staff/volunteers with educational pamphlets':
      Activity.PROVIDE_EDUCATIONAL_PAMPHLETS,
    "Use a spreadsheet to track clients' medical dietary needs and distribution of SSF items per month":
      Activity.TRACK_DIETARY_NEEDS,
    'Post allergen-free resource flyers throughout pantry':
      Activity.POST_RESOURCE_FLYERS,
    'Survey your clients to determine their medical dietary needs':
      Activity.SURVEY_CLIENTS,
    'Collect feedback from allergen-avoidant clients on SSF foods':
      Activity.COLLECT_FEEDBACK,
    'Something else': Activity.SOMETHING_ELSE,
  };

  const restrictions = form.getAll('restrictions');
  const restrictionsOther = form.get('restrictionsOther');
  if (restrictionsOther !== null && restrictionsOther !== '') {
    restrictions.push(restrictionsOther as string);
  }
  pantryApplicationData.set('restrictions', restrictions);
  form.delete('restrictions');
  form.delete('restrictionsOther');

  const selectedActivities = form.getAll('activities') as string[];
  const convertedActivities = selectedActivities.map(
    (activity) => ActivityStorageMap[activity],
  );
  pantryApplicationData.set('activities', convertedActivities);
  form.delete('activities');

  pantryApplicationData.set(
    'newsletterSubscription',
    form.get('newsletterSubscription') === 'Yes',
  );
  pantryApplicationData.set(
    'acceptFoodDeliveries',
    form.get('acceptFoodDeliveries') === 'Yes',
  );
  pantryApplicationData.set(
    'dedicatedAllergyFriendly',
    form.get('dedicatedAllergyFriendly') === 'Yes',
  );
  pantryApplicationData.set(
    'hasEmailContact',
    form.get('hasEmailContact') === 'Yes',
  );
  form.delete('newsletterSubscription');
  form.delete('acceptFoodDeliveries');
  form.delete('dedicatedAllergyFriendly');
  form.delete('hasEmailContact');

  // Handle mailing address
  if (form.get('differentMailingAddress') === 'No') {
    pantryApplicationData.set(
      'mailingAddressLine1',
      form.get('shipmentAddressLine1'),
    );
    pantryApplicationData.set(
      'mailingAddressLine2',
      form.get('shipmentAddressLine2') || null,
    );
    pantryApplicationData.set(
      'mailingAddressCity',
      form.get('shipmentAddressCity'),
    );
    pantryApplicationData.set(
      'mailingAddressState',
      form.get('shipmentAddressState'),
    );
    pantryApplicationData.set(
      'mailingAddressZip',
      form.get('shipmentAddressZip'),
    );
    pantryApplicationData.set(
      'mailingAddressCountry',
      form.get('shipmentAddressCountry') || null,
    );
  }
  form.delete('differentMailingAddress');

  // Replace the answer for allergenClients with the answer
  // for allergenClientsExact if it is given
  const allergenClientsExact = form.get('allergenClientsExact');
  if ((allergenClientsExact ?? '') !== '') {
    pantryApplicationData.set('allergenClients', allergenClientsExact);
  }
  form.delete('allergenClientsExact');

  // Copy all form data to Map
  form.forEach((value, key) => {
    if (value === '') {
      pantryApplicationData.set(key, null);
    } else {
      pantryApplicationData.set(key, value);
    }
  });

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
        console.log(error);
      }
    },
  );

  return submissionSuccessful
    ? redirect('/pantry-application/submitted')
    : null;
};

export default PantryApplicationForm;
