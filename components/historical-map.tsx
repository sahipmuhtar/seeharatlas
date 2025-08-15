"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, MapPin, Calendar, Scroll, Play, Pause, Star, ChevronLeft, ChevronRight, RotateCcw, Info, ZoomIn, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import LanguageSelector from "@/components/language-selector"
import { getTranslation } from "@/lib/translations"
import { fetchEvents, type HistoricalEvent } from "@/lib/events"
import { useIsMobile } from "@/hooks/use-mobile"

// Leaflet map integration
interface LeafletMap {
  setView: (coords: [number, number], zoom: number) => void
  fitBounds: (bounds: [[number, number], [number, number]], options?: any) => void
  remove: () => void
  getZoom: () => number
  on: (event: string, callback: (e?: any) => void) => void
  off: (event: string, callback?: (e?: any) => void) => void
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker
  bindPopup: (content: string) => LeafletMarker
  on: (event: string, callback: (e?: any) => void) => LeafletMarker
  remove: () => void
  getLatLng: () => { lat: number; lng: number }
  getElement: () => HTMLElement | null
  setIcon: (icon: any) => LeafletMarker
}

declare global {
  interface Window {
    L: {
      map: (id: string) => LeafletMap
      tileLayer: (url: string, options: any) => { addTo: (map: LeafletMap) => void }
      marker: (coords: [number, number], options?: any) => LeafletMarker
      divIcon: (options: any) => any
      latLngBounds: (bounds: [number, number][]) => any
    }
  }
}

// Events will be loaded from an external source (Google Sheets / JSON / local file)
// See lib/events.ts for the loading strategy.

