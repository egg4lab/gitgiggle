# 100 Hour Fasting Journey

A beautiful single-page web application to track and support your **100-hour fasting journey** with a live countdown timer, progress visualization, motivational messages, and helpful tools for politely declining food offers.

**Repository:** [gitgiggle/fastingApp](https://github.com/egg4lab/gitgiggle/tree/main/fastingApp)

---

## 🌟 Features

- **⏱️ 100-Hour Countdown Timer** - Real-time display of days, hours, minutes, and seconds remaining
- **📊 Progress Bar** - Visual progress indicator with animated shimmer effect
- **📅 Custom Start Time** - Schedule your fast to begin at a specific date and time, or start immediately
- **💾 Progress Persistence** - Your fasting progress is automatically saved and persists across page refreshes using localStorage
- **💪 Motivation System** - Random encouragement messages and motivational quotes
- **📈 Motivation Level** - Dynamic motivation percentage that adjusts based on hours completed (100% → 70%)
- **🙏 Polite Refusal Responses** - Six pre-written, polite messages for declining food offers (click to copy):
  - Health Focus
  - Spiritual Practice
  - Personal Challenge
  - Medical Reasons
  - Timing-based
  - Alternative Suggestions
- **📋 Quick Refusal** - One-click button to copy a random refusal message
- **🎉 Completion Celebration** - Special popup when you complete the full 100 hours
- **⚠️ Accidental Exit Protection** - Browser warning when attempting to close during an active fast
- **📱 Responsive Design** - Beautiful glassmorphism UI that works on desktop, tablet, and mobile devices

---

## 🚀 How to Run

### Option 1: Direct File Access
1. Clone the repository:
   ```bash
   git clone https://github.com/egg4lab/gitgiggle.git
   cd gitgiggle/fastingApp
   ```
2. Open `index.html` directly in your web browser (double-click the file)

### Option 2: Local Server (Recommended)
1. Navigate to the fastingApp directory:
   ```bash
   cd gitgiggle/fastingApp
   ```
2. Start a local server (choose one):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open your browser and visit `http://localhost:8000`

**No build process or dependencies required!** Just open the HTML file in any modern browser.

---

## 💻 Tech Stack

- **HTML5** - Semantic structure and markup
- **CSS3** - Modern styling with:
  - Glassmorphism design
  - Gradient backgrounds
  - Smooth animations and transitions
  - Responsive grid layouts
  - Mobile-first approach
- **Vanilla JavaScript** - Pure JavaScript for:
  - Real-time countdown calculations
  - localStorage for data persistence
  - Clipboard API for copying refusal messages
  - Dynamic UI updates
  - Interval management

---

## 📖 Usage Guide

### Starting a Fast

1. **Custom Start Time:**
   - Set your desired start date and time using the date and time pickers
   - Click **"🚀 Start Fasting"** to begin at the scheduled time
   - The countdown will show time until start, then switch to remaining time

2. **Immediate Start:**
   - Click **"⚡ Start Now"** to begin immediately
   - Or leave date/time fields blank and click **"🚀 Start Fasting"**

### During Your Fast

- **View Progress:** Watch the countdown timer and progress bar update in real-time
- **Get Motivation:** Click **"💪 Get Motivation"** for random encouragement
- **Handle Food Offers:** Click any refusal card to copy a polite message, or use **"📋 Quick Refusal"** for a random one
- **Monitor Motivation:** Check your motivation level percentage (decreases gradually but stays above 70%)

### Ending Your Fast

- Click **"⏹️ End Fasting"** to stop the timer and clear your session
- Your progress will be cleared from localStorage

### Completion

- When you reach 100 hours, a celebration popup will appear
- The timer will stop and display your achievement

---

## 🌐 Browser Support

- **Modern Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **Requirements:**
  - JavaScript enabled
  - localStorage support
  - Clipboard API support (with fallback for older browsers)

---

## 📁 File Structure

```
fastingApp/
├── index.html    # Single-file application (HTML, CSS, JavaScript)
└── README.md     # This documentation file
```

---

## 🎨 Design Features

- **Glassmorphism UI** - Modern frosted glass effect with backdrop blur
- **Purple Gradient Background** - Beautiful gradient from blue to purple
- **Golden Accents** - Gold highlights for important elements
- **Smooth Animations** - Shimmer effects, pulse animations, and smooth transitions
- **Responsive Grid** - Adapts to different screen sizes
- **Accessibility** - Clear labels, readable fonts, and intuitive interactions

---

## 💡 Tips

- **Save Your Progress:** The app automatically saves your start time. If you refresh the page, your fast will continue from where you left off
- **Future Start Times:** You can schedule your fast to begin in the future - the countdown will show time until start
- **Refusal Messages:** All refusal messages are polite and respectful, suitable for various social situations
- **Motivation:** Random encouragement popups appear every 30-60 seconds during an active fast to keep you motivated

---

## 🔒 Privacy

- All data is stored locally in your browser's localStorage
- No data is sent to any external servers
- No tracking or analytics
- Completely private and offline-capable

---

## 📝 Notes

- The fast duration is exactly **100 hours** (4 days and 4 hours)
- Progress is calculated based on elapsed time from your start time
- If you set a future start time, the countdown will show time until start, then switch to remaining time
- The motivation level decreases slightly as hours complete but never goes below 70%

---

*Part of the [GitGiggle](https://github.com/egg4lab/gitgiggle) repository - A fun and engaging repository for Git practice and experimentation.*

---

**Good luck on your fasting journey! You've got this! 💪🌟**
