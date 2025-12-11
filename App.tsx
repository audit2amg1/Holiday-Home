import React, { useState } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Settings } from 'lucide-react';
import MonthView from './components/MonthView';
import EventModal from './components/EventModal';
import AuthModal from './components/AuthModal';
import UserManagementModal from './components/UserManagementModal';
import { CalendarEvent, MonthTheme, User } from './types';

// Define 4 colorful themes
const THEMES: MonthTheme[] = [
  {
    headerBg: 'bg-gradient-to-r from-violet-500 to-purple-500',
    headerText: 'text-white',
    dayHover: 'hover:bg-purple-50 hover:text-purple-700',
    todayRing: 'ring-purple-200',
    accentColor: 'bg-purple-500',
  },
  {
    headerBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    headerText: 'text-white',
    dayHover: 'hover:bg-emerald-50 hover:text-emerald-700',
    todayRing: 'ring-emerald-200',
    accentColor: 'bg-emerald-500',
  },
  {
    headerBg: 'bg-gradient-to-r from-amber-400 to-orange-500',
    headerText: 'text-white',
    dayHover: 'hover:bg-orange-50 hover:text-orange-700',
    todayRing: 'ring-orange-200',
    accentColor: 'bg-orange-500',
  },
  {
    headerBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
    headerText: 'text-white',
    dayHover: 'hover:bg-rose-50 hover:text-rose-700',
    todayRing: 'ring-rose-200',
    accentColor: 'bg-rose-500',
  },
];

// Initial events
const INITIAL_EVENTS: CalendarEvent[] = [
  { 
    id: '1', 
    roomNumber: 1,
    name: 'Sarah Jenkins', 
    address: '42 Sunset Blvd, Malibu CA', 
    phone: '(555) 123-4567',
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd'),
    amountPaid: '$1,200',
    isExempted: false
  }
];

// Initial Admin User
const INITIAL_USERS: User[] = [
  { id: 'admin', username: 'admin', password: 'admin', isAdmin: true }
];

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  
  // Auth state
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [authRequest, setAuthRequest] = useState<{
    isOpen: boolean;
    requireAdmin: boolean;
    onSuccess: (() => void) | null;
  }>({ isOpen: false, requireAdmin: false, onSuccess: null });

  // Navigation handlers
  const handlePrev = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNext = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  // --- Auth Handlers ---
  const requestAuth = (callback: () => void, requireAdmin: boolean = false) => {
    setAuthRequest({
      isOpen: true,
      requireAdmin,
      onSuccess: callback
    });
  };

  const handleAuthSuccess = () => {
    if (authRequest.onSuccess) {
      authRequest.onSuccess();
    }
    setAuthRequest({ isOpen: false, requireAdmin: false, onSuccess: null });
  };

  const handleAuthClose = () => {
    setAuthRequest({ isOpen: false, requireAdmin: false, onSuccess: null });
  };

  // --- Setup / User Management ---
  const handleSetupClick = () => {
    requestAuth(() => setIsUserManagementOpen(true), true); // Require Admin
  };

  const handleAddUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // --- Event Modal Handlers ---
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setTimeout(() => setSelectedDate(null), 200);
  };

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  // Generate the 4 months to display
  const monthsToDisplay = [0, 1, 2, 3].map(offset => addMonths(currentDate, offset));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md shadow-indigo-200">
              <Calendar size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Holiday Home
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-lg hover:bg-white hover:text-indigo-600 hover:shadow-sm text-slate-600 transition-all duration-200"
              aria-label="Previous Month"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button 
              onClick={handleToday}
              className="px-6 py-2 bg-white text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:shadow border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-200"
            >
              Today
            </button>
            
            <button 
              onClick={handleNext}
              className="p-2 rounded-lg hover:bg-white hover:text-indigo-600 hover:shadow-sm text-slate-600 transition-all duration-200"
              aria-label="Next Month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={handleSetupClick}
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Setup / User Management"
            >
              <Settings size={20} />
              <span className="text-sm font-medium hidden sm:inline">Setup</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 auto-rows-fr h-full">
          {monthsToDisplay.map((monthDate, index) => (
            <div key={monthDate.toString()} className="h-full min-h-[400px]">
              <MonthView
                monthDate={monthDate}
                theme={THEMES[index % THEMES.length]}
                events={events}
                onDateClick={handleDateClick}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Holiday Home Manager. All rights reserved.</p>
        </div>
      </footer>

      {/* Event Dialog */}
      <EventModal
        isOpen={isEventModalOpen}
        date={selectedDate}
        allEvents={events}
        onClose={handleCloseEventModal}
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
        onActionWithAuth={(cb) => requestAuth(cb, false)} // Requires any user
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authRequest.isOpen}
        users={users}
        requireAdmin={authRequest.requireAdmin}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        users={users}
        onClose={() => setIsUserManagementOpen(false)}
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />
    </div>
  );
};

export default App;