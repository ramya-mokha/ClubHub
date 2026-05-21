# ClubHub 
A Unified College Club & Student Engagement Platform

ClubHub is a centralized web platform designed to streamline **college club management, student engagement, event coordination, and academic assistance**.  
It replaces fragmented tools like WhatsApp groups, Google Forms, and spreadsheets with a single, structured, and scalable system.


## Problem Statement

In most colleges, club activities and academic coordination suffer from:
- Scattered communication across multiple platforms
- Manual and error-prone event and member management
- No centralized view of announcements, hiring, or schedules
- Difficulty for students to track events and academic timetables

This leads to confusion, missed opportunities, and poor engagement.


## Our Solution

ClubHub provides a **unified digital platform** where:
- Clubs can manage events, members, hiring, and announcements
- Students can discover clubs, events, and academic information easily
- AI assists users through an interactive chatbot and timetable extraction

The platform supports **role-based dashboards** ensuring clarity, security, and efficiency.


## Key Features

### Student Features
- Browse and filter clubs and events
- View announcements in real time
- Academic timetable extraction & viewing
- AI chatbot for guidance and quick queries

### Club Admin Features
- Create, edit, and manage events
- Draft & publish events
- Manage club hiring status with Google Form links
- Post announcements
- View upcoming and past events
- Club dashboard with analytics-ready structure

### AI Features
- AI chatbot for:
  - Platform guidance
  - Event & timetable queries
- Academic timetable extraction from uploaded data
- AI powered via **Gemini (through puter.js)**

### Platform Admin Features
- Approve and manage clubs
- Monitor platform activity
- Ensure role-based access control


## Architecture Overview

- **Client Layer**  
  React + Vite frontend with role-based dashboards (Student, Club, Admin)

- **Backend & Services**
  Firebase Firestore (Database)  
  Firebase Authentication  
  Firebase Storage  

- **AI Layer**
  Gemini AI accessed via puter.js  
  Used only where meaningful (chatbot & timetable parsing)

- **Deployment**
  Firebase Hosting / Vercel (frontend-ready)


## Google Technologies Used

- **Firebase Authentication** – Secure login & role management  
- **Firestore Database** – Real-time data storage  
- **Firebase Storage** – Assets & uploads  
- **Gemini AI** – AI chatbot & timetable extraction (via puter.js)  


## Process Flow (High Level)

1. User logs in (Student / Club / Admin)
2. Role-based dashboard loads
3. User interacts with events, clubs, or academics
4. AI chatbot assists where needed
5. Data updates reflect in real time via Firestore


## Future Enhancements

- AI-powered event recommendations
- Smart notifications & reminders
- Advanced analytics dashboard for clubs
- Attendance prediction & insights
- Mobile app / PWA support
- Deeper AI integration (only where value is added)





## Team

Built as part of **GDG on Campus - TechSprint**  
Focused on scalability, clean UX, and practical AI usage.


## License

This project is for educational and hackathon purposes.
