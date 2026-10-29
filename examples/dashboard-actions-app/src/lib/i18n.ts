/**
 * Internationalization (i18n) helper for the application.
 * Supports multiple languages with fallback to English.
 */

export type SupportedLocale = 'en' | 'tr';

type TranslationKey = 
  | 'action.order_detail.success'
  | 'action.order_detail.error.unauthorized'
  | 'action.order_detail.error.order_not_found'
  | 'action.order_detail.error.invalid_signature'
  | 'action.order_detail.error.missing_fields'
  | 'action.order_detail.error.failed'
  | 'page.order_detail.title'
  | 'page.order_detail.loading'
  | 'page.order_detail.error.no_order_id'
  | 'page.order_detail.error.invalid_order_id'
  | 'page.order_detail.error.not_found'
  | 'page.order_detail.error.failed'
  | 'page.order_detail.error.unable_to_authenticate'
  | 'page.order_detail.action_run_id'
  | 'page.order_detail.status'
  | 'page.order_detail.payment_status'
  | 'page.order_detail.package_status'
  | 'page.order_detail.total_amount'
  | 'page.order_detail.customer_info'
  | 'page.order_detail.name'
  | 'page.order_detail.email'
  | 'page.order_detail.phone'
  | 'page.order_detail.customer_id'
  | 'page.order_detail.shipping_address'
  | 'page.order_detail.billing_address'
  | 'page.order_detail.order_items'
  | 'page.order_detail.sku'
  | 'page.order_detail.quantity'
  | 'page.order_detail.each'
  | 'page.order_detail.unknown_product'
  | 'page.order_detail.no_customer_info'
  | 'page.order_detail.summary'
  | 'page.order_detail.unit_price'
  | 'page.order_detail.line_total'
  | 'page.order_detail.product'
  | 'page.order_list.title'
  | 'page.order_list.order'
  | 'page.order_list.date'
  | 'page.order_list.customer'
  | 'page.order_list.items'
  | 'page.order_list.empty';

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en: {
    'action.order_detail.success': 'Order details retrieved successfully',
    'action.order_detail.error.unauthorized': 'Unauthorized',
    'action.order_detail.error.order_not_found': 'Order not found',
    'action.order_detail.error.invalid_signature': 'Invalid signature',
    'action.order_detail.error.missing_fields': 'Missing required fields',
    'action.order_detail.error.failed': 'Failed to process action',
    'page.order_detail.title': 'Order',
    'page.order_detail.loading': 'Loading',
    'page.order_detail.error.no_order_id': 'No order ID provided',
    'page.order_detail.error.invalid_order_id': 'Invalid order ID',
    'page.order_detail.error.not_found': 'Order not found',
    'page.order_detail.error.failed': 'Failed to load order details',
    'page.order_detail.error.unable_to_authenticate': 'Unable to authenticate',
    'page.order_detail.action_run_id': 'Action run ID',
    'page.order_detail.status': 'Status',
    'page.order_detail.payment_status': 'Payment status',
    'page.order_detail.package_status': 'Package status',
    'page.order_detail.total_amount': 'Total amount',
    'page.order_detail.customer_info': 'Customer information',
    'page.order_detail.name': 'Name',
    'page.order_detail.email': 'Email',
    'page.order_detail.phone': 'Phone',
    'page.order_detail.customer_id': 'Customer ID',
    'page.order_detail.shipping_address': 'Shipping address',
    'page.order_detail.billing_address': 'Billing address',
    'page.order_detail.order_items': 'Order items',
    'page.order_detail.sku': 'SKU',
    'page.order_detail.quantity': 'Quantity',
    'page.order_detail.each': 'each',
    'page.order_detail.unknown_product': 'Unknown product',
    'page.order_detail.no_customer_info': 'No customer information available',
    'page.order_detail.summary': 'Summary',
    'page.order_detail.unit_price': 'Unit price',
    'page.order_detail.line_total': 'Total',
    'page.order_detail.product': 'Product',
    'page.order_list.title': 'Selected orders',
    'page.order_list.order': 'Order',
    'page.order_list.date': 'Date',
    'page.order_list.customer': 'Customer',
    'page.order_list.items': 'Items',
    'page.order_list.empty': 'None of the selected orders could be found.',
  },
  tr: {
    'action.order_detail.success': 'Sipariş detayları başarıyla alındı',
    'action.order_detail.error.unauthorized': 'Yetkisiz erişim',
    'action.order_detail.error.order_not_found': 'Sipariş bulunamadı',
    'action.order_detail.error.invalid_signature': 'Geçersiz imza',
    'action.order_detail.error.missing_fields': 'Eksik zorunlu alanlar',
    'action.order_detail.error.failed': 'İşlem başarısız oldu',
    'page.order_detail.title': 'Sipariş',
    'page.order_detail.loading': 'Yükleniyor',
    'page.order_detail.error.no_order_id': 'Sipariş ID\'si belirtilmedi',
    'page.order_detail.error.invalid_order_id': 'Geçersiz sipariş ID\'si',
    'page.order_detail.error.not_found': 'Sipariş bulunamadı',
    'page.order_detail.error.failed': 'Sipariş detayları yüklenemedi',
    'page.order_detail.error.unable_to_authenticate': 'Kimlik doğrulanamadı',
    'page.order_detail.action_run_id': 'İşlem kimliği',
    'page.order_detail.status': 'Durum',
    'page.order_detail.payment_status': 'Ödeme durumu',
    'page.order_detail.package_status': 'Paket durumu',
    'page.order_detail.total_amount': 'Toplam tutar',
    'page.order_detail.customer_info': 'Müşteri bilgileri',
    'page.order_detail.name': 'Ad Soyad',
    'page.order_detail.email': 'E-posta',
    'page.order_detail.phone': 'Telefon',
    'page.order_detail.customer_id': 'Müşteri ID',
    'page.order_detail.shipping_address': 'Teslimat adresi',
    'page.order_detail.billing_address': 'Fatura adresi',
    'page.order_detail.order_items': 'Sipariş ürünleri',
    'page.order_detail.sku': 'Stok Kodu',
    'page.order_detail.quantity': 'Adet',
    'page.order_detail.each': 'adet',
    'page.order_detail.unknown_product': 'Bilinmeyen ürün',
    'page.order_detail.no_customer_info': 'Müşteri bilgisi mevcut değil',
    'page.order_detail.summary': 'Özet',
    'page.order_detail.unit_price': 'Birim fiyat',
    'page.order_detail.line_total': 'Toplam',
    'page.order_detail.product': 'Ürün',
    'page.order_list.title': 'Seçili siparişler',
    'page.order_list.order': 'Sipariş',
    'page.order_list.date': 'Tarih',
    'page.order_list.customer': 'Müşteri',
    'page.order_list.items': 'Ürün sayısı',
    'page.order_list.empty': 'Seçilen siparişlerin hiçbiri bulunamadı.',
  },
};

/**
 * Get translation for a given key and locale
 * @param key - Translation key
 * @param locale - Locale code (defaults to 'en')
 * @returns Translated string
 */
export function t(key: TranslationKey, locale: SupportedLocale | string = 'en'): string {
  // Normalize locale and fallback to 'en' if not supported
  const normalizedLocale = (locale.toLowerCase() === 'tr' ? 'tr' : 'en') as SupportedLocale;
  
  return translations[normalizedLocale][key] || translations.en[key] || key;
}

/**
 * Get all translations for a specific locale
 * @param locale - Locale code
 * @returns Object with all translations
 */
export function getTranslations(locale: SupportedLocale | string = 'en'): Record<TranslationKey, string> {
  const normalizedLocale = (locale.toLowerCase() === 'tr' ? 'tr' : 'en') as SupportedLocale;
  return translations[normalizedLocale];
}

/**
 * Check if a locale is supported
 * @param locale - Locale code to check
 * @returns True if locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale === 'en' || locale === 'tr';
}