export default function HistoricalMap() {
  const isMobile = useIsMobile()
  const [events, setEvents] = useState<HistoricalEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<HistoricalEvent | null>(null)
  const [isTooltipPinned, setIsTooltipPinned] = useState(false)
  const [currentYear, setCurrentYear] = useState<number[]>([])
  const [currentEventId, setCurrentEventId] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoverTooltipPosition, setHoverTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [playbackEventIndex, setPlaybackEventIndex] = useState(0) // This now tracks event ID index (0-31)
  const [userPaused, setUserPaused] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [speed, setSpeed] = useState(3) // Playback speed
  // Default language set to Turkish per requirement
  const [currentLanguage, setCurrentLanguage] = useState("tr")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ [key: string]: LeafletMarker }>({})
  const leafletMapRef = useRef<LeafletMap | null>(null)
  const mapClickHandlerRef = useRef<((e: any) => void) | null>(null)
  const initialHoverShownRef = useRef<boolean>(false)
  const userHasInteractedWithMap = useRef<boolean>(false)

  // Load events on mount
  useEffect(() => {
    let cancelled = false
    fetchEvents(currentLanguage)
      .then((data) => {
        if (cancelled) return
        const sorted = [...data].sort((a, b) => a.year - b.year)
        setEvents(sorted)
        if (sorted.length > 0) {
          // Initialize timeline position to first event
          const firstYear = sorted[0].year
          setCurrentYear([firstYear])
          setPlaybackEventIndex(0)
          // Ensure sidebar starts closed per requirement
          setSidebarOpen(false)
          setSelectedEvent(null)
          // Reset initial hover flag for new language
          initialHoverShownRef.current = false
        }
      })
      .catch((err) => {
        console.error("Failed to load events:", err)
      })
    return () => {
      cancelled = true
    }
  }, [currentLanguage])

  const minYear = events.length ? Math.min(...events.map((e) => e.year)) : 0
  const maxYear = events.length ? Math.max(...events.map((e) => e.year)) : 0

  // Timeline is now based on event IDs (1-32) rather than years
  const eventIds: number[] = events.map((e) => parseInt(e.id)).sort((a, b) => a - b)
  const minEventId = events.length ? Math.min(...eventIds) : 1
  const maxEventId = events.length ? Math.max(...eventIds) : 32
  
  // Show all events initially
  const visibleEvents: HistoricalEvent[] = events
  
  // Current event tracking by ID - prioritize currentEventId for timeline sync
  const currentEvent: HistoricalEvent | undefined = events.find((event) => parseInt(event.id) === currentEventId) || selectedEvent || undefined
  // Get current event index for navigation
  const currentEventIndex = currentEvent ? events.findIndex((e) => e.id === currentEvent.id) : 0

  // Get localized event data
  const getLocalizedEvent = (event: HistoricalEvent) => {
    const rawTranslation = getTranslation(currentLanguage, `events.${event.id}`) as unknown
    if (rawTranslation && typeof rawTranslation === "object" && !Array.isArray(rawTranslation)) {
      const eventTranslation = rawTranslation as Partial<{
        title: string
        description: string
        significance: string
        detailedDescription: string
        location: string
      }>
      return {
        ...event,
        title: eventTranslation.title || event.title,
        description: eventTranslation.description || event.description,
        significance: eventTranslation.significance || event.significance,
        detailedDescription: eventTranslation.detailedDescription || event.detailedDescription,
        location: eventTranslation.location || event.location,
      }
    }
    return event
  }

  // Zoom to specific event location
  const zoomToEvent = useCallback((event: HistoricalEvent) => {
    if (!leafletMapRef.current) return

    try {
      // Zoom to the event location with a higher zoom level for detailed view
      leafletMapRef.current.setView(event.coordinates, 8)

      // Add a brief highlight animation to the marker
      const marker = markersRef.current[event.id]
      if (marker) {
        const markerElement = marker.getElement?.()
        if (markerElement) {
          // Add a temporary highlight class
          markerElement.classList.add("zoom-highlight")
          setTimeout(() => {
            markerElement.classList.remove("zoom-highlight")
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Error zooming to event:", error)
    }
  }, [])

  // Calculate optimal map bounds for visible events
  const calculateMapBounds = ():
    | { bounds: [[number, number], [number, number]] }
    | { center: [number, number]; zoom: number }
    | null => {
  if (visibleEvents.length === 0) return null

    if (visibleEvents.length === 1) {
      return {
        center: visibleEvents[0].coordinates,
        zoom: 6,
      }
    }

  const lats = visibleEvents.map((event: HistoricalEvent) => event.coordinates[0])
  const lngs = visibleEvents.map((event: HistoricalEvent) => event.coordinates[1])

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const latPadding = (maxLat - minLat) * 0.2
    const lngPadding = (maxLng - minLng) * 0.2

    return {
      bounds: [
        [minLat - latPadding, minLng - lngPadding],
        [maxLat + latPadding, maxLng + lngPadding],
      ] as [[number, number], [number, number]],
    }
  }

  // Close hover tooltip when clicking empty areas
  const handleMapClick = useCallback(
    (e: any) => {
      // Check if click was on a marker or empty area
      if (!e.originalEvent?.target?.closest?.(".custom-marker")) {
        setHoveredEvent(null)
        setHoverTooltipPosition(null)
        setIsTooltipPinned(false)
      }

      // Pause playback when map is clicked
      if (isPlaying && !userPaused) {
        setIsPlaying(false)
        setUserPaused(true)
      }
    },
    [isPlaying, userPaused],
  )

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current) {
      // Check if Leaflet is already loaded
      if (window.L) {
        initializeMap()
        return
      }

      // Load Leaflet CSS
      const existingLink = document.querySelector('link[href*="leaflet"]')
      if (!existingLink && document.head) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Load Leaflet JS
      const existingScript = document.querySelector('script[src*="leaflet"]')
      if (!existingScript && document.head) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => {
          // Small delay to ensure Leaflet is fully loaded
          setTimeout(initializeMap, 100)
        }
        script.onerror = () => {
          console.error("Failed to load Leaflet")
        }
        document.head.appendChild(script)
      }
    }

    return () => {
      if (leafletMapRef.current) {
        try {
          if (mapClickHandlerRef.current) {
            leafletMapRef.current.off("click", mapClickHandlerRef.current)
          }
          leafletMapRef.current.remove()
          leafletMapRef.current = null
          setMapLoaded(false)
        } catch (error) {
          console.error("Error cleaning up map:", error)
        }
      }
    }
  }, [])

  const initializeMap = () => {
    if (!window.L || !mapRef.current || leafletMapRef.current) return

    try {
      const map = window.L.map("map").setView([30, 40], 4) as unknown as LeafletMap
      leafletMapRef.current = map

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map)

      // Add map click handler
      mapClickHandlerRef.current = handleMapClick
      map.on("click", handleMapClick)

      // Add user interaction listeners to prevent auto-fitting bounds
      map.on("zoomstart", () => {
        userHasInteractedWithMap.current = true
      })
      map.on("movestart", () => {
        userHasInteractedWithMap.current = true
      })

      setMapLoaded(true)

      // Initialize markers after map is ready
      setTimeout(() => {
        updateMarkers()
      }, 100)
    } catch (error) {
      console.error("Error initializing map:", error)
    }
  }

  const updateMarkers = useCallback(() => {
    if (!leafletMapRef.current || !window.L) return

    console.log("Updating markers. Visible events:", visibleEvents.length, "Current year:", currentYear)

    const map = leafletMapRef.current

    // Only update existing markers' appearance, don't recreate them all
    visibleEvents.forEach((event: HistoricalEvent) => {
      const existingMarker = markersRef.current[event.id]
      if (existingMarker) {
        try {
          const isCurrentEvent = event.year === currentYear[0]
          const isHovered = hoveredEvent?.id === event.id

          // Update marker appearance
          const newIcon = window.L.divIcon({
            className: "custom-marker",
            html: `
              <div class="relative">
                ${isCurrentEvent ? '<div class="absolute inset-0 w-8 h-8 rounded-full bg-amber-400/30 animate-ping -top-1 -left-1"></div>' : ""}
                <div class="w-6 h-6 rounded-full event-marker ${getCategoryColor(event.category)} ${
                  isCurrentEvent ? "scale-125 animate-pulse ring-4 ring-amber-400/50" : ""
                } ${isHovered ? "ring-2 ring-amber-300" : ""}" 
                style="border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; transition: all 0.3s ease;">
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
          
          existingMarker.setIcon(newIcon)
        } catch (error) {
          console.error("Error updating marker appearance:", event.id, error)
        }
      }
    })

    // Only update map bounds on initial load or when specifically needed, not on every hover
    if (!userHasInteractedWithMap.current) {
      const bounds = calculateMapBounds()
      if (bounds) {
        try {
          if ("bounds" in bounds) {
            leafletMapRef.current!.fitBounds(bounds.bounds, {
              padding: [20, 20],
              maxZoom: 8,
            })
          } else {
            leafletMapRef.current!.setView(bounds.center, bounds.zoom)
          }
          userHasInteractedWithMap.current = true
        } catch (error) {
          console.error("Error updating map bounds:", error)
        }
      }
    }
  }, [visibleEvents, currentYear, isPlaying])

  // Force markers to be created immediately when map loads, regardless of other state
  useEffect(() => {
    if (mapLoaded && events.length > 0 && leafletMapRef.current && window.L) {
      console.log("Force creating all markers on map load")
      const map = leafletMapRef.current

      // Clear any existing markers
      Object.values(markersRef.current).forEach((marker) => {
        try {
          marker.remove()
        } catch (error) {
          console.error("Error removing marker:", error)
        }
      })
      markersRef.current = {}

      // Create all markers immediately
      events.forEach((event: HistoricalEvent) => {
        try {
          const marker = window.L.marker(event.coordinates, {
            icon: window.L.divIcon({
              className: "custom-marker",
              html: `
                <div class="relative">
                  <div class="w-6 h-6 rounded-full event-marker ${getCategoryColor(event.category)}" 
                  style="border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; transition: all 0.3s ease;">
                  </div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            }),
          }).addTo(map)

          marker.on("mouseover", (e) => {
            // Only show hover tooltip if tooltip is not pinned
            if (!isTooltipPinned) {
              const markerElement = e.target.getElement?.()
              if (markerElement) {
                const rect = markerElement.getBoundingClientRect()
                setHoveredEvent(event)
                setHoverTooltipPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                })
              }
            }
          })

          marker.on("mouseout", () => {
            // Only hide hover tooltip if tooltip is not pinned
            if (!isTooltipPinned) {
              setTimeout(() => {
                setHoveredEvent(null)
                setHoverTooltipPosition(null)
              }, 100)
            }
          })

          marker.on("click", (e) => {
            e.originalEvent?.stopPropagation()
            const markerElement = e.target.getElement?.()
            if (markerElement) {
              const rect = markerElement.getBoundingClientRect()
              setHoveredEvent(event)
              setHoverTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top,
              })
              setIsTooltipPinned(true)
            }
            
            // Update all timeline states to match clicked event
            setCurrentEventId(parseInt(event.id))
            setCurrentYear([event.year])
            const eventIndex = events.findIndex(e => e.id === event.id)
            if (eventIndex >= 0) {
              setPlaybackEventIndex(eventIndex)
            }
            
            // Open sidebar with clicked event details
            handleEventClick(event)
          })

          markersRef.current[event.id] = marker
          console.log(`Force created marker for event ${event.id}`)
        } catch (error) {
          console.error("Error force creating marker for event:", event.id, error)
        }
      })

      console.log("Force marker creation complete. Total markers:", Object.keys(markersRef.current).length)
    }
  }, [mapLoaded, events])

  // Enhanced playback functionality with proper hover display
  useEffect(() => {
    if (isPlaying && !userPaused) {
      intervalRef.current = setInterval(() => {
        setPlaybackEventIndex((prevIndex) => {
          const nextIndex = prevIndex + 1

          if (nextIndex >= events.length) {
            // End of timeline - reset and start over
            setIsPlaying(false)
            const firstEvent = events[0]
            if (firstEvent) {
              setCurrentEventId(parseInt(firstEvent.id))
              setCurrentYear([firstEvent.year])
            }
            return 0 // Return to first event
          }

          const nextEvent = events[nextIndex]
          if (nextEvent) {
            setCurrentEventId(parseInt(nextEvent.id))
            setCurrentYear([nextEvent.year])

            // Show hover for current event during playback with proper positioning
            if (leafletMapRef.current && mapLoaded) {
              // Wait for markers to be updated
              setTimeout(() => {
                const marker = markersRef.current[nextEvent.id]
                if (marker) {
                  try {
                    const markerElement = marker.getElement?.()
                    if (markerElement) {
                      const rect = markerElement.getBoundingClientRect()
                      if (rect.width > 0 && rect.height > 0) {
                        // Ensure marker is visible
                        setHoveredEvent(nextEvent)
                        setHoverTooltipPosition({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        })
                      }
                    }
                  } catch (error) {
                    console.error("Error showing playback hover:", error)
                  }
                }
              }, 300) // Increased delay to ensure markers are rendered
            }
          }

          return nextIndex
        })
      }, 3000) // Increased to 3 seconds per event for better visibility
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, userPaused, events, mapLoaded])

  useEffect(() => {
    if (mapLoaded) {
      // Force immediate marker update
      console.log("Map loaded, forcing marker update")
      updateMarkers()
    }
  }, [mapLoaded, updateMarkers])

  // Initialize first event display after page load
  useEffect(() => {
    if (mapLoaded && events.length > 0) {
      // Set first event as current if no current year is set
      if (!currentYear.length) {
        const firstEvent = events[0]
        setCurrentYear([firstEvent.year])
        setSelectedEvent(firstEvent)
        setPlaybackEventIndex(0)
      }
      
      // Show initial hover for current event after a delay
      if (!initialHoverShownRef.current) {
        setTimeout(() => {
          const currentEvent = selectedEvent || events.find((e) => currentYear.length && e.year === currentYear[0]) || events[0]
          if (currentEvent) {
            const marker = markersRef.current[currentEvent.id]
            if (marker) {
              try {
                const el = marker.getElement?.()
                if (el) {
                  const rect = el.getBoundingClientRect()
                  if (rect.width > 0 && rect.height > 0) {
                    setHoveredEvent(currentEvent)
                    setHoverTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top })
                    initialHoverShownRef.current = true
                  }
                }
              } catch (err) {
                console.error("Error showing initial hover:", err)
              }
            }
          }
        }, 1000) // Even longer timeout to ensure everything is rendered
      }
    }
  }, [mapLoaded, events])

  // Keep sidebar (detail panel) in sync with current event if it's open
  useEffect(() => {
    if (!sidebarOpen || !events.length || !currentEventId) return
    const current = events.find((e) => parseInt(e.id) === currentEventId)
    if (current && (!selectedEvent || selectedEvent.id !== current.id)) {
      setSelectedEvent(current)
    }
  }, [currentEventId, sidebarOpen, events, selectedEvent])

  const handleEventClick = (event: HistoricalEvent) => {
    setSelectedEvent(event)
    setSidebarOpen(true)
    setHoveredEvent(null)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    setSelectedEvent(null)
  }

  const closeHoverTooltip = () => {
    setHoveredEvent(null)
    setHoverTooltipPosition(null)
    setIsTooltipPinned(false)
  }

  const handleTimelineEventClick = (eventId: string) => {
    // Find the event and its index
    const eventIndex = events.findIndex(e => e.id === eventId)
    const event = events[eventIndex]
    
    if (event && eventIndex >= 0) {
      setCurrentEventId(parseInt(eventId))
      setCurrentYear([event.year])
      setIsPlaying(false)
      setUserPaused(false)
      setPlaybackEventIndex(eventIndex)

      // Update selected event if sidebar is open
      if (sidebarOpen) {
        setSelectedEvent(event)
      }

      // Show hover tooltip for the selected event
      const selectedEvent = event
      if (selectedEvent && leafletMapRef.current) {
        // Wait a bit for markers to update
        setTimeout(() => {
          const marker = markersRef.current[selectedEvent.id]
          if (marker) {
            try {
              const markerElement = marker.getElement?.()
              if (markerElement) {
                const rect = markerElement.getBoundingClientRect()
                setHoveredEvent(selectedEvent)
                setHoverTooltipPosition({
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                })
              }
            } catch (error) {
              console.error("Error showing timeline hover:", error)
            }
          }
        }, 200)
      }
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setUserPaused(true)
    } else {
      setIsPlaying(true)
      setUserPaused(false)

      // If at the end, restart from beginning
      if (playbackEventIndex >= events.length - 1) {
        setPlaybackEventIndex(0)
        setCurrentEventId(parseInt(events[0].id))
        setCurrentYear([events[0].year])
      }
    }
  }

  const handleRestart = () => {
    setIsPlaying(false)
    setUserPaused(false)
    setPlaybackEventIndex(0)
    setCurrentEventId(parseInt(events[0].id))
    setCurrentYear([events[0].year])
    setHoveredEvent(null)
    setHoverTooltipPosition(null)
  }

  const moveToEventIndex = (index: number) => {
    if (index < 0 || index >= events.length) return
    const event = events[index]
    setCurrentEventId(parseInt(event.id))
    setCurrentYear([event.year])
    setPlaybackEventIndex(index)
    setIsPlaying(false)
    setUserPaused(false)

    const targetEvent = event
    if (targetEvent && leafletMapRef.current) {
      setTimeout(() => {
        const marker = markersRef.current[targetEvent.id]
        if (marker) {
          try {
            const markerElement = marker.getElement?.()
            if (markerElement) {
              const rect = markerElement.getBoundingClientRect()
              setHoveredEvent(targetEvent)
              setHoverTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top })
            }
          } catch (error) {
            console.error("Error showing navigation hover:", error)
          }
        }
      }, 200)
    }
  }

  const handlePrevEvent = () => {
    if (events.length === 0) return
    const newIndex = Math.max(currentEventIndex - 1, 0)
    const newEvent = events[newIndex]
    if (newEvent) {
      setCurrentEventId(parseInt(newEvent.id))
      setCurrentYear([newEvent.year])
      setPlaybackEventIndex(newIndex)
      setSelectedEvent(newEvent)
      setHoveredEvent(newEvent)
      
      // Trigger hover tooltip for visual feedback and pin it
      setTimeout(() => {
        const marker = markersRef.current[newEvent.id]
        if (marker && leafletMapRef.current) {
          try {
            const markerElement = marker.getElement?.()
            if (markerElement) {
              const rect = markerElement.getBoundingClientRect()
              setHoverTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top })
              setIsTooltipPinned(true)
            }
          } catch (error) {
            console.error("Error showing navigation hover:", error)
          }
        }
      }, 100)
    }
  }

  const handleNextEvent = () => {
    if (events.length === 0) return
    const newIndex = Math.min(currentEventIndex + 1, events.length - 1)
    const newEvent = events[newIndex]
    if (newEvent) {
      setCurrentEventId(parseInt(newEvent.id))
      setCurrentYear([newEvent.year])
      setPlaybackEventIndex(newIndex)
      setSelectedEvent(newEvent)
      setHoveredEvent(newEvent)
      
      // Trigger hover tooltip for visual feedback and pin it
      setTimeout(() => {
        const marker = markersRef.current[newEvent.id]
        if (marker && leafletMapRef.current) {
          try {
            const markerElement = marker.getElement?.()
            if (markerElement) {
              const rect = markerElement.getBoundingClientRect()
              setHoverTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top })
              setIsTooltipPinned(true)
            }
          } catch (error) {
            console.error("Error showing navigation hover:", error)
          }
        }
      }, 100)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "conquest":
        return "bg-red-500"
      case "cultural":
        return "bg-purple-500"
      case "political":
        return "bg-blue-500"
      case "religious":
        return "bg-green-500"
      case "scientific":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCategoryColorLight = (category: string) => {
    switch (category) {
      case "conquest":
        return "bg-red-100 text-red-800 border-red-200"
      case "cultural":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "political":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "religious":
        return "bg-green-100 text-green-800 border-green-200"
      case "scientific":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Islamic Pattern Overlay */}
  <div className="absolute inset-0 islamic-pattern opacity-20 pointer-events-none z-0" />

      {/* Top Language Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-end">
          <LanguageSelector currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-12 left-0 right-0 z-20 bg-gradient-to-b from-black/95 to-transparent">
        <div className={cn("max-w-7xl mx-auto transition-all duration-700", sidebarOpen ? "mr-[420px]" : "")}>
          <div className="relative h-32 flex items-start justify-start p-6">
            <img
              src="/images/muhammad-calligraphy-header.png"
              alt="Muhammad Calligraphy"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 text-left">
              <h1 className="text-5xl font-bold text-amber-300 mb-2 calligraphy-text drop-shadow-2xl">
                {getTranslation(currentLanguage, "title")}
              </h1>
              <p className="text-amber-100 text-lg font-semibold drop-shadow-lg">
                {getTranslation(currentLanguage, "subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div
        className={cn(
          "absolute top-48 left-4 bottom-40 transition-all duration-700 ease-in-out",
          sidebarOpen ? "right-[420px]" : "right-4",
        )}
      >
        {/* Map Container */}
        <div className="w-full h-full map-container relative z-0">
          <div id="map" ref={mapRef} className="w-full h-full relative overflow-hidden rounded-xl z-0" />

          {/* Map loading overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900 flex items-center justify-center rounded-xl">
              <div className="text-amber-300 text-lg">{getTranslation(currentLanguage, "loadingMap")}</div>
            </div>
          )}

          {/* Playback Overlay */}
          {isPlaying && (
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md rounded-lg px-4 py-2 border-2 border-amber-500/40">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-amber-200 text-sm font-semibold">
                  {getTranslation(currentLanguage, "timelinePlayback")}
                </span>
                <span className="text-amber-400 text-sm">
                  {playbackEventIndex + 1} / {events.length} • {currentYear[0]} CE
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hover Tooltip with Visual Connection */}
      {hoveredEvent && hoverTooltipPosition && (
        <>
          {/* Connection Line */}
          <div
            className="fixed z-[999] pointer-events-none"
            style={{
              left: `${hoverTooltipPosition.x}px`,
              top: `${hoverTooltipPosition.y}px`,
              width: "2px",
              height: "20px",
              background: "linear-gradient(to bottom, rgba(251, 191, 36, 0.8), rgba(251, 191, 36, 0.3))",
              transform: "translateX(-50%)",
            }}
          />

          {/* Tooltip */}
          <div
            className="fixed z-[1000] pointer-events-auto"
            style={{
              left: `${hoverTooltipPosition.x}px`,
              top: `${hoverTooltipPosition.y - 30}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className={cn(
              "event-tooltip rounded-lg p-4 w-80 max-w-sm shadow-2xl relative",
              isTooltipPinned ? "ring-2 ring-amber-400/50" : ""
            )}>
              {/* Tooltip Arrow */}
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid rgba(0, 0, 0, 0.95)",
                }}
              />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge className={cn("text-xs", getCategoryColorLight(hoveredEvent.category))}>
                    {getTranslation(currentLanguage, hoveredEvent.category)}
                  </Badge>
                  <span className="text-amber-400 text-sm font-semibold">{hoveredEvent.year} CE</span>
                </div>
                <Button
                  onClick={closeHoverTooltip}
                  variant="ghost"
                  size="sm"
                  className="text-amber-400 hover:text-amber-300 p-1 h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex items-start space-x-3">
                <img
                  src={hoveredEvent.image || "/placeholder.svg"}
                  alt={getLocalizedEvent(hoveredEvent).title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-amber-200 font-bold text-sm mb-1">{getLocalizedEvent(hoveredEvent).title}</h3>
                  <p className="text-amber-100 text-xs leading-relaxed line-clamp-3">
                    {getLocalizedEvent(hoveredEvent).description}
                  </p>
                  <button
                    onClick={() => handleEventClick(hoveredEvent)}
                    className="mt-2 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center"
                  >
                    {getTranslation(currentLanguage, "readMore")} <ChevronLeft className="w-3 h-3 ml-1 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Right Sidebar */}
      <div
        className={cn(
          "absolute top-0 right-0 w-96 h-full event-sidebar transform transition-transform duration-700 ease-in-out z-40",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {selectedEvent && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-amber-500/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getCategoryColorLight(selectedEvent.category)}>
                      {getTranslation(currentLanguage, selectedEvent.category)}
                    </Badge>
                    <span className="text-amber-400 font-bold">{selectedEvent.year} CE</span>
                  </div>
                  <h2 className="text-2xl font-bold text-amber-200 mb-2">{getLocalizedEvent(selectedEvent).title}</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-100">
                      <MapPin className="w-4 h-4 mr-2" />
                      {getLocalizedEvent(selectedEvent).location}
                    </div>
                    <Button
                      onClick={() => zoomToEvent(selectedEvent)}
                      variant="ghost"
                      size="sm"
                      className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 px-2 py-1"
                      title={
                        currentLanguage === "tr"
                          ? "Konuma yakınlaştır"
                          : currentLanguage === "ar"
                            ? "تكبير الموقع"
                            : "Zoom to location"
                      }
                    >
                      <ZoomIn className="w-4 h-4 mr-1" />
                      <span className="text-xs">
                        {currentLanguage === "tr" ? "Yakınlaştır" : currentLanguage === "ar" ? "تكبير" : "Zoom"}
                      </span>
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={closeSidebar}
                  variant="ghost"
                  size="sm"
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative">
                <img
                  src={selectedEvent.image || "/placeholder.svg"}
                  alt={getLocalizedEvent(selectedEvent).title}
                  className="w-full h-48 rounded-lg object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
                  <Scroll className="w-5 h-5 mr-2" />
                  {getTranslation(currentLanguage, "description")}
                </h4>
                <p className="text-amber-100 leading-relaxed mb-4">{getLocalizedEvent(selectedEvent).description}</p>
                <p className="text-amber-100 leading-relaxed">{getLocalizedEvent(selectedEvent).detailedDescription}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-amber-400 mb-3">
                  {getTranslation(currentLanguage, "historicalSignificance")}
                </h4>
                <p className="text-amber-100 leading-relaxed">{getLocalizedEvent(selectedEvent).significance}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Timeline - Mobile Responsive */}
      <div
        className={cn(
          "absolute z-20 transition-all duration-700",
          isMobile 
            ? "bottom-4 left-4 right-4" 
            : "bottom-20 left-4 right-4",
          sidebarOpen && !isMobile ? "right-[420px]" : "",
        )}
      >
        <div className="max-w-7xl mx-auto">
          <div className={cn(
            "bg-black/80 backdrop-blur-md rounded-lg border border-amber-500/30 shadow-2xl",
            isMobile ? "p-3 space-y-2" : "p-6 space-y-4"
          )}>
            {/* Year Display */}
            <div className={cn(
              "flex items-center justify-between",
              isMobile ? "mb-2" : "mb-4"
            )}>
              <div className="flex items-center space-x-2">
                <Calendar className={cn(
                  "text-amber-400",
                  isMobile ? "w-4 h-4" : "w-5 h-5"
                )} />
                <span className={cn(
                  "font-bold text-amber-300",
                  isMobile ? "text-lg" : "text-2xl"
                )}>{currentYear[0]} CE</span>
              </div>
              {isMobile && (
                <div className="text-right">
                  <div className="text-xs text-amber-200">
                    {playbackEventIndex + 1}/{events.length}
                  </div>
                  {currentEvent && (
                    <div className="text-xs text-amber-300 max-w-24 truncate">
                      {getLocalizedEvent(currentEvent).title}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className={cn(
              "flex items-center gap-3",
              isMobile ? "justify-between" : "justify-center"
            )}>
              <Button
                onClick={handlePrevEvent}
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                disabled={currentEventIndex <= 0 || events.length === 0}
                className={cn(
                  "bg-amber-700/20 hover:bg-amber-700/30 disabled:opacity-40 text-amber-400 border border-amber-700/30",
                  isMobile ? "rounded-full w-10 h-10 p-0" : "rounded-full w-12 h-12 p-0"
                )}
              >
                <ChevronLeft className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleRestart}
                  variant="ghost"
                  size={isMobile ? "sm" : "default"}
                  className={cn(
                    "bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 rounded-full",
                    isMobile ? "w-8 h-8 p-0" : "w-10 h-10 p-0"
                  )}
                >
                  <RotateCcw className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
                </Button>
                
                <Button
                  onClick={handlePlayPause}
                  variant="ghost"
                  size={isMobile ? "sm" : "default"}
                  className={cn(
                    "bg-amber-500/30 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 rounded-full",
                    isMobile ? "w-10 h-10 p-0" : "w-12 h-12 p-0"
                  )}
                >
                  {isPlaying ? (
                    <Pause className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
                  ) : (
                    <Play className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
                  )}
                </Button>
              </div>

              <Button
                onClick={handleNextEvent}
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                disabled={currentEventIndex >= events.length - 1 || events.length === 0}
                className={cn(
                  "bg-amber-700/20 hover:bg-amber-700/30 disabled:opacity-40 text-amber-400 border border-amber-700/30",
                  isMobile ? "rounded-full w-10 h-10 p-0" : "rounded-full w-12 h-12 p-0"
                )}
              >
                <ChevronRight className={cn(isMobile ? "w-4 h-4" : "w-5 h-5")} />
              </Button>
            </div>

            {/* Speed Control - Desktop Only */}
            {!isMobile && (
              <div className="flex items-center justify-center space-x-4">
                <label className="flex items-center space-x-2 text-amber-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Speed:</span>
                </label>
                <Slider
                  value={[speed]}
                  onValueChange={(value) => setSpeed(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-32 cursor-pointer"
                />
                <span className="text-amber-300 text-sm font-medium w-8">{speed}x</span>
              </div>
            )}

            {/* Timeline Slider */}
            <div className="space-y-2">
              <Slider
                value={currentYear}
                onValueChange={(value) => {
                  const targetYear = value[0]
                  const targetEvent = events.find(e => e.year === targetYear)
                  if (targetEvent) {
                    handleTimelineEventClick(targetEvent.id)
                  }
                }}
                max={maxYear}
                min={minYear}
                step={1}
                className="w-full"
              />
              
              {/* Year Range Display */}
              <div className={cn(
                "flex justify-between text-amber-600",
                isMobile ? "text-xs" : "text-sm"
              )}>
                <span>{minYear}</span>
                <span className="text-amber-300 font-bold">{currentYear[0]} CE</span>
                <span>{maxYear}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={cn(
              "bg-amber-900/30 rounded-full overflow-hidden",
              isMobile ? "h-1" : "h-2"
            )}>
              <div
                className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    events.length > 0 ? ((playbackEventIndex + 1) / events.length) * 100 : 0
                  }%`,
                }}
              />
            </div>

            {/* Event Navigation Pills */}
            <div className="overflow-x-auto">
              <div className={cn(
                "flex space-x-1 pb-1 min-w-max",
                isMobile && "justify-center"
              )}>
                {events.map((event: HistoricalEvent, index) => (
                  <button
                    key={event.id}
                    onClick={() => handleTimelineEventClick(event.id)}
                    className={cn(
                      "flex-shrink-0 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center",
                      isMobile ? "w-6 h-6" : "w-8 h-8",
                      parseInt(event.id) === currentEventId
                        ? "bg-amber-400 text-black ring-2 ring-amber-300"
                        : event.year <= currentYear[0]
                          ? "bg-amber-600/60 text-amber-100"
                          : "bg-amber-800/40 text-amber-400 hover:bg-amber-700/60"
                    )}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Event Information - Desktop Only */}
            {!isMobile && currentEvent && (
              <div className="text-center space-y-2 mt-4">
                <h3 className="text-lg font-semibold text-amber-300 drop-shadow-sm">
                  {getLocalizedEvent(currentEvent).title}
                </h3>
                <p className="text-amber-200 text-sm leading-relaxed max-w-3xl mx-auto">
                  {getLocalizedEvent(currentEvent).description}
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-amber-400">
                  <span>Event {playbackEventIndex + 1} of {events.length}</span>
                  <span>•</span>
                  <span>{currentEvent.location}</span>
                  {currentEvent.significance && (
                    <>
                      <span>•</span>
                      <span>{getLocalizedEvent(currentEvent).significance}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 transition-all duration-700",
          sidebarOpen ? "right-[420px]" : "right-0",
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-amber-300/70 text-sm">{getTranslation(currentLanguage, "timelineRestricted")}</p>
          <Link href="/about">
            <Button variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 text-sm">
              <Info className="w-4 h-4 mr-2" />
              {getTranslation(currentLanguage, "aboutSources")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
