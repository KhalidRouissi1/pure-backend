import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import FavoritesList from '../../../src/screens/FavoritesList';
import { getUserFavorites } from '../../../src/services/products';

jest.mock('../../../src/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
jest.mock('../../../src/services/products', () => ({ getUserFavorites: jest.fn(), toggleFavorite: jest.fn() }));

describe('FavoritesList', () => {
  it('renders the normalized favorites response', async () => {
    (getUserFavorites as jest.Mock).mockResolvedValue([{
      id: 'favorite-1', productId: 'product-1', createdAt: '2026-01-01T00:00:00Z',
      product: { id: 'product-1', name: 'Favorite Honey', price: 100, imageUrls: [], category: 'HONEY', store: { id: 'store-1', name: 'Farm' } },
    }]);
    const screen = render(<FavoritesList navigation={{ navigate: jest.fn() }} />);
    await waitFor(() => expect(screen.getByText('Favorite Honey')).toBeTruthy());
  });

  it('renders an empty state', async () => {
    (getUserFavorites as jest.Mock).mockResolvedValue([]);
    const screen = render(<FavoritesList navigation={{ navigate: jest.fn() }} />);
    await waitFor(() => expect(screen.getByText('No favorites yet')).toBeTruthy());
  });
});
