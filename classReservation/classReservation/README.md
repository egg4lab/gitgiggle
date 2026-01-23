# Class Reservation System

A web-based scheduling platform for a single coach managing **25 students** across three locations: **Taipei** (Mon-Tue), **Yi-Lan** (Wed-Thu), and **Hsin-Chu** (Fri-Sun).

## Access

**Website:** https://egg4lab.github.io/gitgiggle/classReservation/

## Passcodes

### Coach
| Role | User ID | Passcode |
|------|---------|----------|
| Coach | coach | `coach123` |

### Students (25)
| Student ID | Passcode | Student ID | Passcode | Student ID | Passcode |
|------------|----------|------------|----------|------------|----------|
| Student 1 | `stu0001` | Student 10 | `stu0010` | Student 19 | `stu0019` |
| Student 2 | `stu0002` | Student 11 | `stu0011` | Student 20 | `stu0020` |
| Student 3 | `stu0003` | Student 12 | `stu0012` | Student 21 | `stu0021` |
| Student 4 | `stu0004` | Student 13 | `stu0013` | Student 22 | `stu0022` |
| Student 5 | `stu0005` | Student 14 | `stu0014` | Student 23 | `stu0023` |
| Student 6 | `stu0006` | Student 15 | `stu0015` | Student 24 | `stu0024` |
| Student 7 | `stu0007` | Student 16 | `stu0016` | Student 25 | `stu0025` |
| Student 8 | `stu0008` | Student 17 | `stu0017` | | |
| Student 9 | `stu0009` | Student 18 | `stu0018` | | |

## Core Features

- **Location-Based Scheduling:** Taipei (Mon-Tue), Yi-Lan (Wed-Thu), Hsin-Chu (Fri-Sun)
- **1-on-1 Sessions:** 100-minute sessions (3-6 per day)
- **Group Classes:** Publicly visible, block 1-on-1 availability
- **Travel Buffer:** 1.5-hour gap required between different cities
- **Privacy:** Students see coach availability only, not other students' bookings
- **Calendar Views:** Weekly and Monthly with color-coding (Blue: Taipei, Orange: Yi-Lan, Green: Hsin-Chu)
- **Notifications:** 2-hour advance notice for cancellations
- **Passcode Management:** Coach can reset student passcodes

## Coach Schedule

| Day | Location | Students | Sessions/Day |
|-----|----------|----------|--------------|
| Mon-Tue | Taipei | 1-6, 21-22 | 4 |
| Wed-Thu | Yi-Lan | 7-12, 23 | 4 |
| Fri-Sat | Hsin-Chu | 13-18, 24 | 4 |
| Sunday | Hsin-Chu | 19-20, 25 | 3 + Group |

## Quick Start

1. Visit the website
2. Click **"Login"**
3. Select **Role** (Coach or Student)
4. If Student, select **Student ID** and enter **Passcode**
5. Click **"Login"**

## Key Rules

- **Session Duration:** 100 minutes (1 hour 40 minutes)
- **Daily Capacity:** 3-6 sessions per day
- **Cancellation:** Coach must cancel at least 2 hours in advance
- **Only 1-on-1 sessions can be cancelled** (group classes cannot)
- **Data Storage:** Browser localStorage (per device)
- **Holidays:** Taiwan public holidays (2025-2026) are automatically blocked

## User Roles

### Coach
- Create/cancel 1-on-1 and group sessions
- Reset student passcodes
- View all bookings
- Location-based validation

### Student
- View coach availability (privacy-protected)
- Book 1-on-1 sessions
- View personal schedule (pop-up on login)
- Receive cancellation notifications
- Access notification inbox

---

*Last Updated: January 2025 - 25 Students System*
