import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';
import { useTranslation } from 'react-i18next';

import Login from '../screens/Login';
import Register from '../screens/Register';
import ForgotPassword from '../screens/ForgotPassword';
import ResetPassword from '../screens/ResetPassword';
import DiscoveryFeed from '../screens/DiscoveryFeed';
import FavoritesList from '../screens/FavoritesList';
import SellerDashboard from '../screens/SellerDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import CreateProduct from '../screens/CreateProduct';
import ProductDetail from '../screens/ProductDetail';
import StoreDetail from '../screens/StoreDetail';
import ProductList from '../screens/ProductList';
import EditProduct from '../screens/EditProduct';
import CreateStore from '../screens/CreateStore';
import StoreApproval from '../screens/StoreApproval';
import StoreManagement from '../screens/StoreManagement';
import UserManagement from '../screens/UserManagement';
import Profile from '../screens/Profile';
import Settings from '../screens/Settings';
import Cart from '../screens/Cart';
import Checkout from '../screens/Checkout';
import AddressBook from '../screens/AddressBook';
import Orders, { OrderDetail } from '../screens/Orders';
import Reviews from '../screens/Reviews';
import AdminOrders from '../screens/AdminOrders';
import LegalDocument from '../screens/LegalDocument';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="LegalDocument" component={LegalDocument} />
    </Stack.Navigator>
  );
}

function AppStack() {
  const { user } = useAuth();
  const isSeller = user?.role === Role.SELLER;
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ title: 'Product' }} />
      <Stack.Screen name="ProductList" component={ProductList} />
      <Stack.Screen name="StoreDetail" component={StoreDetail} options={{ title: 'Store' }} />
      <Stack.Screen name="Reviews" component={Reviews} />
      {!isAdmin && (
        <>
          <Stack.Screen name="Checkout" component={Checkout} />
          <Stack.Screen name="AddressBook" component={AddressBook} />
          <Stack.Screen name="Orders" component={Orders} />
          <Stack.Screen name="OrderDetail" component={OrderDetail} />
        </>
      )}
      <Stack.Screen name="CreateStore" component={CreateStore} />
      {isSeller && (
        <>
          <Stack.Screen name="CreateProduct" component={CreateProduct} />
          <Stack.Screen name="EditProduct" component={EditProduct} />
        </>
      )}
      {isAdmin && (
        <>
          <Stack.Screen name="StoreApproval" component={StoreApproval} />
          <Stack.Screen name="StoreManagement" component={StoreManagement} />
          <Stack.Screen name="UserManagement" component={UserManagement} />
          <Stack.Screen name="AdminOrders" component={AdminOrders} />
        </>
      )}
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="LegalDocument" component={LegalDocument} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const isSeller = user?.role === Role.SELLER;
  const isAdmin = user?.role === Role.ADMIN;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'search';

          if (route.name === 'Discovery') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Seller') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <Ionicons name={iconName} size={22} color={focused ? colors.surface : color} />
            </View>
          );
        },
        tabBarActiveTintColor: colors.surface,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          paddingBottom: 24,
          paddingTop: 8,
          left: 16,
          right: 16,
          bottom: 8,
          display: 'flex',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: FontFamilies.bodySemiBold,
          marginTop: 2,
          display: 'none',
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={styles.tabBarInner} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Discovery" component={DiscoveryFeed} options={{ title: t('discovery') }} />
      {!isAdmin && <Tab.Screen name="Cart" component={Cart} options={{ title: 'Cart' }} />}
      {isSeller && (
        <Tab.Screen name="Seller" component={SellerDashboard} options={{ title: t('seller') }} />
      )}
      {!isAdmin && (
        <Tab.Screen name="Favorites" component={FavoritesList} options={{ title: t('favorites') }} />
      )}
      {isAdmin && (
        <Tab.Screen name="Admin" component={AdminDashboard} options={{ title: t('admin') }} />
      )}
      <Tab.Screen name="Profile" component={Profile} options={{ title: t('settings') }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      linking={{
        prefixes: ['pure://'],
        config: { screens: { ResetPassword: 'reset-password' } },
      }}
    >
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  tabIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabIconWrapActive: {
    backgroundColor: colors.secondary,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tabBarBackground: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarInner: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 28,
  },
});

export default AppNavigator;
