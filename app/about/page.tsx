"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Book, Globe, Users, Database, ExternalLink } from "lucide-react"
import Link from "next/link"
import LanguageSelector from "@/components/language-selector"
import { getTranslation } from "@/lib/translations"

export default function AboutPage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  const sources = [
    {
      title: "The Sealed Nectar (Ar-Raheeq Al-Makhtum)",
      author: "Safi-ur-Rahman al-Mubarakpuri",
      type: "Book",
      description: "Comprehensive biography of Prophet Muhammad (PBUH)",
    },
    {
      title: "Tarikh al-Tabari",
      author: "Muhammad ibn Jarir al-Tabari",
      type: "Historical Chronicle",
      description: "Detailed historical accounts of early Islamic period",
    },
    {
      title: "Sirat Ibn Hisham",
      author: "Ibn Hisham",
      type: "Biography",
      description: "Classical biography of the Prophet Muhammad",
    },
    {
      title: "The Cambridge History of Islam",
      author: "Various Scholars",
      type: "Academic Reference",
      description: "Scholarly compilation of Islamic history",
    },
    {
      title: "Islamic Historical Atlas",
      author: "William C. Brice",
      type: "Atlas",
      description: "Geographical and historical mapping reference",
    },
  ]

  const contributors = [
    {
      name: "Dr. Ahmed Hassan",
      role: "Islamic History Consultant",
      expertise: "Early Islamic Period",
    },
    {
      name: "Prof. Fatima Al-Zahra",
      role: "Arabic Language Expert",
      expertise: "Classical Arabic Texts",
    },
    {
      name: "Dr. Mehmet Özkan",
      role: "Ottoman History Specialist",
      expertise: "Late Islamic Period",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-amber-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-amber-500/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-amber-300 hover:text-amber-200 hover:bg-amber-500/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Atlas
              </Button>
            </Link>
            <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
          </div>

          <div className="text-center">
            <h1 className="text-5xl font-bold text-amber-300 mb-4 calligraphy-text">
              {getTranslation(currentLanguage, "aboutSources")}
            </h1>
            <p className="text-xl text-amber-200 max-w-3xl mx-auto">
              {currentLanguage === "tr" &&
                "Bu proje, İslam tarihinin önemli olaylarını interaktif bir şekilde sunmak için güvenilir kaynaklardan derlenmiştir."}
              {currentLanguage === "en" &&
                "This project has been compiled from reliable sources to present important events in Islamic history in an interactive way."}
              {currentLanguage === "ar" &&
                "تم تجميع هذا المشروع من مصادر موثوقة لتقديم الأحداث المهمة في التاريخ الإسلامي بطريقة تفاعلية."}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Project Overview */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-8 border-2 border-amber-500/20">
            <div className="flex items-center mb-6">
              <Globe className="w-8 h-8 text-amber-400 mr-4" />
              <h2 className="text-3xl font-bold text-amber-300">
                {currentLanguage === "tr" && "Proje Hakkında"}
                {currentLanguage === "en" && "About the Project"}
                {currentLanguage === "ar" && "حول المشروع"}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-amber-400 mb-4">
                  {currentLanguage === "tr" && "Amaç"}
                  {currentLanguage === "en" && "Purpose"}
                  {currentLanguage === "ar" && "الهدف"}
                </h3>
                <p className="text-amber-100 leading-relaxed">
                  {currentLanguage === "tr" &&
                    "Siyer Atlası, Hz. Muhammed'in (s.a.v) hayatı ve erken İslam tarihinin önemli olaylarını coğrafi ve kronolojik bağlamda sunarak, kullanıcıların bu zengin mirası daha iyi anlamalarını sağlamayı amaçlar."}
                  {currentLanguage === "en" &&
                    "Siyer Atlası aims to help users better understand this rich heritage by presenting the life of Prophet Muhammad (PBUH) and important events of early Islamic history in geographical and chronological context."}
                  {currentLanguage === "ar" &&
                    "يهدف أطلس السيرة إلى مساعدة المستخدمين على فهم هذا التراث الغني بشكل أفضل من خلال تقديم حياة النبي محمد (صلى الله عليه وسلم) والأحداث المهمة في التاريخ الإسلامي المبكر في السياق الجغرافي والزمني."}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-amber-400 mb-4">
                  {currentLanguage === "tr" && "Metodoloji"}
                  {currentLanguage === "en" && "Methodology"}
                  {currentLanguage === "ar" && "المنهجية"}
                </h3>
                <p className="text-amber-100 leading-relaxed">
                  {currentLanguage === "tr" &&
                    "Tüm bilgiler, klasik İslam kaynaklarından ve modern akademik çalışmalardan titizlikle derlenmiş, tarihsel doğruluk ve güvenilirlik ön planda tutulmuştur."}
                  {currentLanguage === "en" &&
                    "All information has been carefully compiled from classical Islamic sources and modern academic studies, with historical accuracy and reliability being prioritized."}
                  {currentLanguage === "ar" &&
                    "تم تجميع جميع المعلومات بعناية من المصادر الإسلامية الكلاسيكية والدراسات الأكاديمية الحديثة، مع إعطاء الأولوية للدقة التاريخية والموثوقية."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Sources */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Book className="w-8 h-8 text-amber-400 mr-4" />
            <h2 className="text-3xl font-bold text-amber-300">
              {currentLanguage === "tr" && "Temel Kaynaklar"}
              {currentLanguage === "en" && "Primary Sources"}
              {currentLanguage === "ar" && "المصادر الأساسية"}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((source, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-black to-gray-900 rounded-lg p-6 border-2 border-amber-500/20 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-amber-300 leading-tight">{source.title}</h3>
                  <ExternalLink className="w-4 h-4 text-amber-400 flex-shrink-0 ml-2" />
                </div>
                <p className="text-amber-400 text-sm mb-2">{source.author}</p>
                <p className="text-amber-500 text-xs mb-3 bg-amber-500/10 px-2 py-1 rounded">{source.type}</p>
                <p className="text-amber-100 text-sm leading-relaxed">{source.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contributors */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Users className="w-8 h-8 text-amber-400 mr-4" />
            <h2 className="text-3xl font-bold text-amber-300">
              {currentLanguage === "tr" && "Katkıda Bulunanlar"}
              {currentLanguage === "en" && "Contributors"}
              {currentLanguage === "ar" && "المساهمون"}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contributors.map((contributor, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-lg p-6 border-2 border-amber-500/20"
              >
                <h3 className="text-xl font-semibold text-amber-300 mb-2">{contributor.name}</h3>
                <p className="text-amber-400 text-sm mb-3">{contributor.role}</p>
                <p className="text-amber-100 text-sm">{contributor.expertise}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Information */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Database className="w-8 h-8 text-amber-400 mr-4" />
            <h2 className="text-3xl font-bold text-amber-300">
              {currentLanguage === "tr" && "Teknik Bilgiler"}
              {currentLanguage === "en" && "Technical Information"}
              {currentLanguage === "ar" && "المعلومات التقنية"}
            </h2>
          </div>
          <div className="bg-gradient-to-br from-black to-gray-900 rounded-xl p-8 border-2 border-amber-500/20">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-amber-400 mb-4">
                  {currentLanguage === "tr" && "Harita Verileri"}
                  {currentLanguage === "en" && "Map Data"}
                  {currentLanguage === "ar" && "بيانات الخريطة"}
                </h3>
                <ul className="text-amber-100 space-y-2">
                  <li>• OpenStreetMap Contributors</li>
                  <li>• Leaflet.js Mapping Library</li>
                  <li>• Historical Coordinate References</li>
                  <li>• Geographic Information Systems (GIS)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-amber-400 mb-4">
                  {currentLanguage === "tr" && "Teknolojiler"}
                  {currentLanguage === "en" && "Technologies"}
                  {currentLanguage === "ar" && "التقنيات"}
                </h3>
                <ul className="text-amber-100 space-y-2">
                  <li>• Next.js & React</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Interactive Timeline Components</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-8 border-2 border-amber-500/20">
            <h2 className="text-2xl font-bold text-amber-300 mb-4">
              {currentLanguage === "tr" && "Sorumluluk Reddi"}
              {currentLanguage === "en" && "Disclaimer"}
              {currentLanguage === "ar" && "إخلاء المسؤولية"}
            </h2>
            <p className="text-amber-100 leading-relaxed">
              {currentLanguage === "tr" &&
                "Bu proje eğitim amaçlıdır ve mümkün olan en yüksek doğruluk standardını hedeflemektedir. Ancak, tarihsel olayların yorumlanmasında farklı görüşler bulunabileceği unutulmamalıdır. Herhangi bir hata veya eksiklik durumunda lütfen bizimle iletişime geçin."}
              {currentLanguage === "en" &&
                "This project is for educational purposes and aims for the highest standard of accuracy possible. However, it should be remembered that there may be different views in the interpretation of historical events. Please contact us if you notice any errors or omissions."}
              {currentLanguage === "ar" &&
                "هذا المشروع لأغراض تعليمية ويهدف إلى أعلى معايير الدقة الممكنة. ومع ذلك، يجب أن نتذكر أنه قد تكون هناك وجهات نظر مختلفة في تفسير الأحداث التاريخية. يرجى الاتصال بنا إذا لاحظت أي أخطاء أو إغفالات."}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
