# PrimeWave Lab — Resource Reservation Management System

> **Full-Stack Engineering Internship Technical Assessment**  
> Built with Next.js (App Router), TypeScript, PostgreSQL (Neon Lakebase), and Prisma ORM.

---

## 1. Executive Summary & Business Scenario

Growing organizations manage numerous shared resources and facilities—including executive boardrooms, hardware testing benches, rapid prototyping gear, podcast studios, and high-performance computing clusters.

### The Problem
When managed informally through manual logs or chat messages, organizations suffer from:
* **Double-Bookings & Scheduling Clashes:** Overlapping reservations creating operational friction.
* **Lack of Real-Time Visibility:** Uncertainty around which assets are free or in maintenance.
* **Race Conditions:** Simultaneous booking attempts corrupting scheduling state.

### The Solution
This centralized digital platform solves these challenges through:
1. **Interactive Resource Catalog:** Categorized directory of all shared facilities with live capacity and status tracking.
2. **Deterministic Conflict-Prevention Engine:** Dual-layer overlap detection (pre-flight UI validation + ACID transaction serialization).
3. **Daily Schedule & Timeline Grid:** Visual hourly matrix (08:00–18:00) showing booked vs. free blocks.
4. **Self-Service Reservation Management:** Audit logs with immediate cancellation and status updates.

---

## 2. Technology Stack & Architectural Decisions

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | **Next.js (App Router)** | Full-stack architecture with React Server Components, server actions, and optimized route handlers. |
| **Language** | **TypeScript** | Strict type safety across database schemas, API contracts, and UI components. |
| **Database** | **PostgreSQL (Neon Lakebase)** | Serverless, branchable Postgres with pooled connections for app traffic and unpooled direct URLs for migrations. |
| **ORM** | **Prisma ORM** | Type-safe schema definition, transactional consistency (`$transaction`), and auto-generated clients. |
| **Styling** | **Tailwind CSS** | Sleek dark-mode aesthetic with custom design tokens and micro-interactions. |
| **Icons** | **Lucide React** | Accessible, consistent iconography. |

---

## 3. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    DEPARTMENT ||--o{ USER : employs
    USER ||--o{ RESERVATION : books
    CATEGORY ||--o{ RESOURCE : classifies
    RESOURCE ||--o{ RESERVATION : scheduled_for

    DEPARTMENT {
        string id PK
        string name
        string code UK
        datetime createdAt
    }

    USER {
        string id PK
        string email UK
        string name
        string role "ADMIN | MEMBER"
        string departmentId FK
        datetime createdAt
    }

    CATEGORY {
        string id PK
        string name UK
        string icon
        datetime createdAt
    }

    RESOURCE {
        string id PK
        string name
        string categoryId FK
        string location
        int capacity
        string status "ACTIVE | MAINTENANCE | RETIRED"
        string description
        datetime createdAt
        datetime updatedAt
    }

    RESERVATION {
        string id PK
        string resourceId FK
        string userId FK
        string title
        datetime startTime "TIMESTAMPTZ"
        datetime endTime "TIMESTAMPTZ"
        string status "CONFIRMED | CANCELLED | COMPLETED"
        string notes
        datetime createdAt
        datetime updatedAt
    }
```

---

## 4. Conflict-Checking Logic & Concurrency Control

### Mathematical Overlap Theorem
Two time intervals $[A_{\text{start}}, A_{\text{end}}]$ and $[B_{\text{start}}, B_{\text{end}}]$ collide if and only if:
$$\text{Start}_A < \text{End}_B \quad \land \quad \text{End}_A > \text{Start}_B$$

### Dual-Layer Implementation:
1. **Pre-flight Live Detection (`/api/check-conflict`):**
   * Debounced check triggered as user selects time slots in the booking modal.
   * Warns the user *before* submission if another team has reserved that window.
2. **Transaction Isolation (`prisma.$transaction`):**
   * Encapsulates overlap query and insertion inside an ACID transaction.
   * Prevents race conditions when two users click "Confirm" simultaneously.

---

## 5. Local Setup & Installation Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL Connection String** (Local or Cloud like Neon)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/resource-reservation-app.git
cd resource-reservation-app
```

### Step 2: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:
```env
# Neon PostgreSQL Connection Strings
DATABASE_URL="postgresql://neondb_owner:password@ep-xyz-pooler.region.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require"

# Neon Project Context
NEON_ORG_ID="org-your-org"
NEON_PROJECT_ID="your-project-id"
NEON_BRANCH_NAME="production"
```

### Step 4: Sync Database Schema & Seed Data
```bash
# Push schema directly to PostgreSQL
npx prisma db push

# Seed realistic facilities, labs, and demo bookings
node prisma/seed.mjs
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 6. Demonstration Video Script & Talking Points (3–5 Minutes)

When recording your screen demonstration video:

1. **Introduction (0:00 - 0:45):**
   * Introduce yourself and state the purpose: Solving PrimeWave Lab's shared facility scheduling challenges.
   * Highlight the core stack: Next.js App Router, TypeScript, Neon PostgreSQL, and Prisma.
2. **Dashboard & Metric Overview (0:45 - 1:30):**
   * Show the homepage metrics: Total Resources, Active Bookings Today, and 100% Conflict Prevention.
   * Show the featured shared facilities (Executive Boardrooms, 3D Prototyping FabLab, Media Studio).
3. **Demonstrating Conflict Prevention (1:30 - 2:45):**
   * Click **"Book Resource"**.
   * Pick *Boardroom Alpha* and select a time slot that overlaps with the existing *Q4 Architecture Review* meeting (e.g. 10:00 AM - 11:00 AM).
   * Show the instant red warning: *"Schedule Conflict Detected"*.
   * Shift the time to an available window (e.g. 11:30 AM - 12:30 PM) to show the green confirmation: *"Slot is available"*.
   * Submit and show the booking appearing immediately on the live feed.
4. **Timeline & Booking Management (2:45 - 3:30):**
   * Navigate to `/schedule` to show the daily 08:00–18:00 hourly timeline.
   * Navigate to `/reservations` and demonstrate canceling a reservation, freeing up that slot in real time.
5. **Architectural Highlights & Closing (3:30 - 4:15):**
   * Explain the mathematical overlap condition and transaction serialization.
   * Conclude by summarizing reliability, usability, and maintainability.
