import { Input } from '@chakra-ui/react';
import React from 'react';
import { usePhoneInput } from 'react-international-phone';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

const isPhoneValid = (phone: string): boolean => {
  try {
    return (
      phoneUtil.isPossibleNumberWithReason(
        phoneUtil.parseAndKeepRawInput(phone, 'US'),
      ) === PhoneNumberUtil.ValidationResult.IS_POSSIBLE
    );
  } catch {
    return false;
  }
};

// Based on the example ChakraPhone component from the react-international-phone
// source:
// https://github.com/ybrusentsov/react-international-phone/blob/master/src/stories/UiLibsExample/components/ChakraPhone.tsx

export interface USPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  allowEmpty?: boolean;
  inputProps?: object;
}

/**
 * Form input component for a US phone number. Automatically formats the entered
 * phone number and handles its own validation.
 */
export const USPhoneInput: React.FC<USPhoneInputProps> = ({
  value,
  onChange,
  allowEmpty = false,
  inputProps,
}) => {
  const phoneInput = usePhoneInput({
    defaultCountry: 'us',
    disableDialCodeAndPrefix: true,
    value,
    onChange: (data) => {
      onChange(data.phone);

      if (isPhoneValid(data.phone)) {
        phoneInput.inputRef.current?.setCustomValidity('');
      } else if (!allowEmpty) {
        phoneInput.inputRef.current?.setCustomValidity('Invalid phone number.');
      }
    },
  });

  return (
    <Input
      type="tel"
      value={phoneInput.inputValue}
      onChange={phoneInput.handlePhoneValueChange}
      ref={phoneInput.inputRef}
      {...inputProps}
    />
  );
};
