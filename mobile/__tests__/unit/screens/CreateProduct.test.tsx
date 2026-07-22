import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import CreateProduct from '../../../src/screens/CreateProduct';

jest.mock('../../../src/services/images', () => ({ uploadImagesToCloudinary: jest.fn() }));
jest.mock('../../../src/services/products', () => ({ createProduct: jest.fn() }));
jest.mock('../../../src/services/stores', () => ({
  getSellerStores: jest.fn(async () => [{ id: 'store-1', name: 'Farm', city: 'Riyadh' }]),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({ goBack: jest.fn() })),
  useRoute: jest.fn(() => ({ params: { storeId: 'store-1' } })),
}));

describe('CreateProduct', () => {
  it('renders the validated product form', () => {
    const screen = render(<ThemeProvider><CreateProduct /></ThemeProvider>);
    expect(screen.getByPlaceholderText('Product Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Description')).toBeTruthy();
    expect(screen.getByPlaceholderText('Price (SAR)')).toBeTruthy();
  });

  it('reports required fields before making API calls', async () => {
    const screen = render(<ThemeProvider><CreateProduct /></ThemeProvider>);
    fireEvent.press(screen.getByTestId('submit-product-button'));
    await waitFor(() => expect(screen.getByText('Product name is required')).toBeTruthy());
    expect(screen.getByText('Description is required')).toBeTruthy();
  });
});
