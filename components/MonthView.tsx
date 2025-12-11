import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { CalendarEvent, MonthTheme } from '../types';

interface MonthViewProps {
  monthDate: Date;
  theme: MonthTheme;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ monthDate, theme, events, onDateClick }) => {
  const startDate = startOfWeek(startOfMonth(monthDate));
  const endDate = endOfWeek(endOfMonth(monthDate));
  
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to check if a day has any occupancy
  const getDayOccupancy = (day: Date) => {
    const dayStart = startOfDay(day);
    return events.filter(event => {
      const start = startOfDay(parseISO(event.fromDate));
      const end = startOfDay(parseISO(event.toDate));
      return isWithinInterval(dayStart, { start, end });
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      {/* Month Header */}
      <div className={`${theme.headerBg} p-4 text-center`}>
        <h2 className={`text-xl font-bold ${theme.headerText} tracking-wide`}>
          {format(monthDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Days of Week */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {days.map((day) => {
            const dayEvents = getDayOccupancy(day);
            const isCurrentMonth = isSameMonth(day, monthDate);
            const isDayToday = isToday(day);
            const hasEvents = dayEvents.length > 0;
            
            // Determine styling based on occupancy and current day
            let bgClass = !isCurrentMonth ? 'bg-slate-50/50' : 'bg-white';
            let textClass = !isCurrentMonth ? 'text-slate-300' : 'text-slate-700';
            
            if (hasEvents && isCurrentMonth) {
              bgClass = 'bg-red-50'; // Red background for occupied days
              textClass = 'text-red-600 font-semibold'; // Red text
            }

            return (
              <button
                key={day.toString()}
                onClick={() => onDateClick(day)}
                className={`
                  relative rounded-lg p-1 flex flex-col items-center justify-start min-h-[50px]
                  transition-all duration-200 group border border-transparent
                  ${bgClass} ${textClass}
                  ${isDayToday ? `ring-2 ${theme.todayRing} z-10` : ''}
                  ${isCurrentMonth && !isDayToday && !hasEvents ? theme.dayHover : ''}
                  ${hasEvents && isCurrentMonth ? 'hover:bg-red-100 border-red-100' : ''}
                `}
              >
                <span className={`
                  text-sm w-7 h-7 flex items-center justify-center rounded-full mb-1
                  ${isDayToday ? `${theme.accentColor} text-white font-bold` : ''}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Event Indicators (Dots per room) */}
                <div className="flex gap-1 justify-center px-1 w-full h-2">
                   {hasEvents && (
                     <div className="flex gap-0.5">
                       {/* Show a small dot for each occupied room */}
                       {dayEvents.map((e, i) => (
                         <div key={e.id} className="w-1.5 h-1.5 rounded-full bg-red-400" title={`Room ${e.roomNumber}`} />
                       ))}
                     </div>
                   )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthView;