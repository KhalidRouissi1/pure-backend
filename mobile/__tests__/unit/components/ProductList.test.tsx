import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import ProductList from '../../../src/components/ProductList';
import { getSellerProducts } from '../../../src/services/products';

jest.mock('../../../src/services/products', () => ({ getSellerProducts: jest.fn(), deleteProduct: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({ navigate: jest.fn() })),
  useRoute: jest.fn(() => ({ params: {} })),
}));

const product = {
  id: 'product-1', name: 'Local Honey', description: 'Raw local honey', price: '45',
  imageUrls: ['https://example.com/honey.jpg'], category: 'HONEY', storeId: 'store-1',
  store: { id: 'store-1', name: 'Farm', whatsappNumber: '966501234567' },
  createdAt: '2026-01-01T00:00:00Z', _count: { favorites: 2 },
};

describe('ProductList', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders products returned by the typed service', async () => {
    (getSellerProducts as jest.Mock).mockResolvedValue([product]);
    const screen = render(<ThemeProvider><ProductList storeId="store-1" /></ThemeProvider>);
    await waitFor(() => expect(screen.getByText('Local Honey')).toBeTruthy());
    expect(screen.getByText('SAR 45.00')).toBeTruthy();
  });

  it('shows an explicit loading state', () => {
    (getSellerProducts as jest.Mock).mockReturnValue(new Promise(() => undefined));
    const screen = render(<ThemeProvider><ProductList storeId="store-1" /></ThemeProvider>);
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });
});
