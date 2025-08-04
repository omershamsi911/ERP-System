import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../services/supabase";

const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Input = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input id={id} {...props} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
  </div>
);

const Select = ({ label, id, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select id={id} {...props} className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
      {children}
    </select>
  </div>
);


export const Calendar = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

export const BookOpen = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const ClipboardList = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);

export const LayoutGrid = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
  </svg>
);

export const PlusCircle = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export const Trash2 = ({ className = '', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

export default function CalendarEventsManager() {
  const [calendars, setCalendars] = useState([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('');
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalendars = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('academic_calendar')
        .select('id, academic_year')
        .order('start_date', { ascending: true });
      
      if (error) console.error('Error fetching calendars:', error);
      else setCalendars(data || []);
      
      if (data && data.length > 0) {
        setSelectedCalendarId(data[0].id);
      }
      setIsLoading(false);
    };
    fetchCalendars();
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!selectedCalendarId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('calendar_id', selectedCalendarId)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error.message);
    }
    setIsLoading(false);
  }, [selectedCalendarId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventData = {
      ...Object.fromEntries(formData.entries()),
      calendar_id: selectedCalendarId,
      is_holiday: formData.get('is_holiday') === 'on'
    };

    try {
      if (currentEvent && currentEvent.id) {
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', currentEvent.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert([eventData]);
        
        if (error) throw error;
      }
      await fetchEvents();
      setCurrentEvent(null);
    } catch (error) {
      console.error('Error saving event:', error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error.message);
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <Select
          label="Select Academic Year"
          id="calendar-select"
          value={selectedCalendarId}
          onChange={(e) => setSelectedCalendarId(e.target.value)}
        >
          {calendars.map(cal => <option key={cal.id} value={cal.id}>{cal.academic_year}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <h2 className="text-xl font-bold mb-4">Events</h2>
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className={`p-3 rounded-lg flex justify-between items-center ${event.is_holiday ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
                  <div>
                    <p className="font-semibold">{event.title} <span className="text-sm text-gray-500">({new Date(event.event_date).toLocaleDateString()})</span></p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button onClick={() => setCurrentEvent(event)} variant="secondary">Edit</Button>
                    <Button onClick={() => handleDelete(event.id)} variant="danger"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <h2 className="text-xl font-bold mb-4">{currentEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Title" id="title" name="title" type="text" defaultValue={currentEvent?.title || ''} required />
              <Input label="Date" id="event_date" name="event_date" type="date" defaultValue={currentEvent?.event_date || ''} required />
              <Input label="Description" id="description" name="description" type="text" defaultValue={currentEvent?.description || ''} />
              <div className="flex items-center">
                <input id="is_holiday" name="is_holiday" type="checkbox" defaultChecked={currentEvent?.is_holiday || false} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="is_holiday" className="ml-2 block text-sm text-gray-900">This is a holiday</label>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                {currentEvent && <Button type="button" onClick={() => setCurrentEvent(null)} variant="secondary">Cancel</Button>}
                <Button type="submit" variant="primary">Save Event</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
