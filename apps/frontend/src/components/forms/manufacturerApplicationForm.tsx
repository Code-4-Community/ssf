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
import React, { useState } from 'react';
import { USPhoneInput } from '@components/forms/usPhoneInput';
import { ManufacturerApplicationDto } from '../../types/types';
import ApiClient from '@api/apiClient';
import axios from 'axios';
import { ChevronDownIcon } from 'lucide-react';

const allergenOptions = [
  'Milk',
  'Egg',
  'Peanut',
  'Tree nuts',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
  'Gluten',
];

const ManufacturerApplicationForm: React.FC = () => {
  const [contactPhone, setContactPhone] = useState<string>('');
  const [secondaryContactPhone, setSecondaryContactPhone] =
    useState<string>('');
  const [unlistedProductAllergens, setUnlistedProductAllergens] = useState<string[]>([]);
  const [facilityFreeAllergens, setFacilityFreeAllergens] = useState<string[]>([]);

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
          Partner Manufacturer Application
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
        <Form method="post" action="/food-manufacturer-application">
          <Heading textStyle="h3" mb="1em" color="gray.dark">
            Food Manufacturer Application Form
          </Heading>
          <Stack
            gap="1em"
            mb="2em"
            color="gray.light"
            textStyle="p"
            fontWeight="400"
          >
            <Text>
              This form helps us learn about your company’s allergen-friendly products,
              facility standards, and sustainability practices so we can connect you
              with the right partner pantries.
            </Text>
            <Text mb=".5em">
              Please answer as accurately as possible. If you have any questions
              or need help, don’t hesitate to contact the SSF team.
            </Text>
            <Separator size="sm" color="neutral.100" />
          </Stack>

          <Text {...sectionTitleStyles}>Company Information</Text>
          <SimpleGrid columns={2} columnGap={9} rowGap={10} mb="4em">
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Company Name
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="foodManufacturerName"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label {...fieldHeaderStyles}>
                Company Website
                <Field.RequiredIndicator color="red" />
              </Field.Label>
              <Input
                name="foodManufacturerWebsite"
                type="text"
                borderColor="neutral.100"
              />
            </Field.Root>
          </SimpleGrid>

          <Separator size="sm" color="neutral.100" mb="3em" />

          <Text {...sectionTitleStyles}>Primary Contact Information</Text>
          <SimpleGrid columns={2} columnGap={9} rowGap={10} mb="4em">
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

          <Text {...sectionTitleStyles}>Product Details</Text>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              What allergen(s) are not listed in your products' ingredients?
              <Field.RequiredIndicator color="red" />
            </Field.Label>

            {unlistedProductAllergens.map((value) => (
              <input
                type="hidden"
                name="unlistedProductAllergens"
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
                  {unlistedProductAllergens.length > 0
                    ? `Select more allergens`
                    : 'Select allergens'}
                  <ChevronDownIcon />

                  <input
                    type="text"
                    name="unlistedProductAllergens-required"
                    value={unlistedProductAllergens.length > 0 ? 'selected' : ''}
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
                  {allergenOptions.map((value) => {
                    const isChecked = unlistedProductAllergens.includes(value);
                    return (
                      <Menu.CheckboxItem
                        key={value}
                        checked={isChecked}
                        onCheckedChange={(checked: boolean) => {
                          setUnlistedProductAllergens((prev) =>
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

            {unlistedProductAllergens.length > 0 && (
              <Flex wrap="wrap" mt={1} gap={2}>
                {unlistedProductAllergens.map((value) => (
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
                          setUnlistedProductAllergens((prev) =>
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

          <Field.Root required mb="3em">
            <Field.Label {...fieldHeaderStyles}>
              What allergen(s) is your facility free from?
              <Field.RequiredIndicator color="red" />
            </Field.Label>

            {facilityFreeAllergens.map((value) => (
              <input
                type="hidden"
                name="facilityFreeAllergens"
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
                  {facilityFreeAllergens.length > 0
                    ? `Select more allergens`
                    : 'Select allergens'}
                  <ChevronDownIcon />

                  <input
                    type="text"
                    name="facilityFreeAllergens-required"
                    value={facilityFreeAllergens.length > 0 ? 'selected' : ''}
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
                  {allergenOptions.map((value) => {
                    const isChecked = facilityFreeAllergens.includes(value);
                    return (
                      <Menu.CheckboxItem
                        key={value}
                        checked={isChecked}
                        onCheckedChange={(checked: boolean) => {
                          setFacilityFreeAllergens((prev) =>
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

            {facilityFreeAllergens.length > 0 && (
              <Flex wrap="wrap" mt={1} gap={2}>
                {facilityFreeAllergens.map((value) => (
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
                          setFacilityFreeAllergens((prev) =>
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

          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Are your products certified gluten-free?
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root name="productsGlutenFree" variant="solid">
              <Stack>
                {['Yes, always', 'No'].map((value) => (
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

          <Field.Root required mb="4em">
            <Field.Label {...fieldHeaderStyles}>
              Do your products contain sulfites?
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root name="productsContainSulfites" variant="solid">
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

          <Separator size="sm" color="neutral.100" mb="3em" />

          <Text {...sectionTitleStyles}>Additional Details</Text>
          <Text {...sectionSubtitleStyles} mb="0.5em">
            We focus on partnering with eco-friendly businesses and appreciate your support in responding to the next question:
          </Text>
          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Are your products sustainable or environmentally conscious? Please describe.
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <Textarea
              name="productsSustainableExplanation"
              borderColor="neutral.100"
              autoresize
            />
          </Field.Root>

          <Field.Root required mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Are you interested in providing in-kind food donations?
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root name="inKindDonations" variant="solid">
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
              Would you be donating food that would otherwise go to waste (i.e., food rescue)?
              <Field.RequiredIndicator color="red" />
            </Field.Label>
            <RadioGroup.Root name="donateWastedFood" variant="solid">
              <Stack>
                {[
                  'Always',
                  'Sometimes',
                  'Never',
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

          <Field.Root mb="2em">
            <Field.Label {...fieldHeaderStyles}>
              Are you:
            </Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Select an option"
                name="manufacturerAttribute"
                borderColor="neutral.100"
                color="neutral.800"
                textStyle="p2"
              >
                {[
                  'Female-founded or women-led',
                  'Non-GMO Project Verified',
                  'USDA Certified Organic',
                  'None of the above',
                ].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelectIndicator />
            </NativeSelect.Root>
          </Field.Root>

          <Field.Root mb="4em">
            <Field.Label {...fieldHeaderStyles}>
              Anything else we should know?
            </Field.Label>
            <Textarea
              name="additionalComments"
              borderColor="neutral.100"
              autoresize
            />
          </Field.Root>

          <Separator size="sm" color="neutral.100" mb="1.5em" />

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
            <Button type="submit" bg="blue.hover" fontWeight={600}>
              Submit
            </Button>
          </Box>
        </Form>
      </Box>
    </Box>
  );
};

export const submitManufacturerApplicationForm: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const form = await request.formData();
  const manufacturerApplicationData = new Map();

  manufacturerApplicationData.set(
    'unlistedProductAllergens',
    form.getAll('unlistedProductAllergens'),
  );
  manufacturerApplicationData.set(
    'facilityFreeAllergens',
    form.getAll('facilityFreeAllergens'),
  );
  manufacturerApplicationData.set(
    'productsGlutenFree',
    form.get('productsGlutenFree') === 'Yes, always',
  )
  manufacturerApplicationData.set(
    'productsContainSulfites',
    form.get('productsContainSulfites') === 'Yes',
  );
  manufacturerApplicationData.set(
    'inKindDonations',
    form.get('inKindDonations') === 'Yes',
  );
  manufacturerApplicationData.set(
    'newsletterSubscription',
    form.get('newsletterSubscription') === 'Yes',
  );
  form.delete('productsGlutenFree');
  form.delete('productsContainSulfites');
  form.delete('inKindDonations');
  form.delete('newsletterSubscription');
  form.delete('unlistedProductAllergens');
  form.delete('facilityFreeAllergens');

  // Copy all form data to Map
  form.forEach((value, key) => {
    if (value === '') {
      manufacturerApplicationData.set(key, null);
    } else {
      manufacturerApplicationData.set(key, value);
    }
  });

  const data = Object.fromEntries(manufacturerApplicationData);
  let submissionSuccessful: boolean = false;

  await ApiClient.postManufacturer(data as ManufacturerApplicationDto).then(
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
    ? redirect('/application/submitted')
    : null;
};

export default ManufacturerApplicationForm;
