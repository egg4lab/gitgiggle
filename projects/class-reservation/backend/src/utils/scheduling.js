import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Location schedule configuration
const LOCATION_SCHEDULE = {
  0: null,           // Sunday - Hsin-Chu
  1: 'Taipei',       // Monday
  2: 'Taipei',       // Tuesday
  3: 'Yi-Lan',       // Wednesday
  4: 'Yi-Lan',       // Thursday
  5: 'Hsin-Chu',     // Friday
  6: 'Hsin-Chu',     // Saturday
};

// Working hours configuration
const WORKING_HOURS = {
  start: 9,  // 9 AM
  end: 21,   // 9 PM
};

const SESSION_DURATION = 100; // minutes

export function getLocationForDay(date) {
  const dayOfWeek = date.getDay();
  return LOCATION_SCHEDULE[dayOfWeek];
}

export async function isTimeSlotAvailable(docClient, tables, startTime, endTime, location) {
  try {
    // Check if within working hours
    const hour = startTime.getHours();
    if (hour < WORKING_HOURS.start || hour >= WORKING_HOURS.end) {
      return false;
    }

    // Check if location matches day of week
    const expectedLocation = getLocationForDay(startTime);
    if (location !== expectedLocation) {
      return false;
    }

    // Check for conflicting 1-on-1 sessions
    const sessionsResult = await docClient.send(
      new QueryCommand({
        TableName: tables.sessions,
        IndexName: 'location-time-index',
        KeyConditionExpression: '#location = :location AND #startTime BETWEEN :rangeStart AND :rangeEnd',
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#location': 'location',
          '#startTime': 'startTime',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':location': location,
          ':rangeStart': new Date(startTime.getTime() - SESSION_DURATION * 60 * 1000).toISOString(),
          ':rangeEnd': endTime.toISOString(),
          ':status': 'scheduled',
        },
      })
    );

    if (sessionsResult.Items && sessionsResult.Items.length > 0) {
      // Check for actual time overlap
      for (const session of sessionsResult.Items) {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        
        if (
          (startTime >= sessionStart && startTime < sessionEnd) ||
          (endTime > sessionStart && endTime <= sessionEnd) ||
          (startTime <= sessionStart && endTime >= sessionEnd)
        ) {
          return false;
        }
      }
    }

    // Check for conflicting group classes
    const groupClassesResult = await docClient.send(
      new ScanCommand({
        TableName: tables.groupClasses,
        FilterExpression: '#location = :location AND #startTime BETWEEN :rangeStart AND :rangeEnd',
        ExpressionAttributeNames: {
          '#location': 'location',
          '#startTime': 'startTime',
        },
        ExpressionAttributeValues: {
          ':location': location,
          ':rangeStart': new Date(startTime.getTime() - SESSION_DURATION * 60 * 1000).toISOString(),
          ':rangeEnd': endTime.toISOString(),
        },
      })
    );

    if (groupClassesResult.Items && groupClassesResult.Items.length > 0) {
      for (const groupClass of groupClassesResult.Items) {
        const classStart = new Date(groupClass.startTime);
        const classEnd = new Date(groupClass.endTime);
        
        if (
          (startTime >= classStart && startTime < classEnd) ||
          (endTime > classStart && endTime <= classEnd) ||
          (startTime <= classStart && endTime >= classEnd)
        ) {
          return false;
        }
      }
    }

    // Check for blocked availability
    const availabilityResult = await docClient.send(
      new ScanCommand({
        TableName: tables.availability,
        FilterExpression: '#type = :type AND #startTime BETWEEN :rangeStart AND :rangeEnd',
        ExpressionAttributeNames: {
          '#type': 'type',
          '#startTime': 'startTime',
        },
        ExpressionAttributeValues: {
          ':type': 'blocked',
          ':rangeStart': new Date(startTime.getTime() - SESSION_DURATION * 60 * 1000).toISOString(),
          ':rangeEnd': endTime.toISOString(),
        },
      })
    );

    if (availabilityResult.Items && availabilityResult.Items.length > 0) {
      for (const blocked of availabilityResult.Items) {
        const blockedStart = new Date(blocked.startTime);
        const blockedEnd = new Date(blocked.endTime);
        
        if (
          (startTime >= blockedStart && startTime < blockedEnd) ||
          (endTime > blockedStart && endTime <= blockedEnd) ||
          (startTime <= blockedStart && endTime >= blockedEnd)
        ) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
}

export function getAvailableSlots(startDate, endDate, sessions, groupClasses, blockedTimes) {
  const slots = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const location = getLocationForDay(currentDate);
    
    if (location) {
      // Generate time slots for this day
      for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + SESSION_DURATION);

        // Check if slot is available
        const isAvailable = !isSlotConflicting(
          slotStart,
          slotEnd,
          sessions,
          groupClasses,
          blockedTimes
        );

        if (isAvailable && slotEnd.getHours() <= WORKING_HOURS.end) {
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            location,
          });
        }
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);
  }

  return slots;
}

function isSlotConflicting(slotStart, slotEnd, sessions, groupClasses, blockedTimes) {
  // Check sessions
  for (const session of sessions) {
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    
    if (timesOverlap(slotStart, slotEnd, sessionStart, sessionEnd)) {
      return true;
    }
  }

  // Check group classes
  for (const groupClass of groupClasses) {
    const classStart = new Date(groupClass.startTime);
    const classEnd = new Date(groupClass.endTime);
    
    if (timesOverlap(slotStart, slotEnd, classStart, classEnd)) {
      return true;
    }
  }

  // Check blocked times
  for (const blocked of blockedTimes) {
    const blockedStart = new Date(blocked.startTime);
    const blockedEnd = new Date(blocked.endTime);
    
    if (timesOverlap(slotStart, slotEnd, blockedStart, blockedEnd)) {
      return true;
    }
  }

  return false;
}

function timesOverlap(start1, end1, start2, end2) {
  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  );
}

export function formatDateForDisplay(date, locale = 'zh-TW') {
  return new Date(date).toLocaleString(locale, {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
  });
}
