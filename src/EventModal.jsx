import React, { useState, useEffect } from 'react';
import { Plus, X, Globe, MapPin, AlignLeft, Package, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { db } from './db';
import { format, addHours, parse } from 'date-fns';

export default function EventModal({ isOpen, onClose, initialData, entities }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    mode: 'online',
    location: '',
    meetingUrl: '',
    entityId: '',
    materials: '',
    notes: '',
    recurrence: 'none'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.entityId) return;

    const start = parse(formData.startTime, 'HH:mm', new Date());
    const end = parse(formData.endTime, 'HH:mm', new Date());
    const duration = (end - start) / (1000 * 60);

    const event = {
      ...formData,
      entityId: Number(formData.entityId),
      duration,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (initialData?.id) {
      await db.events.update(initialData.id, event);
    } else {
      await db.events.add(event);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background w-full max-w-lg rounded-xl shadow-2xl border overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{initialData?.id ? t('edit_event') : t('create_event')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              required
              placeholder={t('title')}
              className="w-full text-xl font-semibold bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 p-0 pb-1 placeholder:text-muted-foreground/50"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('date')}</label>
              <input
                type="date"
                required
                className="w-full bg-secondary border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="w-24">
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('start_time')}</label>
              <input
                type="time"
                required
                className="w-full bg-secondary border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="w-24">
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('end_time', 'End Time')}</label>
              <input
                type="time"
                required
                className="w-full bg-secondary border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Entity & Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('entity')}</label>
              <select
                required
                className="w-full bg-secondary border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                value={formData.entityId}
                onChange={e => setFormData({ ...formData, entityId: e.target.value })}
              >
                <option value="">{t('select_entity', 'Select Entity')}</option>
                {entities.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('mode')}</label>
              <div className="flex bg-secondary p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'online' })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-all ${formData.mode === 'online' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                >
                  <Globe size={14} /> {t('online')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mode: 'presence' })}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-all ${formData.mode === 'presence' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                >
                  <MapPin size={14} /> {t('presence')}
                </button>
              </div>
            </div>
          </div>

          {/* Location / URL */}
          {formData.mode === 'presence' ? (
            <div className="animate-in fade-in slide-in-from-top-1">
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('location')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <input
                  type="text"
                  required
                  placeholder={t('enter_location', 'Enter location address')}
                  className="w-full bg-secondary border-0 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-1">
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('meeting_url')}</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-secondary border-0 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                  value={formData.meetingUrl}
                  onChange={e => setFormData({ ...formData, meetingUrl: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Materials & Notes */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('materials')}</label>
              <div className="relative">
                <Package className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <textarea
                  rows="2"
                  className="w-full bg-secondary border-0 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-ring resize-none"
                  value={formData.materials}
                  onChange={e => setFormData({ ...formData, materials: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('notes')}</label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                <textarea
                  rows="3"
                  className="w-full bg-secondary border-0 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-ring resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase mb-1 block">{t('recurrence')}</label>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-muted-foreground" />
              <select
                className="flex-1 bg-secondary border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                value={formData.recurrence}
                onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
              >
                <option value="none">{t('none')}</option>
                <option value="daily">{t('daily')}</option>
                <option value="weekly">{t('weekly')}</option>
                <option value="monthly">{t('monthly')}</option>
                <option value="yearly">{t('yearly')}</option>
              </select>
            </div>
          </div>
        </form>

        <div className="p-4 border-t bg-secondary/30 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg font-medium hover:bg-accent transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
