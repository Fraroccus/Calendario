import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMinutes,
  addDays,
  startOfDay,
  eachHourOfInterval,
  isSameMonth
} from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { clsx } from 'clsx';
import useStore from './store';

export default function CalendarGrid({ events, onSlotClick, onEventClick, entities }) {
  const { currentDate, view, language } = useStore();
  const locale = language === 'it' ? it : enUS;

  const hours = eachHourOfInterval({
    start: startOfDay(currentDate),
    end: addMinutes(startOfDay(currentDate), 23 * 60 + 59)
  });

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 h-full">
        {['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold uppercase text-muted-foreground border-b border-r last:border-r-0">
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(parseDate(e.date), day));
          return (
            <div 
              key={i} 
              onClick={() => onSlotClick(day, '09:00')}
              className={clsx(
                "min-h-[120px] p-2 border-b border-r last:border-r-0 hover:bg-accent/30 transition-colors cursor-pointer relative",
                !isSameMonth(day, monthStart) && "bg-secondary/10 text-muted-foreground"
              )}
            >
              <div className={clsx(
                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                isToday(day) && "bg-primary text-primary-foreground"
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1 overflow-hidden">
                {dayEvents.slice(0, 4).map(event => {
                  const entity = entities.find(ent => ent.id === event.entityId);
                  return (
                    <div 
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate text-white shadow-sm"
                      style={{ backgroundColor: entity?.color || '#94a3b8' }}
                    >
                      {event.startTime} {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 4 && (
                  <div className="text-[10px] text-muted-foreground pl-1">
                    + {dayEvents.length - 4} altri
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTimelineView = (daysCount) => {
    const startDate = daysCount === 1 ? currentDate : startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ 
      start: startDate, 
      end: addDays(startDate, daysCount - 1) 
    });

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex border-b">
          <div className="w-16 border-r shrink-0" />
          <div className="flex-1 grid grid-cols-7" style={{ gridTemplateColumns: `repeat(${daysCount}, 1fr)` }}>
            {weekDays.map(day => (
              <div key={day.toString()} className="py-3 text-center border-r last:border-r-0">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  {format(day, 'EEE', { locale })}
                </div>
                <div className={clsx(
                  "text-xl font-bold inline-flex items-center justify-center w-8 h-8 rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline body */}
        <div className="flex-1 overflow-auto flex relative">
          {/* Time gutter */}
          <div className="w-16 border-r bg-background sticky left-0 z-10">
            {hours.map(hour => (
              <div key={hour.toString()} className="h-20 text-[10px] text-muted-foreground text-center -mt-2 pr-2">
                {format(hour, 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Slots grid */}
          <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${daysCount}, 1fr)` }}>
            {weekDays.map(day => (
              <div key={day.toString()} className="relative border-r last:border-r-0">
                {hours.map(hour => (
                  <div 
                    key={hour.toString()} 
                    onClick={() => onSlotClick(day, format(hour, 'HH:mm'))}
                    className="h-20 border-b border-dashed border-muted/50 hover:bg-accent/20 transition-colors cursor-pointer"
                  />
                ))}
                {/* Events overlay */}
                {events.filter(e => isSameDay(parseDate(e.date), day)).map(event => {
                  const entity = entities.find(ent => ent.id === event.entityId);
                  const startHour = parseInt(event.startTime.split(':')[0]);
                  const startMin = parseInt(event.startTime.split(':')[1]);
                  const top = (startHour * 80) + (startMin / 60 * 80);
                  const height = (event.duration / 60) * 80;

                  return (
                    <div 
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className="absolute left-1 right-2 rounded-md p-2 text-white text-xs shadow-md border border-white/20 cursor-pointer overflow-hidden group"
                      style={{ 
                        top: `${top}px`, 
                        height: `${height}px`,
                        backgroundColor: entity?.color || '#94a3b8',
                        zIndex: 5
                      }}
                    >
                      <div className="font-bold truncate">{event.title}</div>
                      <div className="text-[10px] opacity-90">{event.startTime} - {event.endTime}</div>
                      <div className="mt-1 text-[10px] italic line-clamp-2">{event.notes}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const parseDate = (dateStr) => {
    return new Date(dateStr);
  };

  return (
    <div className="h-full bg-background rounded-xl border shadow-sm overflow-hidden">
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderTimelineView(7)}
      {view === 'day' && renderTimelineView(1)}
    </div>
  );
}
