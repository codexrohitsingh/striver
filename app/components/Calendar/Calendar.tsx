'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval, 
  isWithinInterval,
  isBefore,
  startOfToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3, Trash2, Calendar as CalendarIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/app/lib/utils';

// Types
type DateRange = {
  start: Date | null;
  end: Date | null;
};

type Note = {
  id: string;
  date: string; // ISO string for the day or "general"
  content: string;
};

// Mock Holidays
const HOLIDAYS: Record<string, string> = {
  '2022-01-01': 'New Year\'s Day',
  '2022-01-17': 'Martin Luther King Jr. Day',
  '2022-02-14': 'Valentine\'s Day',
  '2022-02-21': 'Presidents\' Day',
  '2022-03-17': 'St. Patrick\'s Day',
  '2022-04-17': 'Easter Sunday',
  '2022-05-30': 'Memorial Day',
  '2022-07-04': 'Independence Day',
  '2022-09-05': 'Labor Day',
  '2022-10-31': 'Halloween',
  '2022-11-11': 'Veterans Day',
  '2022-11-24': 'Thanksgiving Day',
  '2022-12-25': 'Christmas Day',
};

// Mock Month Images
const MONTH_IMAGES: Record<number, string> = {
  0: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200', // Jan
  1: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=1200', // Feb
  2: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?auto=format&fit=crop&q=80&w=1200', // Mar
  3: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=1200', // Apr
  4: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200', // May (repeat for now)
  5: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200', // Jun
  6: 'https://images.unsplash.com/photo-1502675135487-e971002a6adb?auto=format&fit=crop&q=80&w=1200', // Jul
  7: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200', // Aug
  8: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200', // Sep
  9: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200', // Oct
  10: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200', // Nov
  11: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200', // Dec
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2022, 0, 1)); // January 2022
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditingNote, setIsEditingNote] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  // Local storage persistence
  useEffect(() => {
    const savedNotes = localStorage.getItem('calendar-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-notes', JSON.stringify(notes));
  }, [notes]);

  // Calendar logic
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handleDateClick = (day: Date) => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: day, end: null });
    } else {
      if (isBefore(day, selectedRange.start)) {
        setSelectedRange({ start: day, end: selectedRange.start });
      } else {
        setSelectedRange({ ...selectedRange, end: day });
      }
    }
  };

  const isInRange = (day: Date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    return isWithinInterval(day, { 
      start: selectedRange.start, 
      end: selectedRange.end 
    });
  };

  const isStart = (day: Date) => selectedRange.start && isSameDay(day, selectedRange.start);
  const isEnd = (day: Date) => selectedRange.end && isSameDay(day, selectedRange.end);

  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Note functions
  const addNote = () => {
    if (!newNoteContent.trim()) return;
    const dateStr = selectedRange.start ? format(selectedRange.start, 'yyyy-MM-dd') : 'general';
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      content: newNoteContent,
    };
    setNotes([...notes, newNote]);
    setNewNoteContent('');
    setIsEditingNote(null);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const currentMonthNotes = notes.filter(n => 
    n.date === 'general' || 
    (n.date !== 'general' && isSameMonth(new Date(n.date), currentMonth))
  );

  const variants = {
    enter: (direction: number) => ({
      rotateX: direction > 0 ? 110 : -110,
      rotateY: direction > 0 ? 5 : -5,
      opacity: 0,
      scale: 0.95,
      z: -100,
      transformOrigin: direction > 0 ? "top" : "bottom",
    }),
    center: {
      zIndex: 1,
      rotateX: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1,
      z: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      rotateX: direction < 0 ? 110 : -110,
      rotateY: direction < 0 ? 5 : -5,
      opacity: 0,
      scale: 0.95,
      z: -100,
      transformOrigin: direction < 0 ? "top" : "bottom",
    })
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-4 flex justify-center items-start font-sans perspective-1000">
      {/* Calendar Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden relative preserve-3d"
      >
        {/* Spiral Binding Effect */}
        <div className="absolute top-0 left-0 right-0 h-10 flex justify-center gap-4 -translate-y-5 z-20">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="group relative">
              <div className="w-2.5 h-10 bg-gradient-to-b from-neutral-900 to-neutral-600 rounded-full border border-neutral-800 shadow-xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-neutral-400 rounded-full opacity-30" />
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row min-h-[750px]">
          {/* Left/Top Section: Hero Image */}
          <div className="w-full md:w-1/2 relative overflow-hidden bg-neutral-200 min-h-[400px] md:min-h-full">
            <div className="absolute inset-0 bg-black/5 z-0 pointer-events-none" />
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentMonth.toISOString()}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  rotateX: { type: "spring", stiffness: 100, damping: 20 },
                  rotateY: { type: "spring", stiffness: 100, damping: 20 },
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.5 }
                }}
                className="absolute inset-0"
              >
                <img 
                  src={MONTH_IMAGES[currentMonth.getMonth()]}
                  alt="Month Theme"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Visual Anchor (Blue Shape) */}
            <div className="absolute bottom-0 right-0 w-full z-10">
              <svg viewBox="0 0 400 200" className="w-full fill-[#1e90ff] backdrop-blur-sm drop-shadow-2xl">
                <path d="M0 150 L150 50 L250 150 L400 50 L400 200 L0 200 Z" />
              </svg>
              <motion.div 
                key={currentMonth.toISOString() + '-text'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute bottom-8 right-8 text-right text-white"
              >
                <p className="text-2xl font-light tracking-[0.2em] mb-1">{format(currentMonth, 'yyyy')}</p>
                <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">{format(currentMonth, 'MMMM')}</h1>
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute top-12 left-8 flex gap-3 z-20">
              <button 
                onClick={prevMonth}
                className="p-3 bg-white/10 hover:bg-white/30 backdrop-blur-lg rounded-full text-white transition-all border border-white/20 shadow-lg group"
              >
                <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-3 bg-white/10 hover:bg-white/30 backdrop-blur-lg rounded-full text-white transition-all border border-white/20 shadow-lg group"
              >
                <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="absolute top-12 right-8 z-20">
               <div className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 text-white text-xs font-bold tracking-widest uppercase">
                  Wall Calendar
               </div>
            </div>
          </div>

          {/* Right/Bottom Section: Grid & Notes */}
          <div className="w-full md:w-1/2 p-10 flex flex-col bg-white">
            <div className="flex flex-col xl:flex-row gap-10 flex-grow">
              
              {/* Notes Area (Lined Paper Aesthetic) */}
              <div className="w-full xl:w-2/5 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Edit3 size={18} className="text-sky-500" />
                    <h3 className="font-black text-neutral-800 uppercase tracking-[0.2em] text-xs">Notes</h3>
                  </div>
                  <button 
                    onClick={() => setIsEditingNote('new')}
                    className="group flex items-center gap-1.5 text-sky-500 hover:text-sky-600 transition-colors text-xs font-bold"
                  >
                    <span>ADD</span>
                    <div className="w-5 h-5 rounded-full border-2 border-sky-500 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                       +
                    </div>
                  </button>
                </div>
                
                <div className="flex-grow relative min-h-[200px]">
                  {/* Lined Paper Background */}
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className="h-8 border-b border-neutral-100 w-full" />
                    ))}
                  </div>

                  <div className="relative z-10 space-y-0 overflow-y-auto max-h-[400px] xl:max-h-none pr-2 scrollbar-hide">
                    <AnimatePresence mode="popLayout">
                      {currentMonthNotes.map(note => (
                        <motion.div 
                          key={note.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group relative h-16 flex flex-col justify-center px-1"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">
                              {note.date === 'general' ? 'General' : format(new Date(note.date), 'MMM d')}
                            </span>
                            <button 
                              onClick={() => deleteNote(note.id)}
                              className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-400 transition-all p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="text-sm text-neutral-600 line-clamp-1 font-medium italic">{note.content}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {currentMonthNotes.length === 0 && !isEditingNote && (
                      <div className="pt-2 text-center text-neutral-300 italic text-sm">
                        No notes for this month...
                      </div>
                    )}
                  </div>

                  {isEditingNote && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-5 bg-neutral-50 rounded-xl border border-neutral-100 shadow-sm relative z-20"
                    >
                      <textarea 
                        autoFocus
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder={selectedRange.start ? `Note for ${format(selectedRange.start, 'MMM d')}...` : "Type your note here..."}
                        className="w-full bg-transparent text-sm text-neutral-700 focus:outline-none resize-none h-24 font-medium"
                      />
                      <div className="flex justify-end gap-3 mt-3">
                        <button 
                          onClick={() => setIsEditingNote(null)}
                          className="text-xs font-bold text-neutral-400 hover:text-neutral-600 px-2 py-1"
                        >
                          CANCEL
                        </button>
                        <button 
                          onClick={addNote}
                          className="text-xs font-bold bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-all shadow-md shadow-sky-200"
                        >
                          SAVE NOTE
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Calendar Grid Section */}
              <div className="flex-grow flex flex-col">
                <div className="grid grid-cols-7 mb-6 border-b border-neutral-50 pb-2">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                    <div key={day} className={cn(
                      "text-center text-[10px] font-black tracking-[0.2em] py-2",
                      i >= 5 ? "text-sky-500" : "text-neutral-400"
                    )}>
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2 relative preserve-3d h-[350px]">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentMonth.toISOString()}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        rotateX: { type: "spring", stiffness: 100, damping: 20 },
                        rotateY: { type: "spring", stiffness: 100, damping: 20 },
                        opacity: { duration: 0.5 },
                        scale: { duration: 0.5 }
                      }}
                      className="grid grid-cols-7 col-span-7 gap-y-2 absolute inset-0"
                    >
                      {days.map((day, i) => {
                        const isToday = isSameDay(day, startOfToday());
                        const currentMonthDay = isSameMonth(day, currentMonth);
                        const rangeStart = isStart(day);
                        const rangeEnd = isEnd(day);
                        const inRange = isInRange(day);
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const holiday = HOLIDAYS[dayKey];

                        return (
                          <div 
                            key={day.toISOString()}
                            className="relative flex flex-col items-center justify-center p-1 group"
                          >
                            {/* Range Highlight Background */}
                            {inRange && (
                              <div className={cn(
                                "absolute inset-y-1.5 z-0",
                                rangeStart && !rangeEnd ? "left-1/2 right-0 bg-sky-100 rounded-l-none" : "",
                                rangeEnd && !rangeStart ? "left-0 right-1/2 bg-sky-100 rounded-r-none" : "",
                                rangeStart && rangeEnd ? "inset-x-2 bg-sky-100 rounded-full" : "",
                                !rangeStart && !rangeEnd ? "inset-x-0 bg-sky-100" : ""
                              )} />
                            )}

                            <button
                              onClick={() => handleDateClick(day)}
                              className={cn(
                                "relative z-10 w-11 h-11 flex flex-col items-center justify-center text-sm transition-all duration-300 rounded-full",
                                !currentMonthDay && "text-neutral-200 pointer-events-none opacity-40",
                                currentMonthDay && "text-neutral-800 font-medium hover:bg-neutral-50",
                                (rangeStart || rangeEnd) && "bg-sky-500 text-white shadow-xl shadow-sky-200 scale-110 font-black hover:bg-sky-600",
                                isToday && !rangeStart && !rangeEnd && "ring-2 ring-sky-500 ring-offset-2",
                                i % 7 >= 5 && currentMonthDay && !rangeStart && !rangeEnd && "text-sky-500"
                              )}
                            >
                              <span>{format(day, 'd')}</span>
                              
                              {/* Holiday Indicator */}
                              {holiday && currentMonthDay && (
                                <div className={cn(
                                  "absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-400 text-[8px] text-white shadow-sm",
                                  (rangeStart || rangeEnd) && "hidden"
                                )}>
                                  <Info size={8} />
                                </div>
                              )}
                              
                              {/* Note Indicator */}
                              {notes.some(n => n.date === dayKey) && (
                                <div className={cn(
                                  "absolute bottom-2 w-1 h-1 rounded-full",
                                  rangeStart || rangeEnd ? "bg-white" : "bg-sky-500 animate-pulse"
                                )} />
                              )}
                            </button>
                            
                            {/* Tooltip for Holiday */}
                            {holiday && currentMonthDay && (
                              <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 bg-neutral-800 text-white text-[9px] py-1 px-2 rounded whitespace-nowrap uppercase tracking-widest font-bold">
                                {holiday}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Selection Range Helper */}
                <div className="mt-auto pt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                       <CalendarIcon size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Selected Range</p>
                      <p className="text-xs font-bold text-neutral-700">
                        {selectedRange.start ? (
                          <>
                            {format(selectedRange.start, 'MMM d, yyyy')} 
                            {selectedRange.end && ` — ${format(selectedRange.end, 'MMM d, yyyy')}`}
                          </>
                        ) : (
                          'Select a date to begin'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {selectedRange.start && (
                    <button 
                      onClick={() => setSelectedRange({ start: null, end: null })}
                      className="text-[10px] font-black text-neutral-300 hover:text-red-400 transition-colors uppercase tracking-widest"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Footer Information */}
            <div className="mt-10 pt-6 border-t border-neutral-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Holiday</span>
                </div>
              </div>
              <div className="text-[9px] font-black text-neutral-300 tracking-[0.3em] uppercase">
                Premium Wall Calendar Concept
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Calendar;
