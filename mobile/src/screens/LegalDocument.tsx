import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import BackHeader from '../components/BackHeader';
import ResponsiveContent from '../components/layout/ResponsiveContent';
import { colors } from '../theme/colors';
import { FontFamilies } from '../theme/fonts';

const documents = {
  privacy: {
    en: {
      title: 'Privacy Policy',
      sections: [
        [
          'Information we collect',
          'We collect account details, profile information, saved addresses, orders, favorites, reviews, store applications, and product content you submit. Location and photos are accessed only when you choose features that require them.',
        ],
        [
          'How we use information',
          'We use this information to authenticate you, operate the marketplace, process orders, show relevant stores, prevent abuse, provide support, and comply with legal obligations.',
        ],
        [
          'Sharing',
          'We share order and contact details with the sellers and delivery participants needed to fulfil your request. Infrastructure providers process data on our behalf. We do not sell personal information.',
        ],
        [
          'Retention and security',
          'We retain information while your account is active and as required for fraud prevention, disputes, accounting, and law. We use access controls, encrypted transport, and restricted production credentials.',
        ],
        [
          'Your choices',
          'You can update your profile or permanently delete your account in Settings. You can deny optional location and photo permissions in your device settings.',
        ],
        [
          'Contact',
          `For privacy requests, email ${process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@pure.app'}.`,
        ],
      ],
    },
    ar: {
      title: 'سياسة الخصوصية',
      sections: [
        [
          'البيانات التي نجمعها',
          'نجمع بيانات الحساب والملف الشخصي والعناوين والطلبات والمفضلة والتقييمات وطلبات المتاجر والمحتوى الذي تضيفه. نستخدم الموقع والصور فقط عند اختيار ميزة تحتاجها.',
        ],
        [
          'استخدام البيانات',
          'نستخدم البيانات لتسجيل الدخول وتشغيل السوق وتنفيذ الطلبات ومنع إساءة الاستخدام وتقديم الدعم والالتزام بالأنظمة.',
        ],
        [
          'مشاركة البيانات',
          'نشارك بيانات الطلب والتواصل مع البائعين والأطراف اللازمة لتنفيذ طلبك. لا نبيع بياناتك الشخصية.',
        ],
        [
          'الحفظ والأمان',
          'نحتفظ بالبيانات أثناء نشاط الحساب وللمدد اللازمة للمحاسبة وحل النزاعات ومنع الاحتيال. نستخدم اتصالاً مشفراً وصلاحيات وصول محدودة.',
        ],
        [
          'خياراتك',
          'تقدر تعدّل ملفك أو تحذف حسابك نهائياً من الإعدادات، وتقدر ترفض صلاحيات الموقع والصور من إعدادات جهازك.',
        ],
        [
          'التواصل',
          `لطلبات الخصوصية راسلنا على ${process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@pure.app'}.`,
        ],
      ],
    },
  },
  terms: {
    en: {
      title: 'Terms of Service',
      sections: [
        [
          'Marketplace role',
          'Pure connects buyers with independent sellers. Sellers are responsible for product accuracy, legality, quality, delivery, and customer commitments.',
        ],
        [
          'Accounts',
          'Provide accurate information and protect access to your account. You are responsible for activity performed through your account. Seller access requires platform approval.',
        ],
        [
          'Orders and payment',
          'Prices and totals shown at checkout are confirmed by the server. Only payment-on-delivery methods are currently supported. Availability, delivery, returns, and refunds must be agreed with the seller unless applicable law requires otherwise.',
        ],
        [
          'Acceptable use',
          'Do not submit illegal, deceptive, unsafe, infringing, or abusive content. We may remove content, reject stores, suspend accounts, or cooperate with authorities when necessary.',
        ],
        [
          'Account deletion',
          'You may delete your account in Settings. Some transaction records may be retained when required by law or legitimate dispute and fraud-prevention needs.',
        ],
        [
          'Changes and contact',
          `We may update these terms with notice in the app. Questions can be sent to ${process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@pure.app'}.`,
        ],
      ],
    },
    ar: {
      title: 'الشروط والأحكام',
      sections: [
        [
          'دور المنصة',
          'Pure يربط المشترين ببائعين مستقلين. البائع مسؤول عن صحة المنتج ونظاميته وجودته والتوصيل والتزاماته مع العميل.',
        ],
        ['الحسابات', 'قدّم معلومات صحيحة واحمِ حسابك. صلاحية البائع تحتاج موافقة المنصة.'],
        [
          'الطلبات والدفع',
          'الخادم يؤكد الأسعار والإجمالي. المتاح حالياً هو الدفع عند الاستلام فقط. التوفر والتوصيل والاسترجاع يتم الاتفاق عليها مع البائع مع الالتزام بالأنظمة.',
        ],
        [
          'الاستخدام المقبول',
          'يُمنع المحتوى غير النظامي أو المضلل أو الخطير أو المسيء. يحق لنا حذف المحتوى أو رفض المتاجر أو إيقاف الحسابات عند الحاجة.',
        ],
        [
          'حذف الحساب',
          'تقدر تحذف حسابك من الإعدادات. قد نحتفظ ببعض سجلات المعاملات إذا تطلب النظام أو حل النزاعات ومنع الاحتيال ذلك.',
        ],
        [
          'التغييرات والتواصل',
          `قد نحدّث الشروط مع إشعار داخل التطبيق. للاستفسار: ${process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@pure.app'}.`,
        ],
      ],
    },
  },
} as const;

export default function LegalDocument({
  route,
}: {
  route: { params?: { document?: 'privacy' | 'terms' } };
}) {
  const { i18n } = useTranslation();
  const document = documents[route.params?.document || 'privacy'];
  const content = document[i18n.language.startsWith('ar') ? 'ar' : 'en'];

  return (
    <View style={styles.root}>
      <BackHeader title={content.title} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ResponsiveContent variant="form">
          <Text style={styles.updated}>Effective date: July 13, 2026</Text>
          {content.sections.map(([title, body]) => (
            <View key={title} style={styles.section}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.body}>{body}</Text>
            </View>
          ))}
        </ResponsiveContent>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingTop: 22, paddingBottom: 48 },
  updated: { color: colors.textTertiary, fontFamily: FontFamilies.regular, marginBottom: 20 },
  section: { marginBottom: 22 },
  title: { color: colors.text, fontFamily: FontFamilies.bold, fontSize: 17, marginBottom: 7 },
  body: {
    color: colors.textSecondary,
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    lineHeight: 22,
  },
});
