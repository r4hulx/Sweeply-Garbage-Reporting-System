# Sweeply - Garbage Reporting System

## Overview

Sweeply is a full-stack web application designed to streamline waste management by creating a direct communication channel between citizens and sanitation workers.

The platform allows users to report garbage accumulation by uploading images, providing descriptions, and sharing precise locations. Cleaning staff can view reports, update task statuses, and provide proof of completion.

---

## Problem Statement

Traditional waste complaint systems often rely on phone calls, emails, or manual tracking, resulting in delays, poor accountability, and lack of transparency.

Sweeply addresses these challenges by digitizing the reporting process and providing real-time visibility into waste management operations.

---

## Features

### Citizen Features

- User Registration & Login
- Secure Authentication using JWT
- Report Garbage Incidents
- Upload Images
- Provide Issue Descriptions
- Track Report Status

### Cleaner Features

- View Submitted Reports
- Access Report Details
- Update Cleaning Status
- Mark Reports as Cleaned

---

## Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas
- Mongoose ODM

### Authentication & Security

- JSON Web Tokens (JWT)
- bcrypt.js

### Cloud Services

- Cloudinary (Image Storage)

---

## System Workflow

1. Citizen logs in.
2. Citizen submits a garbage report.
3. Image, description, and location are stored.
4. Cleaner views assigned reports.
5. Cleaner updates status.
6. Cleaner marks task as completed.
7. Citizen can track resolution progress.

---

## Project Structure


Sweeply-Garbage-Reporting-System/
├── backend/
├── frontend/
└── README.md


---

## Future Enhancements

- Real-time notifications
- Interactive maps
- Admin dashboard
- Report analytics
- Mobile application support

---

## Author

Rahul Das

B.Tech Computer Science & Engineering

GitHub: https://github.com/r4hulx