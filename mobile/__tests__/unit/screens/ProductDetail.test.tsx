import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ProductDetail from '../../../src/screens/ProductDetail';

jest.mock('../../../src/services/products', () => ({ getProductDetail: jest.fn(), toggleFavorite: jest.fn() }));
jest.mock('../../../src/services/cart', () => ({ addToCart: jest.fn() }));
jest.mock('../../../src/hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }));

const product = {
  id: 'product-1', name: 'Test Product', description: 'A wonderful local product', price: 99.99,
  imageUrls: ['https://example.com/image.jpg'], category: 'HONEY', storeId: 'store-1',
  store: { id: 'store-1', name: 'Test Store', whatsappNumber: '966501234567', isVerified: true },
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', isFavorited: false,
};

describe('ProductDetail', () => {
  it('renders server product data and image', () => {
    const screen = render(<ProductDetail route={{ params: { productId: product.id, product } }} navigation={{ navigate: jest.fn() }} />);
    expect(screen.getAllByText('Test Product').length).toBeGreaterThan(0);
    expect(screen.getByText('A wonderful local product')).toBeTruthy();
    expect(screen.getByTestId('image-gallery')).toBeTruthy();
  });

  it('opens the seller WhatsApp contact', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const screen = render(<ProductDetail route={{ params: { productId: product.id, product } }} navigation={{ navigate: jest.fn() }} />);
    fireEvent.press(screen.getByTestId('whatsapp-button'));
    expect(openURL).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/966501234567'));
  });
});
