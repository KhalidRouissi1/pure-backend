export const FontFamilies = {
  regular: '29LTBukra-Regular',
  medium: '29LTBukra-Regular',
  semiBold: '29LTBukra-Bold',
  bold: '29LTBukra-Bold',
  extraBold: '29LTBukra-Bold',
  display: '29LTBukra-Bold',
  body: '29LTBukra-Regular',
  bodyMedium: '29LTBukra-Regular',
  bodySemiBold: '29LTBukra-Bold',
  bodyBold: '29LTBukra-Bold',
  // Direct access if needed
  arabicRegular: '29LTBukra-Regular',
  arabicBold: '29LTBukra-Bold',
  arabicLight: '29LTBukra-Light',
} as const;

export const fontConfig = {
  NotoSansArabic: require('../../public/NotoSansArabic-VariableFont_wdth,wght.ttf'),
  'NotoSansArabic-Medium': require('../../public/NotoSansArabic-VariableFont_wdth,wght.ttf'),
  'NotoSansArabic-SemiBold': require('../../public/NotoSansArabic-VariableFont_wdth,wght.ttf'),
  'NotoSansArabic-Bold': require('../../public/NotoSansArabic-VariableFont_wdth,wght.ttf'),
  'NotoSansArabic-ExtraBold': require('../../public/NotoSansArabic-VariableFont_wdth,wght.ttf'),
  // 29LT Bukra
  '29LTBukra-Regular': require('../../public/29ltbukra/29ltbukraregular.ttf'),
  '29LTBukra-Bold': require('../../public/29ltbukra/29ltbukrabold.ttf'),
  '29LTBukra-Light': require('../../public/29ltbukra/29ltbukralight.ttf'),
};
