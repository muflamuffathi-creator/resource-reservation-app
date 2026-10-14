# PrimeWave Lab - Resource Reservation Management System

> **Full-Stack Software Engineering Internship Technical Assessment**  
> Built for **PrimeWave Lab (Pvt) Ltd** | Submission Date: October 15, 2026

[![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma%20ORM-3982CE?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon%20Serverless-00E599?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech/)

---

## 🛠️ Skills & Technologies

### Front-End
![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Back-End
![Next.js API](https://img.shields.io/badge/Next.js%20Route%20Handlers-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma ORM](https://img.shields.io/badge/Prisma%20ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

### Database
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon%20Cloud%20Postgres-00E599?style=for-the-badge&logo=neon&logoColor=black)

### Tools & Platforms
![Git](https://img.shields.io/badge/Git-E44C30?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white)

---

## 📌 Executive Summary & Business Scenario

High-growth organizations manage shared facilities and resources (e.g., GPU servers, 3D printers, media studios, conference boardrooms) across multiple teams. Handling bookings through manual communication and spreadsheets leads to:
* ❌ **Double-Bookings & Scheduling Confusion:** Clashing time slots disrupting operations.
* ❌ **Lack of Real-Time Visibility:** Uncertainty about asset availability and maintenance status.
* ❌ **Operational Inefficiencies:** Excessive manual coordination.

### The Solution:
PrimeWave Resource Reservation System provides:
1. 🏢 **Centralized Resource Directory:** Categorized resources with live status and capacity limits.
2. ⚡ **Deterministic Conflict Prevention Engine:** Real-time mathematical validation stopping overlapping bookings.
3. 📅 **Interactive Timeline Schedule:** Visual hourly grid showing available vs. booked slots.
4. 📋 **Reservation Management:** Self-service booking with status tracking and instant cancellation.

---

## 📊 Entity Relationship (ER) Diagram

<p align="center">
  <img src="./docs/er-diagram.png" alt="PrimeWave Entity Relationship Diagram" width="800" />
</p>

### 🗄️ Database Entities & Architecture

| Entity | Primary Key | Foreign Keys | Key Attributes & Enums | Description |
|---|---|---|---|---|
| **Department** | `id` (UUID) | — | `name`, `code` (Unique) | Organizational units and faculties |
| **User** | `id` (UUID) | `departmentId` | `name`, `email` (Unique), `role` (`ADMIN`, `MEMBER`) | Registered team members and administrators |
| **Category** | `id` (UUID) | — | `name` (Unique), `icon` | Resource classifications (e.g., Computing, Labs) |
| **Resource** | `id` (UUID) | `categoryId` | `name`, `location`, `capacity`, `status` (`ACTIVE`, `MAINTENANCE`, `RETIRED`) | Physical or digital facilities and equipment |
| **Reservation** | `id` (UUID) | `resourceId`, `userId` | `title`, `startTime`, `endTime`, `status` (`CONFIRMED`, `CANCELLED`, `COMPLETED`) | Scheduled bookings with conflict prevention |

#### Relational Constraints:
* **Department &rarr; User:** One department employs many users (`1:N`).
* **Category &rarr; Resource:** One category classifies many resources (`1:N`).
* **Resource &rarr; Reservation:** One resource is scheduled for many reservations (`1:N` with Cascade Delete).
* **User &rarr; Reservation:** One user books many reservations (`1:N` with Cascade Delete).

---

## ⚡ Conflict-Checking Logic & Algorithm

### Mathematical Overlap Theorem
Two time intervals $[A_{\text{start}}, A_{\text{end}}]$ and $[B_{\text{start}}, B_{\text{end}}]$ collide if and only if:

$$\text{Start}_A < \text{End}_B \quad \land \quad \text{End}_A > \text{Start}_B$$

This condition handles all four overlap scenarios:
1. Partial overlap at the start of an existing reservation.
2. Partial overlap at the end of an existing reservation.
3. A new booking completely contained inside an existing reservation.
4. A new booking completely encompassing an existing reservation.

### Implementation:
- **Pre-flight Live Validation (`/api/check-conflict`):** Runs as the user picks dates/times in the modal, giving instant feedback.
- **Database Index Optimization:** Composite index `@@index([resourceId, startTime, endTime])` ensures sub-millisecond query execution.

---

## 🚀 Setup & Local Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL Database** (e.g. [Neon Serverless](https://neon.tech))

### 1. Clone the Repository
```bash
git clone https://github.com/muflamuffathi-creator/resource-reservation-app.git
cd resource-reservation-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-POOLER.neon.tech/neondb?sslmode=require&connect_timeout=30&pool_timeout=30&connection_limit=10"
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:YOUR_PASSWORD@ep-YOUR-DIRECT.neon.tech/neondb?sslmode=require&connect_timeout=30"
```

### 4. Sync Database & Seed Initial Data
```bash
# Push schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed sample categories, resources, and demo reservations
npm run db:seed
```

### 5. Run the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎥 Demonstration Video Structure (3–5 Minutes)

1. **Introduction (0:00 - 0:45):** Business scenario, problem of overlapping bookings, and modern full-stack tech choices.
2. **Resource Catalog & Schedule (0:45 - 1:45):** Real-time status filtering and timeline visual availability.
3. **Conflict Prevention Engine (1:45 - 3:00):** Intentionally creating an overlapping booking, showing the conflict detection in action, and successfully booking a free slot.
4. **Database Verification (3:00 - 3:45):** Showing the updated records in Prisma Studio / PostgreSQL in Neon.
5. **Conclusion & Technical Highlights (3:45 - 4:30):** ACID compliance, TypeScript type safety, and clean software architecture.

---

## 👤 Author
* **Developer:** Mufla Muffathi ([@muflamuffathi-creator](https://github.com/muflamuffathi-creator))
* **Application:** PrimeWave Lab Internship Technical Assessment
