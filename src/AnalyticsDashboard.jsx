import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { X, Calendar, Clock, Globe, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

const COLORS = ['#1976D2', '#388E3C', '#D32F2F', '#F57C00', '#7B1FA2', '#0097A7', '#C2185B', '#689F38'];

export default function AnalyticsDashboard({ isOpen, onClose, events, entities }) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    if (!events.length) return null;

    // 1. Events per Entity
    const entityData = entities.map(entity => {
      const entityEvents = events.filter(e => e.entityId === entity.id);
      const totalHours = entityEvents.reduce((acc, e) => acc + (e.duration / 60), 0);
      return {
        name: entity.name,
        count: entityEvents.length,
        hours: parseFloat(totalHours.toFixed(1)),
        color: entity.color
      };
    }).filter(d => d.count > 0);

    // 2. Online vs Presence
    const modeData = [
      { name: t('online'), value: events.filter(e => e.mode === 'online').length },
      { name: t('presence'), value: events.filter(e => e.mode === 'presence').length }
    ];

    // 3. Daily Trend (Current Month)
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const trendData = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, 'dd/MM'),
        count: events.filter(e => e.date === dayStr).length
      };
    });

    return { entityData, modeData, trendData, total: events.length };
  }, [events, entities, t]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background w-full max-w-5xl rounded-xl shadow-2xl border flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-primary" size={24} />
            <h2 className="text-xl font-bold">{t('statistics')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {!stats ? (
            <div className="text-center py-20 text-muted-foreground italic">
              {t('no_data_analytics', 'Non ci sono abbastanza dati per generare statistiche.')}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase mb-1">{t('total_events', 'Eventi Totali')}</div>
                  <div className="text-3xl font-bold text-primary">{stats.total}</div>
                </div>
                <div className="bg-green-500/5 p-6 rounded-xl border border-green-500/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase mb-1">{t('total_hours', 'Ore Totali')}</div>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.entityData.reduce((acc, d) => acc + d.hours, 0).toFixed(1)}h
                  </div>
                </div>
                <div className="bg-purple-500/5 p-6 rounded-xl border border-purple-500/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase mb-1">{t('online_ratio', 'Online')}</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round((stats.modeData[0].value / stats.total) * 100)}%
                  </div>
                </div>
                <div className="bg-orange-500/5 p-6 rounded-xl border border-orange-500/10">
                  <div className="text-muted-foreground text-xs font-semibold uppercase mb-1">{t('presence_ratio', 'In Presenza')}</div>
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round((stats.modeData[1].value / stats.total) * 100)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution by Entity */}
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                    <Calendar size={16} /> {t('distribution_by_entity', 'Distribuzione per Ente')}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.entityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {stats.entityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Hours by Entity */}
                <div className="bg-background border rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                    <Clock size={16} /> {t('hours_by_entity', 'Ore allocate per Ente')}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.entityData}
                          dataKey="hours"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.entityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="bg-background border rounded-xl p-6 shadow-sm lg:col-span-2">
                  <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                    <Calendar size={16} /> {t('monthly_trend', 'Andamento Mensile')}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" fontSize={10} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { BarChart3 } from 'lucide-react';
