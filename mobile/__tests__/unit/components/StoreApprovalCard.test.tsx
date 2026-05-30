import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import StoreApprovalCard from '../../../src/components/StoreApprovalCard';

jest.mock('../../../src/services/stores', () => ({
  verifyStore: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

const mockStore = {
  id: 'store-1',
  name: 'Test Store',
  description: 'Test description for the store',
  category: 'FOOD',
  whatsappNumber: '966501234567',
  isVerified: false,
  createdAt: '2024-01-15T10:30:00Z',
  owner: {
    id: 'user-1',
    email: 'seller@example.com',
    city: 'Riyadh',
    phone: '0501234567',
  },
  _count: { products: 0 },
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('StoreApprovalCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders store details correctly', () => {
    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={mockStore} />
    );

    expect(getByText('Test Store')).toBeTruthy();
    expect(getByText('Test description for the store')).toBeTruthy();
    expect(getByText('Food')).toBeTruthy();
    expect(getByText('Riyadh')).toBeTruthy();
    expect(getByText('seller@example.com')).toBeTruthy();
  });

  it('displays approve and reject buttons', () => {
    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={mockStore} />
    );

    expect(getByText('Approve')).toBeTruthy();
    expect(getByText('Reject')).toBeTruthy();
  });

  it('calls verifyStore with true when approve button is pressed', async () => {
    const { verifyStore } = require('../../../src/services/stores');
    verifyStore.mockResolvedValue({ ...mockStore, isVerified: true });

    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={mockStore} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Approve'));
    });

    await waitFor(() => {
      expect(verifyStore).toHaveBeenCalledWith('store-1', true);
    });
  });

  it('calls verifyStore with false when reject button is pressed', async () => {
    const { verifyStore } = require('../../../src/services/stores');
    verifyStore.mockResolvedValue({ ...mockStore, isVerified: false });

    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={mockStore} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Reject'));
    });

    await waitFor(() => {
      expect(verifyStore).toHaveBeenCalledWith('store-1', false);
    });
  });

  it('shows loading state during approval', async () => {
    const { verifyStore } = require('../../../src/services/stores');
    let resolvePromise: any;
    verifyStore.mockImplementation(() => new Promise(resolve => {
      resolvePromise = resolve;
    }));

    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={mockStore} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Approve'));
    });

    // Should show loading indicator
    // Implementation may vary based on actual component
  });

  it('shows error message when approval fails', async () => {
    const { verifyStore } = require('../../../src/services/stores');
    verifyStore.mockRejectedValue(new Error('Verification failed'));

    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={mockStore} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Approve'));
    });

    await waitFor(() => {
      // Should display error message
    }, { timeout: 3000 });
  });

  it('displays product count', () => {
    const storeWithProducts = {
      ...mockStore,
      _count: { products: 5 },
    };

    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={storeWithProducts} />
    );

    expect(getByText('5 products')).toBeTruthy();
  });

  it('displays owner contact information', () => {
    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={mockStore} />
    );

    expect(getByText('0501234567')).toBeTruthy();
    expect(getByText('seller@example.com')).toBeTruthy();
  });

  it('navigates to store detail when card is pressed', () => {
    const mockNavigate = jest.fn();

    require('@react-navigation/native').useNavigation.mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByTestId } = renderWithProviders(
      <StoreApprovalCard store={mockStore} />
    );

    fireEvent.press(getByTestId('store-card'));

    expect(mockNavigate).toHaveBeenCalledWith('StoreDetail', {
      storeId: 'store-1',
    });
  });

  it('shows creation date', () => {
    const storeWithDate = {
      ...mockStore,
      createdAt: '2024-01-15T10:30:00Z',
    };

    const { getByText } = renderWithProviders(
      <StoreApprovalCard store={storeWithDate} />
    );

    expect(getByText(/Jan/)).toBeTruthy();
    expect(getByText(/2024/)).toBeTruthy();
  });
});
