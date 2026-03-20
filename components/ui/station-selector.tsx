"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search, MapPin, X, Clock, ArrowRight } from "lucide-react"
import { STATIONS, stationUtils } from "@/lib/api/trains"
import type { Station } from "@/types/trainType"

interface StationSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  label: string
  variant?: "blue" | "white"
  otherStation?: string // 다른 역 (출발역이면 도착역, 도착역이면 출발역)
  onBothStationsChange?: (departure: string, arrival: string) => void // 두 역을 동시에 변경할 때
  disabled?: boolean // 비활성화 여부
  hideHistory?: boolean // 검색 기록 숨기기
}

interface SearchHistory {
  departure: string
  arrival: string
  timestamp: number
}

const SEARCH_HISTORY_KEY = "rail-o-search-history"
const MAX_HISTORY_ITEMS = 3

export function StationSelector({ 
  value, 
  onValueChange, 
  placeholder, 
  label, 
  variant = "blue",
  otherStation = "",
  onBothStationsChange,
  disabled,
  hideHistory = false
}: StationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStations, setFilteredStations] = useState<Station[]>(STATIONS)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])

  // 검색 기록 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory) as SearchHistory[]
        setSearchHistory(history.slice(0, MAX_HISTORY_ITEMS))
      } catch (error) {
        console.error('검색 기록 로드 실패:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStations(STATIONS)
    } else {
      const filtered = stationUtils.searchStations(searchTerm)
      setFilteredStations(filtered)
    }
  }, [searchTerm])

  const handleStationSelect = (station: Station) => {
    onValueChange(station.name)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleHistorySelect = (history: SearchHistory) => {
    if (onBothStationsChange) {
      // 두 역을 동시에 변경
      onBothStationsChange(history.departure, history.arrival)
    } else {
      // 현재 선택하는 역만 변경
      onValueChange(label === "출발역" ? history.departure : history.arrival)
    }
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClose = () => {
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <>
      <div>
        <label className={`block text-sm font-medium mb-2 ${variant === "blue" ? "text-white" : "text-gray-700"}`}>{label}</label>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal bg-white text-gray-900 hover:bg-gray-50"
          onClick={() => setIsOpen(true)}
          disabled={disabled}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 max-h-[80vh] overflow-hidden [&>button]:hidden">
          <div className="p-4 border-b">
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{label} 선택</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-10 w-10 p-0 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
          </div>

          <div className="p-4">
            {/* 검색 입력 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="역명을 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {/* 최근 검색 기록 */}
            {!hideHistory && searchHistory.length > 0 && (
              <div className="mb-4">
                <div className="space-y-2">
                  {searchHistory.map((history, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistorySelect(history)}
                      className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-900">{history.departure}</span>
                        <ArrowRight className="h-3 w-3 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{history.arrival}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 역 목록 */}
            <div className="h-[400px] overflow-y-auto">
              {filteredStations.length > 0 ? (
                <div className="space-y-1">
                  {filteredStations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleStationSelect(station)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                    >
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{station.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 