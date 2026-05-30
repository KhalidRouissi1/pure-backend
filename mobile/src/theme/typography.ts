import { FontFamilies } from './fonts';

const W = '400' as const;

export const typography = {
  h1: {
    fontSize: 34,
    fontFamily: FontFamilies.extraBold,
    fontWeight: W,
    lineHeight: 48,
    letterSpacing: 0,
  },
  h2: {
    fontSize: 28,
    fontFamily: FontFamilies.extraBold,
    fontWeight: W,
    lineHeight: 40,
    letterSpacing: 0,
  },
  h3: {
    fontSize: 24,
    fontFamily: FontFamilies.bold,
    fontWeight: W,
    lineHeight: 34,
  },
  h4: {
    fontSize: 20,
    fontFamily: FontFamilies.bold,
    fontWeight: W,
    lineHeight: 30,
  },
  h5: {
    fontSize: 18,
    fontFamily: FontFamilies.semiBold,
    fontWeight: W,
    lineHeight: 28,
  },
  h6: {
    fontSize: 16,
    fontFamily: FontFamilies.semiBold,
    fontWeight: W,
    lineHeight: 24,
  },
  body1: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
    fontWeight: W,
    lineHeight: 26,
  },
  body2: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    fontWeight: W,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    fontWeight: W,
    lineHeight: 18,
  },
  overline: {
    fontSize: 11,
    fontFamily: FontFamilies.semiBold,
    fontWeight: W,
    lineHeight: 14,
    letterSpacing: 0,
  },
  price: {
    fontSize: 20,
    fontFamily: FontFamilies.bold,
    fontWeight: W,
    lineHeight: 28,
  },
  badge: {
    fontSize: 10,
    fontFamily: FontFamilies.bold,
    fontWeight: W,
    lineHeight: 14,
    letterSpacing: 0,
  },
} as const;

export type Typography = typeof typography;
