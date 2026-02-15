/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@chakra-ui/react';

declare module '@chakra-ui/react' {
  export interface ComponentProps {
    asChild?: boolean; // Enables composition pattern
    children?: JSX.Element | JSX.Element[]; // Allows child elements
    as?: any; // Polymorphic component prop
    [key: string]: any; // Catch-all for any other props
  }

  // Menu components
  export interface MenuTriggerProps extends ComponentProps {}
  export interface MenuContentProps extends ComponentProps {}
  export interface MenuItemProps extends ComponentProps {}
  export interface MenuPositionerProps extends ComponentProps {}
  export interface MenuRootProps extends ComponentProps {}
  export interface MenuCheckboxItemProps extends ComponentProps {}
  export interface MenuRadioItemGroupProps extends ComponentProps {}
  export interface MenuRadioItemProps extends ComponentProps {}

  // Dialog components
  export interface DialogCloseTriggerProps extends ComponentProps {}
  export interface DialogContentProps extends ComponentProps {}
  export interface DialogBackdropProps extends ComponentProps {}
  export interface DialogPositionerProps extends ComponentProps {}
  export interface DialogTitleProps extends ComponentProps {}
  export interface DialogTriggerProps extends ComponentProps {}

  // Checkbox components
  export interface CheckboxLabelProps extends ComponentProps {}
  export interface CheckboxControlProps extends ComponentProps {}

  // Radio components
  export interface RadioGroupItemProps extends ComponentProps {}
  export interface RadioGroupItemControlProps extends ComponentProps {}
  export interface RadioGroupItemTextProps extends ComponentProps {}

  // Pagination components
  export interface PaginationPrevTriggerProps extends ComponentProps {}
  export interface PaginationNextTriggerProps extends ComponentProps {}
  export interface PaginationItemsProps extends ComponentProps {}

  // Tabs components
  export interface TabsTriggerProps extends ComponentProps {}
  export interface TabsContentProps extends ComponentProps {}
  export interface TabsListProps extends ComponentProps {}

  // Field components
  export interface FieldLabelProps extends ComponentProps {}
  export interface FieldRootProps extends ComponentProps {}
  export interface FieldHelperTextProps extends ComponentProps {}

  // Common components
  export interface ButtonProps extends ComponentProps {}
  export interface IconButtonProps extends ComponentProps {}
  export interface BoxProps extends ComponentProps {}
  export interface LinkProps extends ComponentProps {}
  export interface TextProps extends ComponentProps {}
  export interface CardProps extends ComponentProps {}
  export interface CardBodyProps extends ComponentProps {}
  export interface TextareaProps extends ComponentProps {}
}
