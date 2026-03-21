"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  format,
  addMonths,
  startOfDay,
  isBefore,
  isSameDay,
  parseISO,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { getCalendar } from "@/lib/api/trains";
import type { CalendarInfo } from "@/types/trainType";

// 캐시 유효 시간 (5분)
const CALENDAR_STALE_TIME = 5 * 60 * 1000;

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

  // 시간 옵션 (00시 ~ 23시)
  const hourOptions = Array.from(
    { length: 24 },
    (_, i) => i.toString().padStart(2, "0") + "시",
  );

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

  // 달력 그리드 생성
  const generateCalendarDays = () => {
    const year = tempDate.getFullYear();
    const month = tempDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = isSameDay(currentDate, today);
      const isSelected = isSameDay(currentDate, tempDate);
      const isSelectable = isDateSelectable(currentDate);
      const isWeekend =
        currentDate.getDay() === 0 || currentDate.getDay() === 6;

      // API 데이터에서 해당 날짜의 정보 가져오기
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const calendarItem = calendarData.find(
        (item) => item.operationDate === dateStr,
      );
      const isHoliday = calendarItem?.isHoliday === "Y";
      const isBookingAvailable = calendarItem?.isBookingAvailable === "Y";

      days.push(
        <button
          key={i}
          onClick={() => {
            if (isSelectable && isCurrentMonth) {
              setTempDate(new Date(currentDate));
              // 오늘 날짜 선택 시 현재 시간으로, 다른 날짜 선택 시 00시로 설정
              const now = new Date();
              const isToday =
                currentDate.getDate() === now.getDate() &&
                currentDate.getMonth() === now.getMonth() &&
                currentDate.getFullYear() === now.getFullYear();
              if (isToday) {
                setSelectedHour(
                  now.getHours().toString().padStart(2, "0") + "시",
                );
              } else {
                setSelectedHour("00시");
              }
            }
          }}
          disabled={!isSelectable || !isCurrentMonth}
          aria-label={`${format(currentDate, "yyyy년 MM월 dd일")} 날짜 선택`}
          className={`
            p-2 text-sm transition-colors relative h-9
            ${
              isCurrentMonth
                ? isSelected
                  ? "bg-blue-600 text-white font-semibold"
                  : isHoliday
                    ? isSelectable
                      ? "text-red-500 hover:bg-red-50"
                      : "text-red-300 cursor-not-allowed"
                    : isSelectable
                      ? isToday
                        ? "bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200"
                        : isWeekend
                          ? currentDate.getDay() === 0
                            ? "text-red-500 hover:bg-red-50"
                            : "text-blue-500 hover:bg-blue-50"
                          : "text-gray-900 hover:bg-gray-100"
                      : "text-gray-300 cursor-not-allowed"
                : "text-gray-300"
            }
          `}
        >
          {currentDate.getDate()}
        </button>,
      );
    }

    return days;
  };

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
        const idx = hourOptions.findIndex((h) => h === selectedHour);
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
      const idx = hourOptions.findIndex((h) => h === selectedHour);
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
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                  aria-label="이전 달로 이동"
                  onClick={() => {
                    const prevMonth = new Date(
                      tempDate.getFullYear(),
                      tempDate.getMonth() - 1,
                      1,
                    );
                    setTempDate(prevMonth);
                    // 월 변경 시 오늘 날짜면 현재 시간으로, 아니면 00시로 설정
                    const now = new Date();
                    const isToday =
                      prevMonth.getDate() === now.getDate() &&
                      prevMonth.getMonth() === now.getMonth() &&
                      prevMonth.getFullYear() === now.getFullYear();
                    if (isToday) {
                      setSelectedHour(
                        now.getHours().toString().padStart(2, "0") + "시",
                      );
                    } else {
                      setSelectedHour("00시");
                    }
                  }}
                  disabled={
                    tempDate.getMonth() === today.getMonth() &&
                    tempDate.getFullYear() === today.getFullYear()
                  }
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <h3 className="text-lg font-bold">
                    {format(tempDate, "yyyy. MM.", { locale: ko })}
                  </h3>
                  {!isLoading && calendarData.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      예약 가능: {format(today, "MM/dd")} ~{" "}
                      {format(maxAvailableDate, "MM/dd")}
                    </p>
                  )}
                </div>
                <button
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                  aria-label="다음 달로 이동"
                  onClick={() => {
                    const nextMonth = new Date(
                      tempDate.getFullYear(),
                      tempDate.getMonth() + 1,
                      1,
                    );
                    setTempDate(nextMonth);
                    // 월 변경 시 오늘 날짜면 현재 시간으로, 아니면 00시로 설정
                    const now = new Date();
                    const isToday =
                      nextMonth.getDate() === now.getDate() &&
                      nextMonth.getMonth() === now.getMonth() &&
                      nextMonth.getFullYear() === now.getFullYear();
                    if (isToday) {
                      setSelectedHour(
                        now.getHours().toString().padStart(2, "0") + "시",
                      );
                    } else {
                      setSelectedHour("00시");
                    }
                  }}
                  disabled={isBefore(
                    maxAvailableDate,
                    new Date(
                      tempDate.getFullYear(),
                      tempDate.getMonth() + 1,
                      1,
                    ),
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 bg-gray-50">
                {["일", "월", "화", "수", "목", "금", "토"].map(
                  (day, index) => (
                    <div
                      key={day}
                      className={`p-2 text-center text-sm font-medium h-9 flex items-center justify-center ${
                        index === 0
                          ? "text-red-500"
                          : index === 6
                            ? "text-blue-500"
                            : "text-gray-700"
                      }`}
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* 달력 그리드 */}
              <div className="grid grid-cols-7 border rounded-lg overflow-hidden bg-white">
                {generateCalendarDays()}
              </div>
            </div>

            {/* 시간 선택 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-3">시간 선택</h4>
              <div className="w-full overflow-x-auto" ref={scrollContainerRef}>
                <div className="flex gap-2 min-w-max pb-2">
                  {hourOptions.map((hour, idx) => (
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
