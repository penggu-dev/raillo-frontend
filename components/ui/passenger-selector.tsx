"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Plus, Minus, X } from "lucide-react"
import type { PassengerCounts } from "@/types/passengerType"

interface PassengerSelectorProps {
  value: PassengerCounts
  onValueChange: (counts: PassengerCounts) => void
  placeholder: string
  label: string
  simple?: boolean // 간단한 모드 (어른만 선택)
  variant?: "blue" | "white"
}

export function PassengerSelector({ value, onValueChange, placeholder, label, simple = false, variant = "blue" }: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempPassengerCounts, setTempPassengerCounts] = useState<PassengerCounts>(value)

  const passengerTypes = [
    { key: "adult", label: "어른", description: "(13세 이상, 정상가)", min: 1, max: 9 },
    { key: "child", label: "어린이", description: "(6~12세, 40% 할인)", min: 0, max: 9 },
    { key: "infant", label: "유아", description: "(6세 미만, 75% 할인)", min: 0, max: 9 },
    { key: "senior", label: "경로", description: "(65세 이상, 30% 할인)", min: 0, max: 9 },
    { key: "severelydisabled", label: "중증 장애인", description: "(1~3급, 50% 할인)", min: 0, max: 9 },
    { key: "mildlydisabled", label: "경증 장애인", description: "(4~6급, 30% 할인)", min: 0, max: 9 },
    { key: "veteran", label: "국가 유공자", description: "(50% 할인)", min: 0, max: 9 },
  ]

  const simplePassengerTypes = [
    { key: "adult", label: "어른", description: "(13세 이상)", min: 1, max: 9 },
  ]

  const typesToShow = simple ? simplePassengerTypes : passengerTypes

  const updateTempPassengerCount = (type: keyof PassengerCounts, operation: "plus" | "minus") => {
    const passengerType = typesToShow.find((p) => p.key === type)
    if (!passengerType) return

    setTempPassengerCounts((prev) => {
      const newCount =
        operation === "plus" ? Math.min(prev[type] + 1, passengerType.max) : Math.max(prev[type] - 1, passengerType.min)

      return {
        ...prev,
        [type]: newCount,
      }
    })
  }

  const getTotalPassengers = () => {
    return Object.values(value).reduce((sum, count) => sum + count, 0)
  }

  const getPassengerSummary = () => {
    const summary = []
    if (value.adult > 0) summary.push(`어른 ${value.adult}명`)
    if (value.child > 0) summary.push(`어린이 ${value.child}명`)
    if (value.infant > 0) summary.push(`유아 ${value.infant}명`)
    if (value.senior > 0) summary.push(`경로 ${value.senior}명`)
    if (value.severelydisabled > 0) summary.push(`중증장애인 ${value.severelydisabled}명`)
    if (value.mildlydisabled > 0) summary.push(`경증장애인 ${value.mildlydisabled}명`)
    if (value.veteran > 0) summary.push(`국가유공자 ${value.veteran}명`)
    return summary.join(", ")
  }

  const handleOpen = () => {
    setTempPassengerCounts(value)
    setIsOpen(true)
  }

  const handleApply = () => {
    onValueChange(tempPassengerCounts)
    setIsOpen(false)
  }

  const handleClose = () => {
    setTempPassengerCounts(value)
    setIsOpen(false)
  }

  return (
    <>
      <div>
        <label className={`block text-sm font-medium mb-2 ${variant === "blue" ? "text-white" : "text-gray-700"}`}>{label}</label>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal bg-white text-gray-900 hover:bg-gray-50"
          onClick={handleOpen}
          aria-label={`${label} 선택 열기`}
        >
          <Users className="mr-2 h-4 w-4" />
          {getTotalPassengers() > 0 ? `총 ${getTotalPassengers()}명` : placeholder}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 max-h-[90dvh] overflow-hidden [&>button]:hidden flex flex-col">
          <div className="p-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center justify-between">
                <span>{label} 선택</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                  aria-label={`${label} 선택 닫기`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription>여행하실 승객의 인원수를 선택해주세요.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-3">
              {typesToShow.map((passengerType) => (
                <div key={passengerType.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex flex-col">
                    <span className="font-medium">{passengerType.label}</span>
                    {passengerType.description && (
                      <span className="text-sm text-gray-500">{passengerType.description}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTempPassengerCount(passengerType.key as keyof PassengerCounts, "minus")}
                      disabled={tempPassengerCounts[passengerType.key as keyof PassengerCounts] <= passengerType.min}
                      className="h-8 w-8 p-0"
                      aria-label={`${passengerType.label} 인원 감소`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {tempPassengerCounts[passengerType.key as keyof PassengerCounts]}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTempPassengerCount(passengerType.key as keyof PassengerCounts, "plus")}
                      disabled={tempPassengerCounts[passengerType.key as keyof PassengerCounts] >= passengerType.max}
                      className="h-8 w-8 p-0"
                      aria-label={`${passengerType.label} 인원 증가`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex border-t p-4 bg-white shrink-0">
            <Button variant="outline" onClick={handleClose} className="flex-1 mr-2">
              취소
            </Button>
            <Button onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700">
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 
