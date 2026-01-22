# Tech Stack Analysis

## **Project: `serve-be`**

### **Backend Framework & Runtime**
-   **Framework**: NestJS (v11)
-   **Language**: TypeScript
-   **Runtime**: Node.js

### **Database & ORM**
-   **ORM**: TypeORM
-   **Database Driver**: `pg` (PostgreSQL)
-   **Cache/Queue Storage**: Redis (via Docker)

### **Key Libraries & Features**
-   **Authentication**: Passport, JWT, Bcrypt
-   **Queueing**: BullMQ
-   **Real-time**: Socket.io (@nestjs/websockets)
-   **HTTP Client**: Axios
-   **Validation**: class-validator, class-transformer

### **Infrastructure & External Services**
-   **Docker**: Used for Redis and Waha services
-   **WhatsApp API**: Waha (WhatsApp HTTP API) running in Docker

---

## **Project: `dashboard`**

### **Frontend Framework & UI**
-   **Framework**: Next.js (v15 - App Router)
-   **Library**: React (v19)
-   **Language**: TypeScript
-   **Package Manager**: pnpm

### **Styling & Design System**
-   **CSS Framework**: Tailwind CSS (v3)
-   **Styling Utilities**: `clsx`, `tailwind-merge`, `tailwind-variants`
-   **UI Primitives**: Radix UI (Dialog, Dropdown, Accordion, etc.)
-   **Icons**: Lucide React, Remixicon

### **Components & Utils**
-   **Charts**: Recharts
-   **Notifications**: Sonner
-   **Cookies**: js-cookie
-   **Theming**: next-themes
