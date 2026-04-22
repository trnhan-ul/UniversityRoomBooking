# University Room Booking System

University Room Booking System is a full-stack platform that helps universities manage room resources and booking workflows across web and mobile clients.

The project focuses on solving real operational problems such as overlapping reservations, schedule blocking, recurring bookings, role-based approvals, and room usage visibility.

## 1. Project Overview

- Multi-client system:
   - Web application for administration and booking operations
   - Mobile application for user booking interactions
- Centralized backend API with role-based permission control
- Booking lifecycle management from request to approval, check-in, extension, and completion
- Conflict-aware scheduling with support for blocked slots and holidays
- Operational support features including notifications, reporting, and issue tracking

## 2. Business Roles

- Student:
   - Browse and request room bookings
   - Manage personal bookings and check-in
- Lecturer:
   - Create single or recurring bookings for teaching activities
- Facility Manager:
   - Approve/reject booking requests
   - Manage room schedules and block/unblock time slots
- Administrator:
   - System-level governance, configurations, and monitoring

## 3. Core Functional Areas

- Authentication and account management
- Room and equipment management
- Booking engine with conflict detection
- Recurring booking workflows
- Calendar and schedule management
- Holiday and unavailable-time handling
- Notifications and auditability
- Dashboard metrics and reporting
- Facility issue reporting and resolution tracking

## 4. System Architecture

The architecture follows a client-server model:

- Client layer:
   - React web application
   - Expo React Native mobile application
- Service layer:
   - Node.js + Express REST API
   - Role-based access and booking business rules
- Data layer:
   - MongoDB with Mongoose models for domain entities

This design allows both clients to reuse one backend while keeping business logic centralized and consistent.

## 5. Technology Stack

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Nodemailer (email workflows)

### Frontend (Web)
- React 18
- React Router
- Axios
- Tailwind CSS
- Recharts + React Big Calendar

### Mobile
- Expo
- React Native
- React Navigation
- Axios
- TypeScript

## 6. Repository Structure

```text
wdp301_g4_university-room-booking-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── templates/
│   ├── utils/
│   ├── server.js
│   └── seedDatabase.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── utils/
└── mobile/
    ├── App.tsx
    ├── components/
    ├── config/
    ├── context/
    ├── hooks/
    ├── screens/
    ├── services/
    ├── types/
    └── utils/
```

## 7. Portfolio Value

This project demonstrates practical software engineering skills in:

- Designing domain-driven booking workflows
- Implementing real-world scheduling constraints and edge-case handling
- Building consistent APIs consumed by multiple clients
- Delivering role-oriented UX for operational systems
- Structuring a maintainable full-stack codebase for team collaboration
