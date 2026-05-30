import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, Text, TextInput, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { matchSaudiCity, SAUDI_CITIES } from '../utils/saudiLocations';
import MapSelectorModal from './MapSelectorModal';

interface SaudiLocationPickerProps {
  city: string;
  addressText?: string;
  latitude?: string;
  longitude?: string;
  errors?: {
    city?: string;
    latitude?: string;
    longitude?: string;
  };
  onChange: (location: { city: string; addressText?: string; latitude?: string; longitude?: string }) => void;
}

export default function SaudiLocationPicker({
  city,
  addressText,
  latitude,
  longitude,
  errors,
  onChange,
}: SaudiLocationPickerProps) {
  const [query, setQuery] = useState(addressText || city);
  const [modalVisible, setModalVisible] = useState(false);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return SAUDI_CITIES.slice(0, 6);
    const cityMatch = matchSaudiCity(normalized);
    const filtered = SAUDI_CITIES.filter((item) => item.name.toLowerCase().includes(normalized));
    return cityMatch ? [cityMatch, ...filtered.filter((item) => item.name !== cityMatch.name)].slice(0, 6) : filtered.slice(0, 6);
  }, [query]);

  const selectCity = (item: (typeof SAUDI_CITIES)[number]) => {
    const next = {
      city: item.name,
      latitude: item.latitude.toString(),
      longitude: item.longitude.toString(),
      addressText: query || item.name,
    };
    setQuery(item.name);
    onChange(next);
  };

  const applyAddressText = (text: string) => {
    setQuery(text);
    const cityMatch = matchSaudiCity(text);
    onChange({
      city: cityMatch?.name || city,
      latitude: cityMatch ? cityMatch.latitude.toString() : latitude,
      longitude: cityMatch ? cityMatch.longitude.toString() : longitude,
      addressText: text,
    });
  };

  const handleMapSelect = (location: { latitude: number; longitude: number; address?: string; city?: string }) => {
    const nextCity = location.city || city;
    const nextAddress = location.address || query;
    setQuery(nextAddress);
    onChange({
      city: nextCity,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      addressText: nextAddress,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Product Origin / Farm Location *</Text>
      
      <Surface style={styles.mapSelectorTrigger} elevation={1}>
        <View style={styles.mapInfo}>
          <Ionicons name="location" size={24} color={colors.primary} />
          <View style={styles.mapInfoText}>
            <Text style={styles.locationSummary}>
              {latitude && longitude ? `${city || 'Saudi Arabia'} (Pinned)` : 'No location selected'}
            </Text>
            <Text style={styles.locationSubtext}>
              {addressText || 'Tap the button to pick a precise location on the map'}
            </Text>
          </View>
        </View>
        <Button 
          mode="contained" 
          onPress={() => setModalVisible(true)}
          style={styles.openMapButton}
          labelStyle={styles.openMapButtonLabel}
        >
          Select on Map
        </Button>
      </Surface>

      <TextInput
        label="Quick Search Address or City"
        value={query}
        onChangeText={applyAddressText}
        mode="outlined"
        error={!!errors?.city}
        style={styles.input}
        placeholder="Hafar Al-Batin, Riyadh, Jeddah..."
        left={<TextInput.Icon icon="magnify" />}
      />
      <HelperText type="error" visible={!!errors?.city}>
        {errors?.city}
      </HelperText>

      <View style={styles.chips}>
        {matches.map((item) => (
          <Chip
            key={item.name}
            compact
            selected={city === item.name}
            onPress={() => selectCity(item)}
            style={styles.chip}
            showSelectedOverlay
          >
            {item.name}
          </Chip>
        ))}
      </View>

      <MapSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleMapSelect}
        initialLocation={latitude && longitude ? {
          latitude: Number(latitude),
          longitude: Number(longitude)
        } : undefined}
      />

      {(errors?.latitude || errors?.longitude) && (
        <HelperText type="error" visible>
          Please select a valid location inside Saudi Arabia.
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  mapSelectorTrigger: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  locationSummary: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  locationSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  openMapButton: {
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  openMapButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    marginBottom: 4,
  },
});
