"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format, addMonths, startOfDay, isBefore, isSameDay, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, X, Clock } from "lucide-react";
import { DateCalendar } from "@/components/ticket/search/DateCalendar";
import { getCalendar } from "@/lib/api/trains";
import type { CalendarInfo } from "@/types/trainType";

// 캐시 유효 시간 (5분)
const CALENDAR_STALE_TIME = 5 * 60 * 1000;

// 시간 옵션 (00시 ~ 23시) — 렌더와 무관한 상수
const HOUR_OPTIONS = Array.from(
  { length: 24 },
  (_, i) => i.toString().padStart(2, "0") + "시",
);

interface DateTimeSelectorProps {
  value: Date | undefined;
  onValueChange: (date: Date) => void;
  placeholder: string;
  label: string;
  variant?: "blue" | "white";
}

export function DateTimeSelector({
  value,
  onValueChange,
  placeholder,
  label,
  variant = "blue",
}: DateTimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  const [selectedHour, setSelectedHour] = useState<string>(
    value
      ? value.getHours().toString().padStart(2, "0") + "시"
      : new Date().getHours().toString().padStart(2, "0") + "시",
  );
  const { data: calendarData = [], isLoading } = useQuery<CalendarInfo[]>({
    queryKey: ["calendar"],
    queryFn: () => getCalendar(),
    staleTime: CALENDAR_STALE_TIME,
  });

  // 오늘 날짜 (시간 제외)
  const today = startOfDay(new Date());

  // API에서 가져온 최대 날짜 (운행 가능한 마지막 날짜)
  const maxAvailableDate = useMemo(() => {
    return calendarData.length > 0
      ? parseISO(calendarData[calendarData.length - 1].operationDate)
      : addMonths(today, 1); // 기본값으로 한 달 후
  }, [calendarData, today]);


  // 현재 시간이 선택된 날짜의 과거인지 확인
  const isPastTime = useCallback((date: Date, hour: string) => {
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(parseInt(hour), 0, 0, 0);
    const now = new Date();
    // '지금 시간'은 선택 가능하게 (같은 시각은 true)
    const nowHourDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      0,
      0,
      0,
    );
    return selectedDateTime < nowHourDate;
  }, []);

  // 날짜 선택 가능 여부 확인
  const isDateSelectable = useCallback(
    (date: Date) => {
      // 오늘 이후이고 최대 운행 가능 날짜 이전인지 확인
      const isInRange =
        !isBefore(date, today) && !isBefore(maxAvailableDate, date);

      // API 데이터가 있으면 해당 날짜가 운행 가능한지도 확인
      if (calendarData.length > 0) {
        const dateStr = format(date, "yyyy-MM-dd");
        const calendarItem = calendarData.find(
          (item) => item.operationDate === dateStr,
        );
        return isInRange && calendarItem?.isBookingAvailable === "Y";
      }

      return isInRange;
    },
    [calendarData, today, maxAvailableDate],
  );

  // 시간 선택 가능 여부 확인
  const isHourSelectable = useCallback(
    (hour: string) => {
      if (isSameDay(tempDate, today)) {
        return !isPastTime(tempDate, hour);
      }
      return true;
    },
    [tempDate, today, isPastTime],
  );

  const handleApply = () => {
    const selectedDateTime = new Date(tempDate);
    selectedDateTime.setHours(parseInt(selectedHour), 0, 0, 0);
    onValueChange(selectedDateTime);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    // 원래 값으로 복원
    setTempDate(value || new Date());
    setSelectedHour(
      value
        ? value.getHours().toString().padStart(2, "0") + "시"
        : new Date().getHours().toString().padStart(2, "0") + "시",
    );
  };

  const hourRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const idx = HOUR_OPTIONS.findIndex((h) => h === selectedHour);
        const btn = hourRefs.current[idx];
        const container = scrollContainerRef.current;
        if (btn && container) {
          const left =
            btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
          container.scrollTo({ left });
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const idx = HOUR_OPTIONS.findIndex((h) => h === selectedHour);
      const btn = hourRefs.current[idx];
      const container = scrollContainerRef.current;
      if (btn && container) {
        const left =
          btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
        container.scrollTo({ left });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHour]);

  // value가 변경될 때 tempDate 초기화
  useEffect(() => {
    if (value) {
      setTempDate(value);
      setSelectedHour(value.getHours().toString().padStart(2, "0") + "시");
    }
  }, [value]);

  return (
    <>
      <div>
        <label
          className={`block text-sm font-medium mb-2 ${
            variant === "blue" ? "text-white" : "text-gray-700"
          }`}
        >
          {label}
        </label>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal bg-white text-gray-900 hover:bg-gray-50"
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "MM/dd HH시", { locale: ko }) : placeholder}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 max-h-[90vh] overflow-hidden [&>button]:hidden">
          <div className="p-4 border-b">
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>날짜 선택</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-10 w-10 p-0 hover:bg-gray-100"
                aria-label="날짜 선택 닫기"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
          </div>

          <div className="p-4 max-h-[calc(90vh-140px)] overflow-y-auto">
            {/* 선택된 날짜/시간 표시 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 text-center border border-blue-100">
              <div className="text-lg font-semibold text-gray-800 mb-2">
                {format(tempDate, "yyyy년 MM월 dd일(E)", { locale: ko })}
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Clock className="h-3 w-3 mr-1" />
                {selectedHour} 출발
              </div>
            </div>

            {/* 달력 */}
            <DateCalendar
              tempDate={tempDate}
              setTempDate={setTempDate}
              setSelectedHour={setSelectedHour}
              calendarData={calendarData}
              isLoading={isLoading}
              today={today}
              maxAvailableDate={maxAvailableDate}
              isDateSelectable={isDateSelectable}
            />

            {/* 시간 선택 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-3">시간 선택</h4>
              <div className="w-full overflow-x-auto" ref={scrollContainerRef}>
                <div className="flex gap-2 min-w-max pb-2">
                  {HOUR_OPTIONS.map((hour, idx) => (
                    <Button
                      key={hour}
                      ref={(el) => {
                        hourRefs.current[idx] = el;
                      }}
                      variant={selectedHour === hour ? "default" : "outline"}
                      size="sm"
                      className={`text-sm py-1 px-2 h-8 min-w-[50px] ${
                        selectedHour === hour ? "bg-blue-600" : ""
                      } ${
                        !isHourSelectable(hour)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => {
                        if (isHourSelectable(hour)) {
                          setSelectedHour(hour);
                        }
                      }}
                      disabled={!isHourSelectable(hour)}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-t p-4 bg-white">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 mr-2"
            >
              취소
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
