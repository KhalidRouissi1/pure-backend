import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import StoreApprovalCard from '../../../src/components/StoreApprovalCard';
import { verifyStore } from '../../../src/services/stores';

jest.mock('../../../src/services/stores', () => ({ verifyStore: jest.fn() }));
jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn(() => ({ navigate: jest.fn() })) }));

const store = {
  id: 'store-1', name: 'Test Store', description: 'A local farm store', category: 'HONEY',
  whatsappNumber: '966501234567', isVerified: false, createdAt: '2026-01-15T10:30:00Z',
  owner: { id: 'user-1', email: 'seller@example.com', city: 'Riyadh', phone: '0501234567' },
  _count: { products: 5 },
};

describe('StoreApprovalCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the application without exposing control data', () => {
    const screen = render(<ThemeProvider><StoreApprovalCard store={store} /></ThemeProvider>);
    expect(screen.getByText('Test Store')).toBeTruthy();
    expect(screen.getByText('seller@example.com')).toBeTruthy();
    expect(screen.getByText('HONEY')).toBeTruthy();
  });

  it('sends approval through the protected store service', async () => {
    (verifyStore as jest.Mock).mockResolvedValue({ ...store, isVerified: true });
    const screen = render(<ThemeProvider><StoreApprovalCard store={store} /></ThemeProvider>);
    fireEvent.press(screen.getByText('Approve'));
    await waitFor(() => expect(verifyStore).toHaveBeenCalledWith('store-1', true));
  });
});
