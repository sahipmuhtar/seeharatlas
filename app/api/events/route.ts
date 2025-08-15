import { NextResponse } from "next/server"

// Google Sheets -> JSON bridge using gviz endpoint
// Configure:
//  - NEXT_PUBLIC_EVENTS_SHEET_ID: Spreadsheet ID
//  - NEXT_PUBLIC_EVENTS_SHEET_GID: Worksheet gid (default: 0)
export async function GET() {
  const id = process.env.NEXT_PUBLIC_EVENTS_SHEET_ID
  const gid = process.env.NEXT_PUBLIC_EVENTS_SHEET_GID || "0"

  if (!id) {
    return NextResponse.json({ error: "Sheet ID not configured" }, { status: 400 })
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&gid=${gid}`
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`Google Sheets responded ${res.status}`)
    const text = await res.text()

    // gviz wraps JSON in a function call; extract the JSON body
    const firstBrace = text.indexOf("{")
    const lastBrace = text.lastIndexOf("}")
    const json = JSON.parse(text.slice(firstBrace, lastBrace + 1))
    const table = json.table
    const labels: string[] = (table.cols || []).map((c: any) => c.label?.trim() || "")

    const rows = (table.rows || []).map((r: any) => {
      const obj: Record<string, any> = {}
      r.c?.forEach((cell: any, idx: number) => {
        const key = labels[idx] || `col_${idx}`
        obj[key] = cell?.v ?? ""
      })
      return obj
    })

    // Normalize to HistoricalEvent shape (best-effort; client also normalizes)
  const data = rows.map((r: any) => ({
      id: String(r.id ?? r.ID ?? r.Id ?? r["event_id"] ?? ""),
      title: String(r.title ?? r.Title ?? ""),
      year: Number(r.year ?? r.Year ?? 0),
      location: String(r.location ?? r.Location ?? ""),
      coordinates: [Number(r.lat ?? r.latitude ?? r.Lat ?? 0), Number(r.lng ?? r.longitude ?? r.Lng ?? 0)] as [
        number,
        number,
      ],
      description: String(r.description ?? r.Description ?? ""),
      significance: String(r.significance ?? r.Significance ?? ""),
      category: String(r.category ?? r.Category ?? "religious"),
      image: String(r.image ?? r.Image ?? ""),
      detailedDescription: String(r.detailedDescription ?? r["detailed_description"] ?? r["Detailed Description"] ?? ""),
    }))

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("/api/events error", err)
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}
