import { useState } from "react";
import { Calendar, BookOpen, ClipboardList, LayoutGrid } from "lucide-react";
import AcademicCalendarEditor from "../components/academic/AcademicCalendar";
import CalendarEventsManager from "../components/academic/CalenderEvents";
import TermsManager from "../components/academic/TermManagement";
import TermDetailsManager from "../components/academic/TermDetailsManager";
import ClassTimetableManager from "../components/academic/ClassTimetableManager";

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('calendar');

  const tabs = [
    { id: 'calendar', label: 'Academic Year', icon: Calendar, component: <AcademicCalendarEditor /> },
    { id: 'events', label: 'Events', icon: BookOpen, component: <CalendarEventsManager /> },
    { id: 'terms', label: 'Terms', icon: ClipboardList, component: <TermsManager /> },
    { id: 'details', label: 'Term Details', icon: ClipboardList, component: <TermDetailsManager /> },
    { id: 'timetable', label: 'Class Timetable', icon: LayoutGrid, component: <ClassTimetableManager /> },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Academic Management Portal</h1>
          <p className="text-gray-600 mt-1">Manage all academic configurations from one place.</p>
        </header>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200
                    ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <main className="mt-8">
          {ActiveComponent}
        </main>
      </div>
    </div>
  );
}