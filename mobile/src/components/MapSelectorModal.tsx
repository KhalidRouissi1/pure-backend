import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, MapPressEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button, IconButton, Searchbar, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';
import { SAUDI_CENTER, isInsideSaudiBounds, nearestSaudiCity, matchSaudiCity } from '../utils/saudiLocations';

interface MapSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
  }) => void;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
}

export default function MapSelectorModal({
  visible,
  onClose,
  onSelect,
  initialLocation,
}: MapSelectorModalProps) {
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || SAUDI_CENTER.latitude,
    longitude: initialLocation?.longitude || SAUDI_CENTER.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.latitude || SAUDI_CENTER.latitude,
    longitude: initialLocation?.longitude || SAUDI_CENTER.longitude,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (visible && initialLocation) {
      const newPos = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
      };
      setMarkerPosition(newPos);
      setRegion({
        ...region,
        ...newPos,
      });
      reverseGeocode(newPos.latitude, newPos.longitude);
    }
  }, [visible, initialLocation]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const [result] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (result) {
        const addr = [result.street, result.district, result.city].filter(Boolean).join(', ');
        setAddress(addr);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    if (isInsideSaudiBounds(coordinate.latitude, coordinate.longitude)) {
      setMarkerPosition(coordinate);
      reverseGeocode(coordinate.latitude, coordinate.longitude);
    }
  };

  const handleMarkerDragEnd = (event: any) => {
    const { coordinate } = event.nativeEvent;
    if (isInsideSaudiBounds(coordinate.latitude, coordinate.longitude)) {
      setMarkerPosition(coordinate);
      reverseGeocode(coordinate.latitude, coordinate.longitude);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      if (isInsideSaudiBounds(coords.latitude, coords.longitude)) {
        setMarkerPosition(coords);
        setRegion({
          ...region,
          ...coords,
        });
        reverseGeocode(coords.latitude, coords.longitude);
      } else {
        alert('Current location is outside Saudi Arabia');
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const city = nearestSaudiCity(markerPosition.latitude, markerPosition.longitude)?.name;
    onSelect({
      ...markerPosition,
      address,
      city,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="close" onPress={onClose} size={24} />
          <Text style={styles.title}>Select Location</Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search for a place..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            elevation={1}
          />
        </View>

        <View style={styles.mapContainer}>
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={handleMarkerDragEnd}
              pinColor={colors.primary}
            />
          </MapView>

          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <Surface style={styles.fab} elevation={4}>
              {loading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <IconButton icon="crosshairs-gps" iconColor={colors.primary} size={24} />
              )}
            </Surface>
          </TouchableOpacity>
        </View>

        <Surface style={styles.footer} elevation={4}>
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>Selected Location</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {address || 'Loading address...'}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.confirmButton}
            contentStyle={styles.confirmButtonContent}
          >
            Confirm Location
          </Button>
        </Surface>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    padding: 12,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchbar: {
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  addressInfo: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  confirmButton: {
    borderRadius: 12,
    backgroundColor: colors.secondary,
  },
  confirmButtonContent: {
    paddingVertical: 8,
  },
});
