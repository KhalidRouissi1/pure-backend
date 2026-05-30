import { Linking } from 'react-native';
import { Product, Store } from '../types';

export const openWhatsApp = (product: Product, store: Store) => {
  const message = encodeURIComponent(
    `Hello, I'm interested in "${product.name}" for SAR ${product.price}.`,
  );
  const whatsappUrl = `https://wa.me/${store.whatsappNumber}?text=${message}`;
  
  Linking.openURL(whatsappUrl).catch((err) => {
    console.error('Error opening WhatsApp:', err);
  });
};
