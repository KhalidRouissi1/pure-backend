import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ProductDetail from '../../../src/screens/ProductDetail';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'A wonderful test product',
  price: '99.99',
  imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  category: 'FOOD',
  storeId: 'store-1',
  store: {
    id: 'store-1',
    name: 'Test Store',
    logoUrl: 'https://example.com/logo.jpg',
    description: 'Great store',
    whatsappNumber: '966501234567',
    instagramHandle: 'test_store',
    isVerified: true,
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isFavorited: false,
};

jest.mock('../../../src/services/products', () => ({
  getProductDetail: jest.fn(() => Promise.resolve({ data: mockProduct })),
  toggleFavorite: jest.fn(() => Promise.resolve({ success: true })),
}));

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

describe('ProductDetail Component', () => {
  it('should render product details', async () => {
    const { getByText, getAllByText } = render(
      <ProductDetail route={{ params: { productId: '1' } }} />,
    );

    await waitFor(() => {
      expect(getAllByText('Test Product').length).toBeGreaterThan(0);
      expect(getByText('A wonderful test product')).toBeTruthy();
      expect(getByText('99.99 SAR')).toBeTruthy();
      expect(getByText('Test Store')).toBeTruthy();
    });
  });

  it('should render product images', async () => {
    const { getByTestId } = render(
      <ProductDetail route={{ params: { productId: '1' } }} />,
    );

    await waitFor(() => {
      const imageGallery = getByTestId('image-gallery');
      expect(imageGallery).toBeTruthy();
    });
  });

  it('should render Order on WhatsApp button', async () => {
    const { getByText, getByTestId } = render(
      <ProductDetail route={{ params: { productId: '1' } }} />,
    );

    await waitFor(() => {
      const whatsappButton = getByTestId('whatsapp-button');
      expect(whatsappButton).toBeTruthy();
      expect(getByText('Order on WhatsApp')).toBeTruthy();
    });
  });

  it('should open WhatsApp when button is pressed', async () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);
    const { getByTestId } = render(
      <ProductDetail route={{ params: { productId: '1' } }} />,
    );

    await waitFor(() => {
      fireEvent.press(getByTestId('whatsapp-button'));
      expect(openURLSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/966501234567?text='),
      );
    });
  });

  it('should toggle favorite when favorite button is pressed', async () => {
    const { toggleFavorite } = require('../../../src/services/products');
    const { getByTestId } = render(
      <ProductDetail route={{ params: { productId: '1' } }} />,
    );

    await waitFor(async () => {
      const favoriteButton = getByTestId('favorite-button');
      fireEvent.press(favoriteButton);

      expect(toggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  it('should show verified badge for verified stores', async () => {
    const { getByTestId } = render(
      <ProductDetail route={{ params: { productId: '1' } }} />,
    );

    await waitFor(() => {
      const verifiedBadge = getByTestId('verified-badge');
      expect(verifiedBadge).toBeTruthy();
    });
  });

  it('should not show verified badge for unverified stores', async () => {
    const unverifiedProduct = {
      ...mockProduct,
      store: { ...mockProduct.store, isVerified: false },
    };
    const { queryByTestId } = render(
      <ProductDetail route={{ params: { productId: '1', product: unverifiedProduct } }} />,
    );

    await waitFor(() => {
      const verifiedBadge = queryByTestId('verified-badge');
      expect(verifiedBadge).toBeNull();
    });
  });

  it('should navigate back on back press', () => {
    const { getByTestId } = render(
      <ProductDetail route={{ params: { productId: '1' } }} />,
    );

    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });
});
