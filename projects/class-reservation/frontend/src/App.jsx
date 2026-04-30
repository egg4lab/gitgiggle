import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginModal from './components/LoginModal';
import BookingModal from './components/BookingModal';
import StudentScheduleModal from './components/StudentScheduleModal';
import { useAuthStore } from './store/authStore';
import { fetchAvailability, fetchGroupClasses, fetchSessions } from './services/api';
import './styles/App.css';

moment.locale('zh-tw');
const localizer = momentLocalizer(moment);

const LOCATION_COLORS = {
  'Taipei': '#3B82F6',      // Blue
  'Yi-Lan': '#10B981',      // Green
  'Hsin-Chu': '#F59E0B',    // Orange
};

function App() {
  const { student, isAuthenticated, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [events, setEvents] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
      setShowSchedule(true);
      loadCalendarData();
    }
  }, [isAuthenticated]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const startDate = moment().startOf('week').toISOString();
      const endDate = moment().add(4, 'weeks').endOf('week').toISOString();

      const [availabilityData, groupClassesData, sessionsData] = await Promise.all([
        fetchAvailability(startDate, endDate),
        fetchGroupClasses(startDate, endDate),
        fetchSessions(),
      ]);

      // Combine all events
      const calendarEvents = [];

      // Add 1-on-1 sessions (all students' sessions for reference)
      if (sessionsData.sessions) {
        sessionsData.sessions.forEach(session => {
          calendarEvents.push({
            id: session.sessionId,
            title: '1-on-1 Session',
            start: new Date(session.startTime),
            end: new Date(session.endTime),
            type: '1on1',
            location: session.location,
            color: LOCATION_COLORS[session.location],
          });
        });
      }

      // Add group classes
      if (groupClassesData.groupClasses) {
        groupClassesData.groupClasses.forEach(cls => {
          calendarEvents.push({
            id: cls.classId,
            title: `Group Class (${cls.enrolled}/${cls.capacity})`,
            start: new Date(cls.startTime),
            end: new Date(cls.endTime),
            type: 'group',
            location: cls.location,
            color: LOCATION_COLORS[cls.location],
          });
        });
      }

      setEvents(calendarEvents);
      setAvailableSlots(availabilityData.availableSlots || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast.error('載入日曆資料失敗 / Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    if (!isAuthenticated) {
      toast.error('請先登入 / Please login first');
      return;
    }

    const clickedTime = slotInfo.start;
    const location = getLocationForDay(clickedTime);

    if (!location) {
      toast.error('此日期不開放預約 / This date is not available for booking');
      return;
    }

    // Check if slot is available
    const isAvailable = availableSlots.some(slot => {
      const slotStart = new Date(slot.startTime);
      return slotStart.getTime() === clickedTime.getTime();
    });

    if (!isAvailable) {
      toast.error('此時段不可預約 / This time slot is not available');
      return;
    }

    setSelectedSlot({
      startTime: clickedTime,
      location,
    });
    setShowBooking(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowSchedule(true);
    toast.success(`歡迎回來，${student?.name}！ / Welcome back, ${student?.name}!`);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: '600',
        fontSize: '13px',
        padding: '4px 8px',
      },
    };
  };

  const getLocationForDay = (date) => {
    const day = date.getDay();
    const schedule = {
      1: 'Taipei',
      2: 'Taipei',
      3: 'Yi-Lan',
      4: 'Yi-Lan',
      5: 'Hsin-Chu',
      6: 'Hsin-Chu',
      0: 'Hsin-Chu',
    };
    return schedule[day];
  };

  return (
    <div className="app-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="app-header"
      >
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🎯</span>
            課程預約系統
            <span className="title-subtitle">Class Reservation</span>
          </h1>

          {isAuthenticated && (
            <div className="user-info">
              <span className="user-name">👤 {student?.name}</span>
              <button onClick={logout} className="logout-btn">
                登出 / Logout
              </button>
            </div>
          )}
        </div>
      </motion.header>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="location-legend"
      >
        <div className="legend-item">
          <span className="legend-dot" style={{ background: LOCATION_COLORS.Taipei }}></span>
          <span>🟦 Taipei (週一-二 / Mon-Tue)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: LOCATION_COLORS['Yi-Lan'] }}></span>
          <span>🟩 Yi-Lan (週三-四 / Wed-Thu)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: LOCATION_COLORS['Hsin-Chu'] }}></span>
          <span>🟧 Hsin-Chu (週五-日 / Fri-Sun)</span>
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="calendar-container"
      >
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>載入中... / Loading...</p>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="week"
            step={60}
            timeslots={1}
            min={new Date(2024, 0, 1, 9, 0)}
            max={new Date(2024, 0, 1, 21, 0)}
          />
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showLogin && !isAuthenticated && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onSuccess={handleLoginSuccess}
          />
        )}

        {showBooking && (
          <BookingModal
            slot={selectedSlot}
            onClose={() => {
              setShowBooking(false);
              setSelectedSlot(null);
            }}
            onSuccess={() => {
              setShowBooking(false);
              setSelectedSlot(null);
              loadCalendarData();
              toast.success('預約成功！ / Booking successful!');
            }}
          />
        )}

        {showSchedule && (
          <StudentScheduleModal
            onClose={() => setShowSchedule(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
