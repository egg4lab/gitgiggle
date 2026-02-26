# AGENTS.md

## Cursor Cloud specific instructions

### Overview

GitGiggle is a repository of two independent, purely client-side static HTML/CSS/JS web applications with zero build dependencies, no package manager, and no backend.

| App | Path | Description |
|-----|------|-------------|
| Class Reservation System | `classReservation/index.html` | Coaching session scheduler with coach/student roles, multi-location support |
| 100 Hour Fasting Journey | `fastingApp/index.html` | Fasting countdown timer with motivational features |

### Running locally

Serve the repo root with any static HTTP server:

```bash
python3 -m http.server 8080
```

Then open:
- http://localhost:8080/classReservation/index.html
- http://localhost:8080/fastingApp/index.html

### Test credentials (Class Reservation)

See `classReservation/README.md` for full passcode table. Quick reference:
- **Coach**: user `coach`, passcode `coach123`
- **Students**: user `Student N`, passcode `stu000N` (N = 1-25)

### Key notes

- No dependencies to install, no build step, no linter, no test framework.
- All data is stored in browser `localStorage`; clearing it resets state.
- Both apps are single self-contained `index.html` files (~770-1875 lines each).
