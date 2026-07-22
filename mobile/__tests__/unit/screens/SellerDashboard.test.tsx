import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SellerDashboard from '../../../src/screens/SellerDashboard';
import { getDashboardStats, getSellerStores } from '../../../src/services/stores';

jest.mock('../../../src/services/stores', () => ({ getDashboardStats: jest.fn(), getSellerStores: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({ navigate: jest.fn() })),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));

describe('SellerDashboard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders approved seller data and statistics', async () => {
    (getSellerStores as jest.Mock).mockResolvedValue([{
      id: 'store-1', name: 'Test Farm', description: 'Farm description', category: 'HONEY',
      isVerified: true, whatsappNumber: '966501234567', _count: { products: 3 },
    }]);
    (getDashboardStats as jest.Mock).mockResolvedValue({ totalStores: 1, totalProducts: 3, totalFavorites: 4, verifiedStores: 1 });
    const screen = render(<SellerDashboard />);
    await waitFor(() => expect(screen.getByText('Test Farm')).toBeTruthy());
    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0);
  });

  it('shows a loading indicator while seller data is pending', () => {
    (getSellerStores as jest.Mock).mockReturnValue(new Promise(() => undefined));
    const screen = render(<SellerDashboard />);
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });
});
