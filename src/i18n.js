import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_name": "Advanced Calendar",
      "today": "Today",
      "month": "Month",
      "week": "Week",
      "day": "Day",
      "create_event": "Create Event",
      "entities": "Entities",
      "settings": "Settings",
      "statistics": "Statistics",
      "search": "Search...",
      "no_events": "No events found",
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "confirm_delete": "Are you sure you want to delete this event?",
      "confirm_save": "Do you want to save changes?",
      "title": "Title",
      "date": "Date",
      "start_time": "Start Time",
      "duration": "Duration",
      "mode": "Mode",
      "online": "Online",
      "presence": "In Presence",
      "location": "Location",
      "meeting_url": "Meeting URL",
      "entity": "Entity",
      "materials": "Materials",
      "notes": "Notes",
      "recurrence": "Recurrence",
      "none": "None",
      "daily": "Daily",
      "weekly": "Weekly",
      "monthly": "Monthly",
      "yearly": "Yearly"
    }
  },
  it: {
    translation: {
      "app_name": "Calendario Avanzato",
      "today": "Oggi",
      "month": "Mese",
      "week": "Settimana",
      "day": "Giorno",
      "create_event": "Crea Evento",
      "entities": "Enti",
      "settings": "Impostazioni",
      "statistics": "Statistiche",
      "search": "Cerca...",
      "no_events": "Nessun evento trovato",
      "save": "Salva",
      "cancel": "Annulla",
      "delete": "Elimina",
      "confirm_delete": "Sei sicuro di voler eliminare questo evento?",
      "confirm_save": "Vuoi salvare le modifiche?",
      "title": "Titolo",
      "date": "Data",
      "start_time": "Orario inizio",
      "duration": "Durata",
      "mode": "Modalità",
      "online": "Online",
      "presence": "In presenza",
      "location": "Posizione",
      "meeting_url": "URL Meeting",
      "entity": "Ente",
      "materials": "Materiali necessari",
      "notes": "Note",
      "recurrence": "Ricorrenza",
      "none": "Nessuna",
      "daily": "Giornaliera",
      "weekly": "Settimanale",
      "monthly": "Mensile",
      "yearly": "Annuale"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'it',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
