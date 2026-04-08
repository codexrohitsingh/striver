# 🗓 Interactive Wall Calendar Component

A polished, interactive React/Next.js calendar component inspired by the aesthetic of a physical wall calendar. This project demonstrates the translation of a static design concept into a highly functional, responsive, and user-friendly web component.

## ✨ Features

- **Wall Calendar Aesthetic**: 
  - Dedicated space for a **Hero Image** that serves as the visual anchor for each month.
  - Realistic **Spiral Binding Effect** for a physical feel.
  - Bold typography and angular visual anchors inspired by the reference design.
  
- **Realistic "Page-Turning" Animation**:
  - Implemented smooth, 3D "flipping" transitions using `framer-motion` and CSS 3D transforms. 
  - The animation simulates a physical page being lifted and turned, with subtle `rotateX`, `rotateY`, and `scale` adjustments.

- **Day Range Selector**:
  - Intuitive start and end date selection across the calendar grid.
  - Clear visual states for the **Start Date**, **End Date**, and **In-Between Days**.
  - A dedicated selection helper for reviewing and clearing the current range.

- **Integrated Notes Section**:
  - **Lined Paper Aesthetic** matching the physical calendar look.
  - Support for **General Memos** and **Date-Specific Notes**.
  - **Data Persistence**: Uses `localStorage` to save notes across browser sessions.
  - Full CRUD functionality (Add, View, Delete).

- **Fully Responsive Design**:
  - **Desktop**: Side-by-side layout (Hero Image | Grid & Notes).
  - **Mobile**: Stacked vertical layout optimized for touch interaction.

- **Creative Flourishes**:
  - **Holiday Markers**: Pre-configured holidays with informative tooltips.
  - **Dynamic Theming**: Each month features a unique high-resolution image.
  - **Note Indicators**: Visual pulses on dates that have associated notes.

## 🛠 Tech Stack

- **Next.js 16 (App Router)**: Modern React framework for routing and performance.
- **React 19**: Utilizing the latest React features and hooks.
- **Tailwind CSS 4**: For utility-first styling and custom 3D animations.
- **Framer Motion**: Powering the realistic 3D transitions and micro-interactions.
- **Lucide React**: Clean and consistent iconography.
- **date-fns**: Robust date manipulation and logic.

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd striver/my-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

- `app/components/Calendar/Calendar.tsx`: The main component containing the calendar logic, state management, and 3D animations.
- `app/lib/utils.ts`: Utility for merging Tailwind classes.
- `app/globals.css`: Custom CSS for 3D perspective and scrollbar hiding.

## 💡 Implementation Details

- **Animation Strategy**: Used `AnimatePresence` with custom `variants` to achieve the flipping effect. The `rotateX` and `rotateY` properties are calculated based on the navigation direction (Next/Prev).
- **Date Logic**: Leveraged `eachDayOfInterval` and `startOfWeek` (with `weekStartsOn: 1` for Monday) to build a consistent 7-column grid that handles month transitions correctly.
- **State Management**: Managed through React `useState` for range selection, current month tracking, and notes management.

## 📝 Submission Note

This project focuses entirely on frontend engineering. All data (notes, ranges) is persisted client-side for evaluation efficiency.
