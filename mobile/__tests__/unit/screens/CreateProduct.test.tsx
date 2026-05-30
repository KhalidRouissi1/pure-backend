import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import CreateProduct from '../../../src/screens/CreateProduct';

jest.mock('../../../src/services/images', () => ({
  uploadImagesToCloudinary: jest.fn(),
}));

jest.mock('../../../src/services/products', () => ({
  createProduct: jest.fn(),
}));

jest.mock('../../../src/services/stores', () => ({
  getSellerStores: jest.fn(() =>
    Promise.resolve([
      {
        id: 'store-1',
        name: 'Test Store',
        city: 'Riyadh',
        addressText: 'Olaya district, Riyadh',
        latitude: 24.7136,
        longitude: 46.6753,
      },
    ]),
  ),
}));

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { storeId: 'store-1' },
  }),
}));

const mockCloudinaryResponse = [
  {
    url: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
    publicId: 'test_123',
  },
];

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('CreateProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<CreateProduct />);

    expect(getByPlaceholderText('Product Name')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
    expect(getByPlaceholderText('Price (SAR)')).toBeTruthy();
    expect(getByText(/Select Category/)).toBeTruthy();
    expect(getByText('Upload Images')).toBeTruthy();
  });

  it('shows validation errors when form is submitted empty', async () => {
    const { getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    fireEvent.press(getByTestId('submit-product-button'));

    await waitFor(() => {
      expect(getByText('Product name is required')).toBeTruthy();
      expect(getByText('Description is required')).toBeTruthy();
      expect(getByText('Price is required')).toBeTruthy();
    });
  });

  it('opens image picker when upload button is pressed', () => {
    const { getByText } = renderWithProviders(<CreateProduct />);

    fireEvent.press(getByText('Upload Images'));

    // Image picker should be called
    const { launchImageLibraryAsync } = require('expo-image-picker');
    expect(launchImageLibraryAsync).toHaveBeenCalled();
  });

  it('displays selected images as previews', async () => {
    const { uploadImagesToCloudinary } = require('../../../src/services/images');
    uploadImagesToCloudinary.mockResolvedValue(mockCloudinaryResponse);

    const { getByTestId, getByText } = renderWithProviders(<CreateProduct />);

    // Simulate image selection
    fireEvent.press(getByText('Upload Images'));

    await waitFor(() => {
      expect(getByTestId('image-preview-0')).toBeTruthy();
    });
  });

  it('submits form successfully with valid data', async () => {
    const { uploadImagesToCloudinary } = require('../../../src/services/images');
    const { createProduct } = require('../../../src/services/products');

    uploadImagesToCloudinary.mockResolvedValue(mockCloudinaryResponse.map((img) => img.url));
    createProduct.mockResolvedValue({ id: 'product-1' });

    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    await waitFor(() => {
      expect(getByText('Test Store - Riyadh')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Product Name'), 'Test Product');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test description');
    fireEvent.changeText(getByPlaceholderText('Price (SAR)'), '45');
    fireEvent.press(getByText('Upload Images'));

    await waitFor(() => {
      expect(getByTestId('image-preview-0')).toBeTruthy();
    });

    fireEvent.press(getByTestId('submit-product-button'));

    await waitFor(() => {
      expect(createProduct).toHaveBeenCalledWith({
        name: 'Test Product',
        description: 'Test description',
        price: 45,
        category: 'FRUITS_VEGETABLES',
        imageUrls: mockCloudinaryResponse.map(img => img.url),
        storeId: 'store-1',
        originAddressText: 'Olaya district, Riyadh',
        originCity: 'Riyadh',
        originLatitude: 24.7136,
        originLongitude: 46.6753,
      });
    });
  });

  it('shows loading state while uploading images', async () => {
    const { uploadImagesToCloudinary } = require('../../../src/services/images');
    uploadImagesToCloudinary.mockImplementation(() => new Promise(() => {}));

    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    await waitFor(() => {
      expect(getByText('Test Store - Riyadh')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Product Name'), 'Test Product');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test description');
    fireEvent.changeText(getByPlaceholderText('Price (SAR)'), '45');
    fireEvent.press(getByText('Upload Images'));

    await waitFor(() => {
      expect(getByTestId('image-preview-0')).toBeTruthy();
    });

    fireEvent.press(getByTestId('submit-product-button'));

    await waitFor(() => {
      expect(getByTestId('uploading-indicator')).toBeTruthy();
    });
  });

  it('shows loading state while creating product', async () => {
    const { uploadImagesToCloudinary } = require('../../../src/services/images');
    const { createProduct } = require('../../../src/services/products');
    uploadImagesToCloudinary.mockResolvedValue(mockCloudinaryResponse.map((img) => img.url));
    createProduct.mockImplementation(() => new Promise(() => {}));

    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    await waitFor(() => {
      expect(getByText('Test Store - Riyadh')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Product Name'), 'Test Product');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test description');
    fireEvent.changeText(getByPlaceholderText('Price (SAR)'), '45');
    fireEvent.press(getByText('Upload Images'));

    fireEvent.press(getByTestId('submit-product-button'));

    expect(getByTestId('submitting-indicator')).toBeTruthy();
  });

  it('shows an alert when image upload fails during submit', async () => {
    const { uploadImagesToCloudinary } = require('../../../src/services/images');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    uploadImagesToCloudinary.mockRejectedValue(new Error('Upload failed'));

    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    await waitFor(() => {
      expect(getByText('Test Store - Riyadh')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Product Name'), 'Test Product');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test description');
    fireEvent.changeText(getByPlaceholderText('Price (SAR)'), '45');
    fireEvent.press(getByText('Upload Images'));

    await waitFor(() => {
      expect(getByTestId('image-preview-0')).toBeTruthy();
    });
    fireEvent.press(getByTestId('submit-product-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('error', 'Failed to create product');
    });
  });

  it('shows an alert when product creation fails', async () => {
    const { uploadImagesToCloudinary } = require('../../../src/services/images');
    const { createProduct } = require('../../../src/services/products');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    uploadImagesToCloudinary.mockResolvedValue(mockCloudinaryResponse.map((img) => img.url));
    createProduct.mockRejectedValue(new Error('Creation failed'));

    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    await waitFor(() => {
      expect(getByText('Test Store - Riyadh')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Product Name'), 'Test Product');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test description');
    fireEvent.changeText(getByPlaceholderText('Price (SAR)'), '45');
    fireEvent.press(getByText('Upload Images'));

    await waitFor(() => {
      expect(getByTestId('image-preview-0')).toBeTruthy();
    });

    fireEvent.press(getByTestId('submit-product-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('error', 'Failed to create product');
    });
  });

  it('removes image when close button is pressed', async () => {
    const { launchImageLibraryAsync } = require('expo-image-picker');
    launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        { uri: 'file://example-1.jpg' },
        { uri: 'file://example-2.jpg' },
      ],
    });

    const { getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    fireEvent.press(getByText('Upload Images'));

    await waitFor(() => {
      expect(getByTestId('image-preview-0')).toBeTruthy();
      expect(getByTestId('image-preview-1')).toBeTruthy();
    });

    fireEvent.press(getByTestId('remove-image-0'));

    await waitFor(() => {
      expect(getByTestId('image-preview-0')).toBeTruthy();
      expect(() => getByTestId('image-preview-1')).toThrow();
    });
  });

  it('navigates back on success', async () => {
    const { uploadImagesToCloudinary } = require('../../../src/services/images');
    const { createProduct } = require('../../../src/services/products');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_, __, buttons) => {
      buttons?.[0]?.onPress?.();
    });

    uploadImagesToCloudinary.mockResolvedValue(mockCloudinaryResponse.map((img) => img.url));
    createProduct.mockResolvedValue({ id: 'product-1' });

    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    await waitFor(() => {
      expect(getByText('Test Store - Riyadh')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Product Name'), 'Test Product');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Test description');
    fireEvent.changeText(getByPlaceholderText('Price (SAR)'), '45');
    fireEvent.press(getByText('Upload Images'));

    await waitFor(() => {
      expect(getByTestId('image-preview-0')).toBeTruthy();
    });

    fireEvent.press(getByTestId('submit-product-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('success', 'Product created successfully', expect.any(Array));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('validates price format', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    await waitFor(() => {
      expect(getByText('Test Store - Riyadh')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Price (SAR)'), 'invalid');
    fireEvent.press(getByTestId('submit-product-button'));

    await waitFor(() => {
      expect(getByText('Please enter a valid price')).toBeTruthy();
    });
  });

  it('validates minimum price', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    await waitFor(() => {
      expect(getByText('Test Store - Riyadh')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Price (SAR)'), '0');
    fireEvent.press(getByTestId('submit-product-button'));

    await waitFor(() => {
      expect(getByText('Please enter a valid price')).toBeTruthy();
    });
  });

  it('validates maximum images (5 max)', async () => {
    const { launchImageLibraryAsync } = require('expo-image-picker');
    launchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: Array(6).fill({
        uri: 'file://example.jpg',
      }),
    });

    const { getByText, getByTestId } = renderWithProviders(<CreateProduct />);

    fireEvent.press(getByText('Upload Images'));

    await waitFor(() => {
      expect(getByTestId('image-preview-4')).toBeTruthy();
    });

    expect(() => getByTestId('image-preview-4')).not.toThrow();
    expect(() => getByTestId('image-preview-5')).toThrow();
  });
});
