# Enterprise Academic ERP: Smart Campus Node

A comprehensive, high-density Academic ERP system designed for modern campuses. This system integrates academic architecture, master scheduling, learning resource management, and high-fidelity admin analytics into a unified, glassmorphic interface.

## 🚀 Key Features

### 🏛️ 1. Academic Architecture
- **Section Management**: Dynamic creation and orchestration of sections (Branch, Year, Sem).
- **Matrix Mapping**: Intelligent `Section -> Subject -> Teacher` mapping for automated data routing.
- **Bulk Registry**: Efficient student-to-section assignment with RFID mapping support.

### 📅 2. Master Timetable Engine
- **Role-Based Views**: Automated schedule filtering for Students (My Section) and Teachers (My Slots).
- **Slot Management**: Admin-managed timetable with support for Rooms, Lecture Types, and Time Slots.
- **RFID Sync**: Ready for real-time attendance validation against active schedule slots.

### 📚 3. Learning Vault (Resources)
- **Data Isolation**: Section-locked visibility for notes, tutorials, and materials.
- **Assignment System**: Targeted task deployment with deadline tracking and submission protocols.
- **Resource Security**: Strict permissions ensuring students only access relevant academic content.

### 📊 4. Intel Command Center (Analytics)
- **Performance Heatmaps**: Section-wise comparative analytics for attendance and academics.
- **Critical Alerts**: Real-time identification of students with low attendance telemetry (<75%).
- **Signal Broadcaster**: Targeted global or section-specific notification system for administrators.

## 🛠️ Technical Stack

- **Frontend**: React.js, Tailwind CSS (V4), Framer Motion, Recharts, Lucide Icons.
- **Backend**: Spring Boot (Java), MongoDB (Atlas).
- **Services**: Centralized Axios API layer, OAuth2/JWT Authentication, Theme Context.

## 📥 Prerequisites & Setup

To run this project locally, you need the following installed:

### 1. Development Environment
- **Node.js** (v18.0 or higher) - [Download](https://nodejs.org/)
- **Java JDK 17** or higher - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven** (optional, wrapper included)
- **Database**: MongoDB Atlas (Connection URI configured in `application.properties`)

### 2. Implementation Steps

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd MyCampusSmartDashboardSystem
   ```
2. Ensure your MongoDB Atlas URI is configured correctly in `src/main/resources/application.properties`.
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
Avinash-Project/
├── Frontend/                 # React Vite Project (Modern UI)
├── MyCampusSmartDashboardSystem/ # Spring Boot Project (REST API)
├── README.md                 # System overview and setup guide
└── walkthrough.md           # detailed technical implementation guide
```

## 🌓 Theme & Aesthetic
The system uses a **Glassmorphic Design System** with a customizable **Dynamic Accent Color** engine. Users can change the "Chroma Sync" in the header to update the entire dashboard's visual profile in real-time.

---
*Developed for Advanced Campus Operations.*
