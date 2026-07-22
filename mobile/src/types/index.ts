export enum Role {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  USER = 'USER',
}

export enum Category {
  FRUITS_VEGETABLES = 'FRUITS_VEGETABLES',
  HONEY = 'HONEY',
  DAIRY = 'DAIRY',
  HERBS = 'HERBS',
  NATURAL_BEAUTY = 'NATURAL_BEAUTY',
}

export const CategoryLabels: Record<Category, string> = {
  FRUITS_VEGETABLES: 'Fruits & Vegetables',
  HONEY: 'Honey',
  DAIRY: 'Dairy Products',
  HERBS: 'Herbs',
  NATURAL_BEAUTY: 'Natural Beauty Products',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: Role;
  city?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  logoUrl?: string;
  galleryUrls?: string[];
  description: string;
  addressText?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  category: Category;
  instagramHandle?: string;
  whatsappNumber: string;
  isVerified: boolean;
  certificationUrl?: string;
  certificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  certificationNotes?: string;
  trustedBadge?: boolean;
  averageRating?: number;
  reviewCount?: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  inventoryQuantity: number;
  isActive: boolean;
  imageUrls: string[];
  category: Category;
  originAddressText?: string;
  originCity?: string;
  originLatitude?: number;
  originLongitude?: number;
  storeId: string;
  store: {
    id: string;
    name: string;
    logoUrl?: string;
    addressText?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    category: Category;
    whatsappNumber: string;
    instagramHandle?: string;
    trustedBadge?: boolean;
    isVerified?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
  averageRating?: number;
  reviewCount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  city: string;
  addressText?: string;
  line1: string;
  line2?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface Order {
  id: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'CONFIRMED';
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  deliveryEtaMinutes: number;
  deliveryAddress: Address;
  items: Array<{
    id: string;
    productName: string;
    storeName: string;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
  }>;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };
}

export interface DiscoveryGroup {
  groupName: string;
  groupLabel: string;
  totalProducts: number;
  products: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<{ items: T[]; pagination: PaginationMeta }> {}
