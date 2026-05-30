import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from 'react-native-paper';
import ProductList from '../../../src/components/ProductList';

jest.mock('../../../src/services/products', () => ({
  getSellerProducts: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

const mockProducts = [
  {
    id: 'product-1',
    name: 'Arabic Coffee',
    description: 'Fresh coffee',
    price: 45,
    imageUrls: ['https://example.com/coffee.jpg'],
    category: 'COFFEE',
    createdAt: '2024-01-01T00:00:00Z',
    store: {
      id: 'store-1',
      name: 'Test Store',
      whatsappNumber: '966501234567',
    },
    _count: { favorites: 5 },
  },
  {
    id: 'product-2',
    name: 'Cardamom Coffee',
    description: 'Spiced coffee',
    price: 55,
    imageUrls: ['https://example.com/cardamom.jpg'],
    category: 'COFFEE',
    createdAt: '2024-01-02T00:00:00Z',
    store: {
      id: 'store-1',
      name: 'Test Store',
      whatsappNumber: '966501234567',
    },
    _count: { favorites: 8 },
  },
];

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ProductList', () => {
  const mockStoreId = 'store-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of products', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    await waitFor(() => {
      expect(getByText('Arabic Coffee')).toBeTruthy();
      expect(getByText('Cardamom Coffee')).toBeTruthy();
      expect(getByText('SAR 45')).toBeTruthy();
      expect(getByText('SAR 55')).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    const { getByTestId } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays error message when API call fails', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockRejectedValue(new Error('API Error'));

    const { getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    await waitFor(() => {
      expect(getByText('Failed to load products')).toBeTruthy();
    });
  });

  it('shows empty state when no products exist', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue([]);

    const { getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    await waitFor(() => {
      expect(getByText('No products yet')).toBeTruthy();
      expect(getByText('Add your first product to start selling')).toBeTruthy();
    });
  });

  it('navigates to product detail when product is pressed', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    const mockNavigate = jest.fn();

    require('@react-navigation/native').useNavigation.mockReturnValue({
      navigate: mockNavigate,
    });

    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Arabic Coffee'));
      expect(mockNavigate).toHaveBeenCalledWith('ProductDetail', {
        productId: 'product-1',
      });
    });
  });

  it('shows edit button when edit mode is enabled', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByTestId } = renderWithProviders(
      <ProductList storeId={mockStoreId} editMode={true} />
    );

    await waitFor(() => {
      expect(getByTestId('edit-button-product-1')).toBeTruthy();
      expect(getByTestId('edit-button-product-2')).toBeTruthy();
    });
  });

  it('navigates to edit product when edit button is pressed', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    const mockNavigate = jest.fn();

    require('@react-navigation/native').useNavigation.mockReturnValue({
      navigate: mockNavigate,
    });

    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByTestId } = renderWithProviders(
      <ProductList storeId={mockStoreId} editMode={true} />
    );

    await waitFor(() => {
      fireEvent.press(getByTestId('edit-button-product-1'));
      expect(mockNavigate).toHaveBeenCalledWith('EditProduct', {
        productId: 'product-1',
      });
    });
  });

  it('shows delete confirmation dialog when delete button is pressed', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByTestId, getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} editMode={true} />
    );

    await waitFor(() => {
      fireEvent.press(getByTestId('delete-button-product-1'));
      expect(getByText('Delete Product?')).toBeTruthy();
      expect(getByText('Are you sure you want to delete this product?')).toBeTruthy();
    });
  });

  it('deletes product when confirmed in dialog', async () => {
    const { getSellerProducts, deleteProduct } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue([mockProducts[1]]);
    deleteProduct.mockResolvedValue({});

    const { getByTestId, getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} editMode={true} />
    );

    await waitFor(() => {
      fireEvent.press(getByTestId('delete-button-product-1'));
    });

    await waitFor(() => {
      fireEvent.press(getByText('Delete'));
    });

    await waitFor(() => {
      expect(deleteProduct).toHaveBeenCalledWith('product-1');
    });
  });

  it('does not delete product when cancelled in dialog', async () => {
    const { getSellerProducts, deleteProduct } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByTestId, getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} editMode={true} />
    );

    await waitFor(() => {
      fireEvent.press(getByTestId('delete-button-product-1'));
    });

    await waitFor(() => {
      fireEvent.press(getByText('Cancel'));
    });

    expect(deleteProduct).not.toHaveBeenCalled();
  });

  it('shows product image', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByTestId } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    await waitFor(() => {
      expect(getByTestId('product-image-product-1')).toBeTruthy();
      expect(getByTestId('product-image-product-2')).toBeTruthy();
    });
  });

  it('displays product category', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    await waitFor(() => {
      expect(getByText('Coffee')).toBeTruthy();
    });
  });

  it('displays favorite count', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    await waitFor(() => {
      expect(getByText('5 favorites')).toBeTruthy();
      expect(getByText('8 favorites')).toBeTruthy();
    });
  });

  it('refreshes data when pull-to-refresh is triggered', async () => {
    const { getSellerProducts } = require('../../../src/services/products');
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByTestId } = renderWithProviders(
      <ProductList storeId={mockStoreId} />
    );

    await waitFor(() => {
      expect(getSellerProducts).toHaveBeenCalledTimes(1);
    });

    fireEvent(getByTestId('flatlist'), 'onRefresh');

    await waitFor(() => {
      expect(getSellerProducts).toHaveBeenCalledTimes(2);
    });
  });

  it('shows loading state during delete operation', async () => {
    const { getSellerProducts, deleteProduct } = require('../../../src/services/products');
    let deletePromiseResolve: (value: unknown) => void = () => {};
    deleteProduct.mockImplementation(() => new Promise(resolve => {
      deletePromiseResolve = resolve;
    }));
    getSellerProducts.mockResolvedValue(mockProducts);

    const { getByTestId, getByText } = renderWithProviders(
      <ProductList storeId={mockStoreId} editMode={true} />
    );

    await waitFor(() => {
      fireEvent.press(getByTestId('delete-button-product-1'));
    });

    await waitFor(() => {
      fireEvent.press(getByText('Delete'));
    });

    expect(getByTestId('deleting-indicator')).toBeTruthy();

    deletePromiseResolve({});
  });
});
