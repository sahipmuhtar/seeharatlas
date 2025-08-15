export type Translations = { [language: string]: { [key: string]: string } }

export const translations: Translations = {
  tr: {
    // Header
    title: "Siyer Atlası",
    subtitle: "Hz. Muhammed'in (s.a.v) Kronolojik Hayatı",

    // Timeline
    timelinePlayback: "Zaman Çizelgesi Oynatılıyor",
    timelineRestricted: "Zaman çizelgesi sadece olay yılları ile sınırlıdır",
    loadingMap: "Harita yükleniyor...",

    // Events
    readMore: "Devamını oku",
    description: "Açıklama",
    historicalSignificance: "Tarihi Önemi",
    location: "Konum",
    year: "Yıl",

    // Categories
    conquest: "fetih",
    cultural: "kültürel",
    political: "siyasi",
    religious: "dini",
    scientific: "bilimsel",
    military: "savaş",
    personal: "kişisel",
    battle: "savaş",

    // Footer
    aboutSources: "Kaynaklar ve Bilgiler Hakkında",
  previousEvent: "Önceki Olay",
  nextEvent: "Sonraki Olay",
  },
  en: {
    // Header
    title: "Seerah Atlas",
    subtitle: "Biography Atlas of Muhammad (PBUH)",

    // Timeline
    timelinePlayback: "Timeline Playback",
    timelineRestricted: "Timeline restricted to event years only",
    loadingMap: "Loading map...",

    // Events
    readMore: "Read more",
    description: "Description",
    historicalSignificance: "Historical Significance",
    location: "Location",
    year: "Year",

    // Categories
    conquest: "conquest",
    cultural: "cultural",
    political: "political",
    religious: "religious",
    scientific: "scientific",
    military: "military",
    personal: "personal",
    battle: "battle",

    // Footer
    aboutSources: "About Sources and Information",
  previousEvent: "Previous Event",
  nextEvent: "Next Event",
  },
  ar: {
    // Header
    title: "سيرة أطلس",
    subtitle: "أطلس السيرة التفاعلي",

    // Timeline
    timelinePlayback: "تشغيل الخط الزمني",
    timelineRestricted: "الخط الزمني مقيد بسنوات الأحداث فقط",
    loadingMap: "جاري تحميل الخريطة...",

    // Events
    readMore: "اقرأ المزيد",
    description: "الوصف",
    historicalSignificance: "الأهمية التاريخية",
    location: "الموقع",
    year: "السنة",

    // Categories
    conquest: "فتح",
    cultural: "ثقافي",
    political: "سياسي",
    religious: "ديني",
    scientific: "علمي",
    military: "عسكري",
    personal: "شخصي",
    battle: "معركة",

    // Footer
    aboutSources: "حول المصادر والمعلومات",
  previousEvent: "الحدث السابق",
  nextEvent: "الحدث التالي",
  },
}

export function getTranslation(language: string, key: string): string {
  const dict = translations[language] || {}
  return dict[key] ?? key
}
