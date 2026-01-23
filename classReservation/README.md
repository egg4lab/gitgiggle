# Class Reservation System

A comprehensive coaching management system for scheduling 1-on-1 and group sessions across multiple locations.

## Access Information

### Website URL
**https://egg4lab.github.io/gitgiggle/classReservation/**

## Passcode Table

### Coach Access
| Role | User ID | Passcode |
|------|---------|----------|
| Coach | coach | `coach123` |

### Student Access (25 Students)
| Role | User ID | Passcode |
|------|---------|----------|
| Student | Student 1 | `stu0001` |
| Student | Student 2 | `stu0002` |
| Student | Student 3 | `stu0003` |
| Student | Student 4 | `stu0004` |
| Student | Student 5 | `stu0005` |
| Student | Student 6 | `stu0006` |
| Student | Student 7 | `stu0007` |
| Student | Student 8 | `stu0008` |
| Student | Student 9 | `stu0009` |
| Student | Student 10 | `stu0010` |
| Student | Student 11 | `stu0011` |
| Student | Student 12 | `stu0012` |
| Student | Student 13 | `stu0013` |
| Student | Student 14 | `stu0014` |
| Student | Student 15 | `stu0015` |
| Student | Student 16 | `stu0016` |
| Student | Student 17 | `stu0017` |
| Student | Student 18 | `stu0018` |
| Student | Student 19 | `stu0019` |
| Student | Student 20 | `stu0020` |
| Student | Student 21 | `stu0021` |
| Student | Student 22 | `stu0022` |
| Student | Student 23 | `stu0023` |
| Student | Student 24 | `stu0024` |
| Student | Student 25 | `stu0025` |

## How to Login

1. Open the website: https://egg4lab.github.io/gitgiggle/classReservation/
2. Click the **"Login"** button
3. Select your **Role** (Coach or Student)
4. If Student, select your **Student ID** from the dropdown
5. Enter your **Passcode** from the table above
6. Click **"Login"**

## Features

- **Multi-Location Support**: Hsin-Chu, Taipei, and Yi-Lan
- **Coach Location Schedule**: 
  - Hsin-Chu: Friday to Sunday
  - Taipei: Monday to Tuesday
  - Yi-Lan: Wednesday to Thursday
- **1.5-Hour Travel Buffer**: Automatic validation between different cities
- **Session Management**: 3-6 sessions per day capacity
- **1-on-1 Sessions**: 100-minute (1 hour 40 minutes) intensive coaching sessions
- **Group Classes**: Publicly visible sessions that block 1-on-1 availability
- **25 Students**: System supports up to 25 students for 1-on-1 sessions
- **Weekly & Monthly Views**: Comprehensive calendar visualization
- **Daily Occupied Bar**: Visual capacity indicators
- **Color-Coded Locations**: Quick visual identification (Green=Hsin-Chu, Blue=Taipei, Orange=Yi-Lan)
- **Notification System**: Automated inbox notifications for cancellations
- **Passcode Management**: Coach can reset student passcodes
- **Taiwan Holidays**: Automatic holiday detection and booking restrictions

## Coach Features

- Create and manage sessions (1-on-1 and Group)
- Cancel 1-on-1 sessions (with 2-hour advance notice requirement)
- Reset student passcodes
- View all bookings and availability
- Location-based scheduling validation

## Student Features

- View coach availability (privacy-protected)
- Book 1-on-1 sessions
- View personal schedule summary (shown on login)
- Receive cancellation notifications
- Access notification inbox
- Automatic booking prompt on login if no sessions scheduled

## Important Notes

- **Session Duration**: 1-on-1 sessions are 100 minutes (1 hour 40 minutes)
- **Coach Schedule**: 
  - Hsin-Chu: Friday, Saturday, Sunday
  - Taipei: Monday, Tuesday
  - Yi-Lan: Wednesday, Thursday
- **Travel Buffer**: Sessions in different cities require a 1.5-hour gap
- **Session Limits**: Maximum 6 sessions per day, minimum 3 recommended
- **Cancellation Policy**: Coach must cancel at least 2 hours before session start
- **Privacy**: Students cannot see other students' schedules, only coach availability
- **Data Storage**: All data is stored in browser localStorage (per device)
- **Taiwan Holidays**: System automatically blocks bookings on Taiwan public holidays (2025-2026)
- **Location Validation**: System prevents booking at wrong location based on day of week

## System Requirements

- Modern web browser with JavaScript enabled
- LocalStorage support (for data persistence)
- Responsive design works on desktop, tablet, and mobile devices

## Support

For issues or questions, please contact the system administrator.

---

*Last Updated: January 2025 - Updated for 20 students*
