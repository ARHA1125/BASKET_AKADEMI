# 4.1 Technology Architecture

The system is built using a modern, type-safe full-stack architecture designed for scalability, maintainability, and high performance. The technology stack distinguishes between the heavy-lifting backend services and the interactive frontend dashboard.

## 1. Backend Layer (Service-Oriented)
The backend is the core of the system, handling business logic, data persistence, and background processing.

*   **Framework: NestJS (Node.js)**
    *   Chosen for its strong modular architecture and built-in dependency injection, which aligns with enterprise software standards.
    *   It provides a structured environment that scales well as the application grows complex.

*   **Language: TypeScript**
    *   Used throughout the entire stack (Frontend and Backend) to ensure type safety, reduce runtime errors, and improve developer productivity with better tooling support.

*   **Database & ORM: PostgreSQL & TypeORM**
    *   **PostgreSQL** was selected as the primary relational database for its reliability and advanced features.
    *   **TypeORM** handles the Object-Relational Mapping, allowing for safe and intuitive database interactions using TypeScript classes and entities.

*   **Real-time Communication: Socket.io**
    *   Implemented specifically for the **Chat & Messaging System**.
    *   It provides low-latency, bi-directional communication channels, allowing users to send and receive messages instantly without refreshing the page.
    *   It ensures reliability by automatically falling back to HTTP long-polling if WebSockets are unavailable.

*   **Asynchronous Processing: Redis & BullMQ**
    *   **Redis** acts as a high-performance in-memory data store used for caching and managing job queues.
    *   **BullMQ** leverages Redis to handle background jobs (such as generating invoices or sending notifications) asynchronously, preventing heavy tasks from blocking the main API thread.

## 2. Frontend Layer (Dashboard)
The dashboard provides the administrative and user interface for the system.

*   **Framework: Next.js 15 (App Router)**
    *   Provides a highly performant React framework with Server-Side Rendering (SSR) and Server Components.
    *   Ensures faster initial page loads and better SEO capabilities compared to traditional Single Page Applications (SPAs).

*   **UI/UX Design: Tailwind CSS & Radix UI**
    *   **Tailwind CSS** enables rapid UI development with utility-first styling.
    *   **Radix UI** provides unstyled, accessible UI primitives (like Modals, Accordions, Dropdowns), allowing for a fully custom design system without the bloat of pre-styled component libraries.

*   **State & Data Visualization**
    *   Built on **React 19** for modern state management.
    *   **Recharts** is used to render responsive and interactive data charts for the analytics dashboard.

## 3. Infrastructure & Services
*   **Containerization: Docker**
    *   Used to containerize external services like Redis and the WhatsApp API.
    *   Ensures that the development, testing, and production environments are consistent and isolated.

*   **Third-Party Integration: WAHA (WhatsApp HTTP API)**
    *   A self-hosted WhatsApp API running via Docker.
    *   Enables the system to send automated WhatsApp notifications and alerts programmatically.
