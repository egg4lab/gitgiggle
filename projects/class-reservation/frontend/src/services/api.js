/**
 * Demo mode: returns mock data so the calendar can be shown without a backend.
 * Replace with real axios calls when API_ENDPOINT is set.
 */
const DEMO = !import.meta.env.VITE_API_ENDPOINT;

function addDays(d, days) {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function demoAvailability(startDate, endDate) {
  const slots = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const schedule = { 1: 'Taipei', 2: 'Taipei', 3: 'Yi-Lan', 4: 'Yi-Lan', 5: 'Hsin-Chu', 6: 'Hsin-Chu', 0: 'Hsin-Chu' };
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const loc = schedule[d.getDay()];
    if (!loc) continue;
    for (let hour = 9; hour <= 19; hour++) {
      const slotStart = new Date(d);
      slotStart.setHours(hour, 0, 0, 0);
      if (slotStart >= start && slotStart <= end) {
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 100);
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          location: loc,
        });
      }
    }
  }
  return { availableSlots: slots };
}

function demoSessions() {
  const sessions = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = addDays(base, i);
    const day = d.getDay();
    const loc = { 1: 'Taipei', 2: 'Taipei', 3: 'Yi-Lan', 4: 'Yi-Lan', 5: 'Hsin-Chu', 6: 'Hsin-Chu', 0: 'Hsin-Chu' }[day];
    const start = new Date(d);
    start.setHours(10 + (i % 3), 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 100);
    sessions.push({
      sessionId: `demo-session-${i}`,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      location: loc,
    });
  }
  return { sessions };
}

function demoGroupClasses(startDate, endDate) {
  const classes = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const schedule = { 1: 'Taipei', 2: 'Taipei', 3: 'Yi-Lan', 4: 'Yi-Lan', 5: 'Hsin-Chu', 6: 'Hsin-Chu', 0: 'Hsin-Chu' };
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const loc = schedule[d.getDay()];
    if (!loc) continue;
    const slotStart = new Date(d);
    slotStart.setHours(14, 0, 0, 0);
    if (slotStart >= start && slotStart <= end) {
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 60);
      classes.push({
        classId: `demo-class-${d.getTime()}`,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        location: loc,
        enrolled: 2,
        capacity: 8,
      });
    }
  }
  return { groupClasses: classes };
}

export async function fetchAvailability(startDate, endDate) {
  if (DEMO) return demoAvailability(startDate, endDate);
  const base = import.meta.env.VITE_API_ENDPOINT || '';
  const res = await fetch(`${base}/availability?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
  if (!res.ok) throw new Error('Failed to fetch availability');
  return res.json();
}

export async function fetchGroupClasses(startDate, endDate) {
  if (DEMO) return demoGroupClasses(startDate, endDate);
  const base = import.meta.env.VITE_API_ENDPOINT || '';
  const res = await fetch(`${base}/group-classes?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
  if (!res.ok) throw new Error('Failed to fetch group classes');
  return res.json();
}

export async function fetchSessions() {
  if (DEMO) return demoSessions();
  const base = import.meta.env.VITE_API_ENDPOINT || '';
  const res = await fetch(`${base}/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function login(passcode) {
  if (DEMO) {
    return { student: { studentId: 'demo-student', name: 'Demo User', email: 'demo@example.com' }, token: 'demo-token' };
  }
  const base = import.meta.env.VITE_API_ENDPOINT || '';
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function bookSession(studentId, startTime, location) {
  if (DEMO) return { sessionId: 'demo-new-' + Date.now() };
  const base = import.meta.env.VITE_API_ENDPOINT || '';
  const res = await fetch(`${base}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: JSON.stringify({ startTime, location }),
  });
  if (!res.ok) throw new Error('Booking failed');
  return res.json();
}
