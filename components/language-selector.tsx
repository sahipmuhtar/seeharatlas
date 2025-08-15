"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
]

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange: (language: string) => void
  className?: string
}

export default function LanguageSelector({ currentLanguage, onLanguageChange, className }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find((lang) => lang.code === currentLanguage) || languages[0]

  return (
    <div className={cn("relative", className)}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg px-4 py-2 backdrop-blur-md transition-all duration-200 hover:scale-105"
      >
        <Globe className="w-4 h-4 mr-2" />
        <span className="mr-1">{currentLang.flag}</span>
        <span className="hidden sm:inline font-medium">{currentLang.nativeName}</span>
        <span className="sm:hidden font-medium">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={cn("w-3 h-3 ml-2 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 z-50 bg-black/95 backdrop-blur-md border border-amber-500/40 rounded-lg shadow-2xl min-w-[200px] overflow-hidden">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageChange(language.code)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-amber-500/20 transition-colors flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg",
                  currentLanguage === language.code && "bg-amber-500/30 text-amber-200",
                  currentLanguage !== language.code && "text-amber-300",
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs opacity-70">{language.name}</span>
                </div>
                {currentLanguage === language.code && <div className="ml-auto w-2 h-2 bg-amber-400 rounded-full"></div>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
