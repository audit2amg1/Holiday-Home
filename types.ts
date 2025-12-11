export interface CalendarEvent {
  id: string;
  roomNumber: number; // 1, 2, or 3
  name: string;
  address: string;
  phone: string;
  fromDate: string;
  toDate: string;
  amountPaid: string;
  isExempted: boolean;
}

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export interface MonthTheme {
  headerBg: string;
  headerText: string;
  dayHover: string;
  todayRing: string;
  accentColor: string;
}

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, never store plain text passwords
  isAdmin: boolean;
}