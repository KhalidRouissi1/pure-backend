export interface SaudiCity {
  name: string;
  latitude: number;
  longitude: number;
  aliases: string[];
}

export const SAUDI_CITIES: SaudiCity[] = [
  { name: 'Riyadh', latitude: 24.7136, longitude: 46.6753, aliases: ['riyadh', 'ryaz', 'reyadh', 'al riyadh', 'الرياض'] },
  { name: 'Jeddah', latitude: 21.4858, longitude: 39.1925, aliases: ['jeddah', 'jeddahh', 'jeda', 'jidda', 'jiddah', 'jedda', 'جدة'] },
  { name: 'Makkah', latitude: 21.3891, longitude: 39.8579, aliases: ['makkah', 'mecca', 'makka', 'مكة'] },
  { name: 'Madinah', latitude: 24.5247, longitude: 39.5692, aliases: ['madinah', 'medina', 'madina', 'المدينة'] },
  { name: 'Dammam', latitude: 26.4207, longitude: 50.0888, aliases: ['dammam', 'damam', 'الدمام'] },
  { name: 'Khobar', latitude: 26.2172, longitude: 50.1971, aliases: ['khobar', 'alkhobar', 'al khobar', ' الخبر'] },
  { name: 'Dhahran', latitude: 26.2361, longitude: 50.0393, aliases: ['dhahran', 'الظهران'] },
  { name: 'Taif', latitude: 21.4373, longitude: 40.5127, aliases: ['taif', ' الطائف'] },
  { name: 'Tabuk', latitude: 28.3835, longitude: 36.5662, aliases: ['tabuk', 'تبوك'] },
  { name: 'Abha', latitude: 18.2465, longitude: 42.5117, aliases: ['abha', 'أبها'] },
  { name: 'Khamis Mushait', latitude: 18.3064, longitude: 42.7292, aliases: ['khamis mushait', 'khamis', 'خميس مشيط'] },
  { name: 'Hail', latitude: 27.5114, longitude: 41.7208, aliases: ['hail', 'ha il', 'حائل'] },
  { name: 'Buraidah', latitude: 26.3592, longitude: 43.9818, aliases: ['buraidah', 'buraydah', 'بريدة'] },
  { name: 'Jazan', latitude: 16.8892, longitude: 42.5511, aliases: ['jazan', 'jizan', 'جازان'] },
  { name: 'Najran', latitude: 17.5656, longitude: 44.2289, aliases: ['najran', 'نجران'] },
  { name: 'Al Ahsa', latitude: 25.3833, longitude: 49.5866, aliases: ['al ahsa', 'alahsa', 'hofuf', 'hufuf', 'الأحساء', 'الهفوف'] },
  { name: 'Yanbu', latitude: 24.0232, longitude: 38.1899, aliases: ['yanbu', 'ينبع'] },
  { name: 'AlUla', latitude: 26.6085, longitude: 37.9232, aliases: ['alula', 'al ula', 'العلا'] },
  { name: 'Hafar Al-Batin', latitude: 28.4342, longitude: 45.9636, aliases: ['hafar al batin', 'hafr al batin', 'hafer al batin', 'hafar', 'hafr', 'hoffr botton', 'حفر الباطن'] },
];

export const SAUDI_CENTER = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 12,
  longitudeDelta: 12,
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/[-_,.]+/g, ' ').replace(/\s+/g, ' ');

export const isInsideSaudiBounds = (latitude: number, longitude: number) =>
  latitude >= 16 && latitude <= 32 && longitude >= 34 && longitude <= 56;

export const matchSaudiCity = (input: string) => {
  const normalized = normalize(input);
  if (!normalized) return undefined;

  return SAUDI_CITIES.find((city) =>
    city.aliases.some((alias) => {
      const normalizedAlias = normalize(alias);
      return normalized.includes(normalizedAlias) || normalizedAlias.includes(normalized);
    }),
  );
};

export const nearestSaudiCity = (latitude: number, longitude: number) => {
  return SAUDI_CITIES.reduce((nearest, city) => {
    const distance = Math.hypot(city.latitude - latitude, city.longitude - longitude);
    if (!nearest || distance < nearest.distance) return { city, distance };
    return nearest;
  }, undefined as { city: SaudiCity; distance: number } | undefined)?.city;
};
