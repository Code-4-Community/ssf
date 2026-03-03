/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import '@chakra-ui/react';
import React from 'react';

// This file serves as an extension onto some select chakra-ui components that we use
// It essentially allows us to give permissions for these components to have children
// Which, while the DOM renders just fine, TypeScript throws errors for unless these are specified
declare module '@chakra-ui/react' {
  export interface ComponentPropsStrictChildren {
    asChild?: boolean; // Enables composition pattern
    children?: JSX.Element | JSX.Element[]; // Allows child elements only
    as?: React.ElementType; // Polymorphic component prop
    [key: string]: any; // Catch-all for any other props
  }

  export interface ComponentPropsLenientChildren {
    asChild?: boolean; // Enables composition pattern
    children?: React.ReactNode; // Allows child elements (any combination of components/strings)
    as?: React.ElementType; // Polymorphic component prop
    [key: string]: any; // Catch-all for any other props
  }

  // Menu components
  export interface MenuTriggerProps extends ComponentPropsStrictChildren {}
  export interface MenuContentProps extends ComponentPropsStrictChildren {}
  export interface MenuItemProps extends ComponentPropsLenientChildren {}
  export interface MenuPositionerProps extends ComponentPropsStrictChildren {}
  export interface MenuRootProps extends ComponentPropsStrictChildren {}
  export interface MenuCheckboxItemProps extends ComponentPropsStrictChildren {}
  export interface MenuRadioItemGroupProps
    extends ComponentPropsStrictChildren {}
  export interface MenuRadioItemProps extends ComponentPropsLenientChildren {}

  // Dialog components
  export interface DialogCloseTriggerProps
    extends ComponentPropsStrictChildren {}
  export interface DialogContentProps extends ComponentPropsStrictChildren {}
  export interface DialogBackdropProps extends ComponentPropsStrictChildren {}
  export interface DialogPositionerProps extends ComponentPropsStrictChildren {}
  export interface DialogTitleProps extends ComponentPropsLenientChildren {}
  export interface DialogTriggerProps extends ComponentPropsStrictChildren {}

  // Checkbox components
  export interface CheckboxLabelProps extends ComponentPropsLenientChildren {}
  export interface CheckboxControlProps extends ComponentPropsStrictChildren {}

  // Radio components
  export interface RadioGroupItemProps extends ComponentPropsStrictChildren {}
  export interface RadioGroupItemControlProps
    extends ComponentPropsStrictChildren {}
  export interface RadioGroupItemTextProps
    extends ComponentPropsLenientChildren {}

  // Pagination components
  export interface PaginationPrevTriggerProps
    extends ComponentPropsStrictChildren {}
  export interface PaginationNextTriggerProps
    extends ComponentPropsStrictChildren {}
  export interface PaginationItemsProps extends ComponentPropsStrictChildren {}

  // Tabs components
  export interface TabsTriggerProps extends ComponentPropsLenientChildren {}
  export interface TabsContentProps extends ComponentPropsLenientChildren {}
  export interface TabsListProps extends ComponentPropsStrictChildren {}

  // Field components
  export interface FieldLabelProps extends ComponentPropsLenientChildren {}
  export interface FieldRootProps extends ComponentPropsLenientChildren {}
  export interface FieldHelperTextProps extends ComponentPropsLenientChildren {}

  // Native Select components
  export interface NativeSelectFieldProps
    extends ComponentPropsLenientChildren {}

  // Common components
  export interface ButtonProps extends ComponentPropsStrictChildren {}
  export interface IconButtonProps extends ComponentPropsStrictChildren {}
  export interface BoxProps extends ComponentPropsStrictChildren {}
  export interface LinkProps extends ComponentPropsStrictChildren {}
  export interface TextProps extends ComponentPropsStrictChildren {}
  export interface CardProps extends ComponentPropsStrictChildren {}
  export interface CardBodyProps extends ComponentPropsStrictChildren {}
  export interface TextareaProps extends ComponentPropsStrictChildren {}
  export interface NumberInputInputProps
    extends ComponentPropsLenientChildren {}
}
