import React, { useState, useEffect, Suspense } from 'react';
import { 
  Calendar as CalendarIcon, 
  Settings, 
  BarChart3, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStore from './store';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import EventModal from './EventModal';
import CalendarGrid from './CalendarGrid';
import AnalyticsDashboard from './AnalyticsDashboard';

function App() {
  const [bootError, setBootError] = useState(null);
  const { t, i18n } = useTranslation();
  
  const store = useStore();
  
  useEffect(() => {
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      setBootError(`${msg} at line ${lineNo}`);
      return false;
    };
  }, []);

  if (bootError) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-50 p-4 text-center">
        <div>
          <h1 className="text-red-600 font-bold mb-2">Critical Error</h1>
          <p className="text-sm text-gray-700">{bootError}</p>
        </div>
      </div>
    );
  }
  
  // Basic rendering if i18n is not ready
  if (!i18n.isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  const { 
    currentDate, 
    setCurrentDate, 
    view, 
    setView, 
    theme, 
    setTheme,
    language,
    setLanguage,
    selectedEntities,
    toggleEntityFilter
  } = store;

  const [showEventModal, setShowEventModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const entities = useLiveQuery(() => db.entities.toArray()) || [];
  const allEvents = useLiveQuery(() => db.events.toArray()) || [];

  // Load persistence settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await db.settings.get('theme');
        const savedLang = await db.settings.get('language');
        
        if (savedTheme) setTheme(savedTheme.value);
        if (savedLang) {
          setLanguage(savedLang.value);
          i18n.changeLanguage(savedLang.value);
        }
        const savedNotifs = await db.settings.get('notifications');
        if (savedNotifs) setNotificationsEnabled(savedNotifs.value);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  // Notification logic
  useEffect(() => {
    if (!notificationsEnabled) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      allEvents.forEach(event => {
        const eventDate = new Date(`${event.date}T${event.startTime}`);
        const diffMs = eventDate - now;
        const diffMins = Math.floor(diffMs / 60000);

        // Notify 30 minutes before
        if (diffMins === 30) {
          const entity = entities.find(e => e.id === event.entityId);
          new Notification(event.title, {
            body: `${event.startTime} - ${entity?.name || ''}`,
            icon: '/vite.svg'
          });
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [allEvents, notificationsEnabled, entities]);

  const filteredEvents = allEvents.filter(event => {
    const matchesEntity = selectedEntities.length === 0 || selectedEntities.includes(event.entityId);
    const matchesSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.notes && event.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesEntity && matchesSearch;
  });

  const locale = language === 'it' ? it : enUS;

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleSlotClick = (date, time) => {
    const [hours, mins] = time.split(':');
    const start = time;
    const end = `${String(Number(hours) + 1).padStart(2, '0')}:${mins}`;
    
    setEditingEvent({
      date: format(date, 'yyyy-MM-dd'),
      startTime: start,
      endTime: end
    });
    setShowEventModal(true);
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  // Initialize store with all entities on first load if none selected
  useEffect(() => {
    if (entities.length > 0 && selectedEntities.length === 0) {
      // Logic to auto-select all could be here or keep it empty for "show all"
    }
  }, [entities]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{t('app_name')}</h1>
          <div className="flex items-center gap-2 ml-8">
            <button 
              onClick={handlePrev}
              className="p-1 hover:bg-accent rounded"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-1 text-sm font-medium hover:bg-accent rounded"
            >
              {t('today')}
            </button>
            <button 
              onClick={handleNext}
              className="p-1 hover:bg-accent rounded"
            >
              <ChevronRight size={20} />
            </button>
            <span className="text-lg font-semibold ml-2">
              {view === 'day' 
                ? format(currentDate, 'd MMMM yyyy', { locale })
                : format(currentDate, 'MMMM yyyy', { locale })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-secondary border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex border rounded-md overflow-hidden">
            <button 
              onClick={() => setView('month')}
              className={`px-4 py-2 text-sm ${view === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {t('month')}
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-4 py-2 text-sm border-x ${view === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {t('week')}
            </button>
            <button 
              onClick={() => setView('day')}
              className={`px-4 py-2 text-sm ${view === 'day' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {t('day')}
            </button>
          </div>
          <button 
            onClick={() => setShowAnalytics(true)}
            className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 size={20} />
          </button>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r p-4 flex flex-col gap-6">
          <button 
            onClick={() => {
              setEditingEvent(null);
              setShowEventModal(true);
            }}
            className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus size={18} />
            {t('create_event')}
          </button>

          <div>
            <h3 className="text-sm font-semibold mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} />
                {t('entities')}
              </div>
            </h3>
            <div className="space-y-1">
              {entities.map(entity => (
                <label 
                  key={entity.id} 
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer group"
                >
                  <input 
                    type="checkbox"
                    checked={selectedEntities.length === 0 || selectedEntities.includes(entity.id)}
                    onChange={() => toggleEntityFilter(entity.id)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: entity.color }}
                  />
                  <span className="text-sm flex-1 truncate">{entity.name}</span>
                </label>
              ))}
              {entities.length === 0 && (
                <p className="text-xs text-muted-foreground italic pl-2">{t('no_entities', 'No entities configured')}</p>
              )}
            </div>
          </div>
        </aside>

        {/* Calendar Grid */}
        <main className="flex-1 overflow-hidden p-4 bg-secondary/10">
          <CalendarGrid 
            events={filteredEvents}
            entities={entities}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
          />
        </main>
      </div>

      <EventModal 
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEvent(null);
        }}
        initialData={editingEvent}
        entities={entities}
      />

      <AnalyticsDashboard 
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        events={allEvents}
        entities={entities}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background w-full max-w-2xl rounded-xl shadow-2xl border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{t('settings')}</h2>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Entity Management Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('entities')}</h3>
                  <button 
                    onClick={() => {
                      const name = prompt(t('new_entity_name', 'Enter entity name:'));
                      if (name) db.entities.add({ name, color: '#1976D2' });
                    }}
                    className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 flex items-center gap-1"
                  >
                    <Plus size={14} /> {t('add')}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {entities.map(entity => (
                    <div key={entity.id} className="flex items-center gap-3 p-3 border rounded-lg group">
                      <input 
                        type="color" 
                        value={entity.color}
                        onChange={(e) => db.entities.update(entity.id, { color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input 
                        type="text"
                        value={entity.name}
                        onChange={(e) => db.entities.update(entity.id, { name: e.target.value })}
                        className="flex-1 bg-transparent border-0 focus:ring-0 text-sm font-medium"
                      />
                      <button 
                        onClick={() => {
                          if (confirm(t('confirm_delete_entity', 'Are you sure? This will affect events.'))) {
                            db.entities.delete(entity.id);
                          }
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Preferences Section */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Preferenze</h3>
                <div className="flex items-center justify-between">
                  <span>Tema</span>
                  <div className="flex bg-secondary p-1 rounded-lg">
                    <button 
                      onClick={() => {
                        setTheme('light');
                        db.settings.put({ key: 'theme', value: 'light' });
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm transition-all ${theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                    >
                      Chiaro
                    </button>
                    <button 
                      onClick={() => {
                        setTheme('dark');
                        db.settings.put({ key: 'theme', value: 'dark' });
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm transition-all ${theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                    >
                      Scuro
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lingua</span>
                  <select 
                    value={language}
                    onChange={(e) => {
                      const lng = e.target.value;
                      setLanguage(lng);
                      i18n.changeLanguage(lng);
                      db.settings.put({ key: 'language', value: lng });
                    }}
                    className="bg-secondary border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="it">Italiano</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span>Notifiche (30 min prima)</span>
                  <button 
                    onClick={() => {
                      const newValue = !notificationsEnabled;
                      setNotificationsEnabled(newValue);
                      db.settings.put({ key: 'notifications', value: newValue });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-primary' : 'bg-secondary'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notificationsEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </section>
            </div>

            <div className="p-6 border-t bg-secondary/30 flex justify-end">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                {t('close', 'Chiudi')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
