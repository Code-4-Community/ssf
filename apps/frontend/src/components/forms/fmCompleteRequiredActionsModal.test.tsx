import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import FmCompleteRequiredActionsModal from './fmCompleteRequiredActionsModal';
import {
  DonationDetails,
  DonationStatus,
  RecurrenceEnum,
  FoodType,
} from '../../types/types';

vi.mock('@api/apiClient', () => ({
  default: {
    updateDonationItemDetails: vi.fn(),
    bulkUpdateTrackingCostInfo: vi.fn(),
  },
}));

const donation: DonationDetails = {
  donation: {
    donationId: 1,
    dateDonated: '2026-01-01',
    status: DonationStatus.AVAILABLE,
    recurrence: RecurrenceEnum.NONE,
    recurrenceFreq: null,
    nextDonationDates: null,
    occurrencesRemaining: null,
  },
  associatedPendingOrders: [],
  relevantDonationItems: [
    {
      itemId: 1,
      itemName: 'Granola',
      foodType: FoodType.GRANOLA,
      allocatedQuantity: 10,
      detailsConfirmed: false,
      ozPerItem: 1,
      estimatedValue: 1,
      foodRescue: false,
    },
    {
      itemId: 2,
      itemName: 'Granola Bars',
      foodType: FoodType.GRANOLA_BARS,
      allocatedQuantity: 5,
      detailsConfirmed: false,
      ozPerItem: 1,
      estimatedValue: 1,
      foodRescue: false,
    },
  ],
};

const renderModal = () =>
  render(
    <ChakraProvider value={defaultSystem}>
      <FmCompleteRequiredActionsModal
        donation={donation}
        isOpen
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    </ChakraProvider>,
  );

describe('FmCompleteRequiredActionsModal item details submit gating', () => {
  it("disables Submit when a row's Oz. per item is 0", () => {
    renderModal();
    const ozInputs = screen.getAllByPlaceholderText('0.00');
    // First "0.00" input for each row is Oz. per item, second is Donation Value
    fireEvent.change(ozInputs[0], { target: { value: '0' } });

    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    }) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('enables Submit once every row has Oz. per item and Value >= 0.01', () => {
    renderModal();
    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    }) as HTMLButtonElement;
    // Prefilled with valid values (1) for both items already
    expect(submitButton.disabled).toBe(false);
  });
});
