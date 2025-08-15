import type { Metadata } from "next"
import HistoricalMap from "@/components/historical-map"

export const metadata: Metadata = {
  title: "Siyer Atlası | Hz. Muhammed’in (s.a.v.) Kronolojik Hayatı Harita Üzerinde",
  description:
    "Hz. Muhammed’in (s.a.v.) hayatını kronolojik olarak interaktif harita ve zaman çizelgesi üzerinde keşfedin. Olayların açıklamaları, konumları ve tarihi önemiyle detaylı anlatım.",
  keywords: [
    // TR
    "Siyer",
    "Siyer Atlası",
    "Hz. Muhammed",
    "Peygamber",
    "İslam tarihi",
    "kronolojik",
    "zaman çizelgesi",
    "harita",
    "vahiy",
    "hicret",
    "fetih",
    // EN
    "Sirah",
    "Sirah Atlas",
    "Prophet Muhammad",
    "Islamic history",
    "chronological",
    "timeline",
    "map",
    "revelation",
    "Hijra",
    "conquest",
    // AR
    "السيرة",
    "أطلس السيرة",
    "النبي محمد",
    "التاريخ الإسلامي",
    "زمني",
    "خط زمني",
    "خريطة",
    "الوحي",
    "الهجرة",
    "الفتح",
  ],
  openGraph: {
    title: "Siyer Atlası | Hz. Muhammed’in (s.a.v.) Kronolojik Hayatı Harita Üzerinde",
    description:
      "Hz. Muhammed’in (s.a.v.) hayatını kronolojik olarak interaktif harita ve zaman çizelgesi üzerinde keşfedin.",
    type: "website",
    locale: "tr_TR",
    alternateLocale: ["en_US", "ar_SA"],
  },
  alternates: {
    canonical: "/",
    languages: {
      tr: "/",
      en: "/?lang=en",
      ar: "/?lang=ar",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Siyer Atlası | Hz. Muhammed’in (s.a.v.) Kronolojik Hayatı Harita Üzerinde",
    description:
      "Hz. Muhammed’in (s.a.v.) hayatını kronolojik olarak interaktif harita ve zaman çizelgesi üzerinde keşfedin.",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900">
      <HistoricalMap />
    </main>
  )
}
