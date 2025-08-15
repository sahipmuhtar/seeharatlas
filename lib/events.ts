export interface HistoricalEvent {
  id: string
  title: string
  year: number
  location: string
  coordinates: [number, number]
  description: string
  significance: string
  category: "conquest" | "cultural" | "political" | "religious" | "scientific" |"personal"
  image: string
  detailedDescription: string
}

// Fetch events from one of the following sources (in order):
// 1) Google Sheets (if NEXT_PUBLIC_EVENTS_SHEET_ID is set) via /api/events
// 2) Arbitrary JSON URL (if NEXT_PUBLIC_EVENTS_JSON_URL is set)
// 3) Local static JSON at /events.json (from public/)
export async function fetchEvents(language?: string): Promise<HistoricalEvent[]> {
  try {
    // 1) Try language-specific local JSON first
    if (language) {
      const langCode = language.toLowerCase()
      const langPath = `/events_${langCode}.json`
      try {
        const res = await fetch(langPath, { cache: "no-store" })
        if (res.ok) {
          const data = (await res.json()) as HistoricalEvent[]
          return normalizeEvents(data)
        }
      } catch (_) {
        // ignore and continue fallbacks
      }
    }

    // 2) Try remote JSON URL if configured
    if (process.env.NEXT_PUBLIC_EVENTS_JSON_URL) {
      const res = await fetch(process.env.NEXT_PUBLIC_EVENTS_JSON_URL, { cache: "no-store" })
      if (res.ok) {
        const data = (await res.json()) as HistoricalEvent[]
        return normalizeEvents(data)
      }
    }

    // 3) Try Google Sheets API route if configured
    if (process.env.NEXT_PUBLIC_EVENTS_SHEET_ID) {
      const res = await fetch("/api/events", { cache: "no-store" })
      if (res.ok) {
        const data = (await res.json()) as HistoricalEvent[]
        return normalizeEvents(data)
      }
    }

    // 4) Fallback to bundled base JSON (English)
    const res = await fetch("/events.json", { cache: "no-store" })
    if (res.ok) {
      const data = (await res.json()) as HistoricalEvent[]
      return normalizeEvents(data)
    }

    throw new Error("No event source available")
  } catch (err) {
    console.error("fetchEvents error:", err)
    return []
  }
}

function normalizeEvents(events: any[]): HistoricalEvent[] {
  return (events || [])
    .map((e) => {
      // Parse coordinates array
      const coords = Array.isArray(e.coordinates) 
        ? [Number(e.coordinates[0] ?? 0), Number(e.coordinates[1] ?? 0)] as [number, number]
        : [0, 0] as [number, number]
      
      return {
        id: String(e.id ?? ""),
        title: String(e.title ?? ""),
        year: Number(e.year ?? 0),
        location: String(e.location ?? ""),
        coordinates: coords,
        description: String(e.description ?? ""),
        significance: String(e.significance ?? ""),
        category: (e.category as any) ?? "political",
        image: String(e.image ?? ""),
        detailedDescription: String(e.detailedDescription ?? ""),
      }
    })
    .filter((e) => e.id && e.year && e.coordinates[0] && e.coordinates[1])
    .sort((a, b) => a.year - b.year)
}
