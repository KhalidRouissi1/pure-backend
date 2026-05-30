import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import AdminDashboard from '../../../src/screens/AdminDashboard';

jest.mock('../../../src/services/admin', () => ({
  getAdminDashboardFull: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (cb: () => void) => {
    const React = require('react');
    React.useEffect(() => cb(), [cb]);
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

const mockDashboardData = {
  stats: {
    totalUsers: 100,
    totalSellers: 25,
    totalStores: 30,
    verifiedStores: 20,
    pendingStores: 10,
    totalProducts: 500,
    totalOrders: 200,
    totalOrdersPending: 15,
    totalOrdersConfirmed: 40,
    totalOrdersPreparing: 20,
    totalOrdersOutForDelivery: 10,
    totalOrdersDelivered: 100,
    totalOrdersCancelled: 15,
    totalGmv: 50000,
    avgOrderValue: 250,
    totalDeliveryFees: 3000,
    pendingReviews: 5,
    pendingCertifications: 3,
    trustedBadgeCount: 12,
    newUsers7d: 30,
    newStores7d: 5,
    newProducts7d: 50,
    newOrders7d: 40,
    avgProductsPerStore: 16.7,
  },
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const { UNSAFE_queryByType } = renderWithProviders(<AdminDashboard />);
    expect(UNSAFE_queryByType(require('react-native').ActivityIndicator)).toBeTruthy();
  });

  it('renders dashboard with stats after loading', async () => {
    const { getAdminDashboardFull } = require('../../../src/services/admin');
    getAdminDashboardFull.mockResolvedValue(mockDashboardData);

    const { getByText, getAllByText } = renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(getAllByText('100').length).toBeGreaterThan(0);
      expect(getByText('30')).toBeTruthy();
      expect(getByText('500')).toBeTruthy();
      expect(getByText('200')).toBeTruthy();
    });
  });

  it('shows zero stats when API returns no data', async () => {
    const { getAdminDashboardFull } = require('../../../src/services/admin');
    getAdminDashboardFull.mockResolvedValue({});

    const { getAllByText } = renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(getAllByText('0').length).toBeGreaterThan(0);
    });
  });

  it('shows error state when API fails', async () => {
    const { getAdminDashboardFull } = require('../../../src/services/admin');
    getAdminDashboardFull.mockRejectedValue(new Error('Network error'));

    const { getByText } = renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(getByText('common:error')).toBeTruthy();
    });
  });

  it('renders management navigation cards', async () => {
    const { getAdminDashboardFull } = require('../../../src/services/admin');
    getAdminDashboardFull.mockResolvedValue(mockDashboardData);

    const { getByText } = renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(getByText('admin:all_stores')).toBeTruthy();
      expect(getByText('admin:all_users')).toBeTruthy();
      expect(getByText('admin:approvals')).toBeTruthy();
      expect(getByText('admin:all_orders')).toBeTruthy();
    });
  });
});
