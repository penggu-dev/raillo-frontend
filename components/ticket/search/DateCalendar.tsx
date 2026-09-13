"use client";

import { format, isBefore, isSameDay, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarInfo } from "@/types/trainType";

interface DateCalendarProps {
  tempDate: Date;
  setTempDate: (date: Date) => void;
  setSelectedHour: (hour: string) => void;
  calendarData: CalendarInfo[];
  isLoading: boolean;
  today: Date;
  maxAvailableDate: Date;
  isDateSelectable: (date: Date) => boolean;
}

export function DateCalendar({
  tempDate,
  setTempDate,
  setSelectedHour,
  calendarData,
  isLoading,
  today,
  maxAvailableDate,
  isDateSelectable,
}: DateCalendarProps) {
  const updateMonthAndHour = (newDate: Date) => {
    setTempDate(newDate);
    const now = new Date();
    const isToday =
      newDate.getDate() === now.getDate() &&
      newDate.getMonth() === now.getMonth() &&
      newDate.getFullYear() === now.getFullYear();
    setSelectedHour(
      isToday
        ? now.getHours().toString().padStart(2, "0") + "시"
        : "00시",
    );
  };

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
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      const dateStr = format(currentDate, "yyyy-MM-dd");
      const calendarItem = calendarData.find((item) => item.operationDate === dateStr);
      const isHoliday = calendarItem?.isHoliday === "Y";

      days.push(
        <button
          key={i}
          onClick={() => {
            if (isSelectable && isCurrentMonth) {
              updateMonthAndHour(new Date(currentDate));
            }
          }}
          disabled={!isSelectable || !isCurrentMonth}
          aria-label={`${format(currentDate, "yyyy년 MM월 dd일")} 날짜 선택`}
          className={`
            p-2 text-sm transition-colors relative h-9
            ${
              isCurrentMonth
                ? isSelected
                  ? "bg-primary text-primary-foreground font-semibold"
                  : isHoliday
                    ? isSelectable
                      ? "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      : "text-red-300 dark:text-red-400/40 cursor-not-allowed"
                    : isSelectable
                      ? isToday
                        ? "bg-secondary text-secondary-foreground font-semibold hover:bg-primary hover:text-primary-foreground"
                        : isWeekend
                          ? currentDate.getDay() === 0
                            ? "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            : "text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                          : "text-foreground hover:bg-muted"
                      : "text-muted-foreground opacity-40 cursor-not-allowed"
                : "text-muted-foreground opacity-40"
            }
          `}
        >
          {currentDate.getDate()}
        </button>,
      );
    }

    return days;
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <button
          className="p-2 hover:bg-muted rounded disabled:opacity-50"
          aria-label="이전 달로 이동"
          onClick={() => {
            const prevMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() - 1, 1);
            updateMonthAndHour(prevMonth);
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
            <p className="text-xs text-muted-foreground mt-1">
              예약 가능: {format(today, "MM/dd")} ~ {format(maxAvailableDate, "MM/dd")}
            </p>
          )}
        </div>
        <button
          className="p-2 hover:bg-muted rounded disabled:opacity-50"
          aria-label="다음 달로 이동"
          onClick={() => {
            const nextMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1);
            updateMonthAndHour(nextMonth);
          }}
          disabled={isBefore(
            maxAvailableDate,
            new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1),
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-muted">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
          <div
            key={day}
            className={`p-2 text-center text-sm font-medium h-9 flex items-center justify-center ${
              index === 0 ? "text-red-500 dark:text-red-400" : index === 6 ? "text-blue-500 dark:text-blue-400" : "text-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 border rounded-lg overflow-hidden bg-card">
        {generateCalendarDays()}
      </div>
    </div>
  );
}
