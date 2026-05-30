import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProductCard from '../../../src/components/ProductCard';
import { Category, Product } from '../../../src/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'Test description',
  price: '99.99',
  imageUrls: ['https://example.com/image.jpg'],
  category: Category.FRUITS_VEGETABLES,
  storeId: 'store-1',
  store: {
    id: 'store-1',
    name: 'Test Store',
    category: Category.FRUITS_VEGETABLES,
    whatsappNumber: '966501234567',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isFavorited: false,
};

describe('ProductCard Component', () => {
  it('should render product correctly', () => {
    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        onPress={() => {}}
        onFavoriteToggle={() => {}}
      />,
    );

    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('SAR 99.99')).toBeTruthy();
  });

  it('should display product image', () => {
    const { getByTestId } = render(
      <ProductCard
        product={mockProduct}
        onPress={() => {}}
        onFavoriteToggle={() => {}}
      />,
    );

    const image = getByTestId('product-image');
    expect(image).toBeTruthy();
  });

  it('should call onPress when card is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <ProductCard
        product={mockProduct}
        onPress={mockOnPress}
        onFavoriteToggle={() => {}}
      />,
    );

    fireEvent.press(getByTestId('product-card-1'));
    expect(mockOnPress).toHaveBeenCalledWith(mockProduct);
  });

  it('should toggle favorite when favorite button is pressed', async () => {
    const mockOnFavoriteToggle = jest.fn();
    const { getByTestId } = render(
      <ProductCard
        product={mockProduct}
        onPress={() => {}}
        onFavoriteToggle={mockOnFavoriteToggle}
      />,
    );

    const favoriteButton = getByTestId('favorite-button-1');
    fireEvent.press(favoriteButton);

    await waitFor(() => {
      expect(mockOnFavoriteToggle).toHaveBeenCalledWith(mockProduct.id, !mockProduct.isFavorited);
    });
  });

  it('should display filled heart when favorited', () => {
    const favoritedProduct = { ...mockProduct, isFavorited: true };
    const { getByTestId } = render(
      <ProductCard
        product={favoritedProduct}
        onPress={() => {}}
        onFavoriteToggle={() => {}}
      />,
    );

    const heartIcon = getByTestId('heart-icon');
    expect(heartIcon).toBeTruthy();
  });

  it('should display outline heart when not favorited', () => {
    const { getByTestId } = render(
      <ProductCard
        product={mockProduct}
        onPress={() => {}}
        onFavoriteToggle={() => {}}
      />,
    );

    const heartIcon = getByTestId('heart-icon');
    expect(heartIcon).toBeTruthy();
  });
});
