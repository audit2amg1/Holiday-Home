import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Calendar as CalendarIcon, MapPin, Phone, User, DollarSign, FileCheck, Edit2, PlusCircle, AlertCircle } from 'lucide-react';
import { format, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { CalendarEvent } from '../types';

interface EventModalProps {
  isOpen: boolean;
  date: Date | null;
  allEvents: CalendarEvent[];
  onClose: () => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onActionWithAuth: (callback: () => void) => void;
}

const ROOMS = [1, 2, 3];

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  date, 
  allEvents, 
  onClose, 
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  onActionWithAuth
}) => {
  // Mode: 'view' or 'edit' (which includes add)
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [editEventId, setEditEventId] = useState<string | null>(null); // If null, we are adding new

  // Form States
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [isExempted, setIsExempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && date) {
      setEditingRoom(null);
      setEditEventId(null);
      setError(null);
    }
  }, [isOpen, date]);

  if (!isOpen || !date) return null;

  // Filter events active on this specific date
  const eventsOnDate = allEvents.filter(event => {
    const start = startOfDay(parseISO(event.fromDate));
    const end = startOfDay(parseISO(event.toDate));
    return isWithinInterval(startOfDay(date), { start, end });
  });

  const handleBookClick = (roomNum: number) => {
    onActionWithAuth(() => handleStartEdit(roomNum));
  };

  const handleModifyClick = (roomNum: number, event: CalendarEvent) => {
    onActionWithAuth(() => handleStartEdit(roomNum, event));
  };

  const handleDeleteClick = (eventId: string) => {
    onActionWithAuth(() => onDeleteEvent(eventId));
  };

  const handleStartEdit = (roomNum: number, existingEvent?: CalendarEvent) => {
    setEditingRoom(roomNum);
    setError(null);
    if (existingEvent) {
      setEditEventId(existingEvent.id);
      setName(existingEvent.name);
      setAddress(existingEvent.address);
      setPhone(existingEvent.phone);
      setFromDate(existingEvent.fromDate);
      setToDate(existingEvent.toDate);
      setAmountPaid(existingEvent.amountPaid || '');
      setIsExempted(existingEvent.isExempted);
    } else {
      // Adding new
      setEditEventId(null);
      setName('');
      setAddress('');
      setPhone('');
      const dateStr = format(date, 'yyyy-MM-dd');
      setFromDate(dateStr);
      setToDate(dateStr);
      setAmountPaid('');
      setIsExempted(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    // Validation: Check for double booking for this room in the selected range
    // Filter events for this room (excluding current event if updating)
    const roomEvents = allEvents.filter(e => 
      e.roomNumber === editingRoom && e.id !== editEventId
    );

    const newStart = startOfDay(parseISO(fromDate));
    const newEnd = startOfDay(parseISO(toDate));

    if (newEnd < newStart) {
      setError("End date cannot be before start date.");
      return;
    }

    const hasOverlap = roomEvents.some(e => {
      const eStart = startOfDay(parseISO(e.fromDate));
      const eEnd = startOfDay(parseISO(e.toDate));
      // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
      return newStart <= eEnd && newEnd >= eStart;
    });

    if (hasOverlap) {
      setError(`Room ${editingRoom} is already booked during these dates.`);
      return;
    }

    const eventData = {
      roomNumber: editingRoom,
      name,
      address,
      phone,
      fromDate,
      toDate,
      amountPaid: isExempted ? '' : amountPaid,
      isExempted
    };

    if (editEventId) {
      onUpdateEvent({ ...eventData, id: editEventId });
    } else {
      onAddEvent(eventData);
    }

    setEditingRoom(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white relative flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Holiday Home Status</h2>
              <p className="text-red-100 font-medium opacity-90">{format(date, 'EEEE, MMMM do, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
          
          {/* Room Cards */}
          <div className="space-y-4">
            {ROOMS.map(roomNum => {
              const event = eventsOnDate.find(e => e.roomNumber === roomNum);
              const isEditingThisRoom = editingRoom === roomNum;

              // If editing this room, show form
              if (isEditingThisRoom) {
                return (
                  <div key={roomNum} className="bg-white rounded-xl shadow-md border-2 border-indigo-500 overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex justify-between items-center">
                      <span className="font-bold text-indigo-700">Editing Room {roomNum}</span>
                    </div>
                    
                    <form onSubmit={handleSave} className="p-5 space-y-4">
                      {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                          <AlertCircle size={16} />
                          {error}
                        </div>
                      )}

                      {/* Name & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Guest Name</label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="(555) 555-5555"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Address</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm"
                          value={address}
                          onChange={e => setAddress(e.target.value)}
                          placeholder="123 Main St..."
                        />
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Check In</label>
                          <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Check Out</label>
                          <input
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Payment */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-slate-500 uppercase">Payment Details</label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={isExempted}
                              onChange={e => setIsExempted(e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <span>Exempted</span>
                          </label>
                        </div>

                        {!isExempted ? (
                           <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Amount Paid</label>
                             <div className="relative">
                               <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                               <input
                                 type="text"
                                 className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white"
                                 value={amountPaid}
                                 onChange={e => setAmountPaid(e.target.value)}
                                 placeholder="0.00"
                               />
                             </div>
                           </div>
                        ) : (
                          <div className="text-sm text-indigo-600 font-medium italic flex items-center gap-2">
                            <FileCheck size={16} />
                            Payment exempted for this stay.
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                          Save Occupancy
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setEditingRoom(null)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                );
              }

              // Display View
              return (
                <div key={roomNum} className={`rounded-xl border transition-all duration-200 ${event ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-dashed border-slate-300'}`}>
                  {event ? (
                    // OCCUPIED STATE
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">Room {roomNum}</span>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                            <Check size={12} /> Occupied
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleModifyClick(roomNum, event)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Modify"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(event.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <User size={16} className="text-slate-400" />
                             <span className="font-bold text-slate-800">{event.name}</span>
                           </div>
                           <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                             <Phone size={14} /> {event.phone || 'No phone'}
                           </div>
                           <div className="flex items-start gap-2 text-sm text-slate-500">
                             <MapPin size={14} className="mt-0.5 shrink-0" /> <span className="line-clamp-1">{event.address || 'No address'}</span>
                           </div>
                        </div>

                        <div className="text-sm border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                           <div className="space-y-1.5">
                             <div className="flex justify-between">
                               <span className="text-slate-500">Check In:</span>
                               <span className="font-medium text-slate-700">{event.fromDate}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-slate-500">Check Out:</span>
                               <span className="font-medium text-slate-700">{event.toDate}</span>
                             </div>
                             <div className="flex justify-between items-center pt-1 mt-1 border-t border-slate-100">
                               <span className="text-slate-500">Total:</span>
                               {event.isExempted ? (
                                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">EXEMPTED</span>
                               ) : (
                                 <span className="font-bold text-green-600">{event.amountPaid || '$0.00'}</span>
                               )}
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // EMPTY STATE
                    <div className="p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                           {roomNum}
                         </div>
                         <div>
                           <h4 className="font-semibold text-slate-600 group-hover:text-blue-700">Room {roomNum}</h4>
                           <p className="text-xs text-slate-400">Available for booking</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleBookClick(roomNum)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 shadow-sm text-slate-700 text-sm font-semibold rounded-lg hover:border-blue-500 hover:text-blue-600 hover:shadow transition-all"
                      >
                        <PlusCircle size={16} />
                        Book Room
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventModal;