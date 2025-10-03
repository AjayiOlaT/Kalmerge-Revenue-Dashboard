# Kalmerge: Interactive Revenue Growth Strategy Dashboard

**A single-page, fully interactive web dashboard designed to visualize, model, and understand Kalmerge's comprehensive revenue growth strategy.**

---

### **[🚀 Live Application Link: https://kalmergerevenue.netlify.app/](https://kalmergerevenue.netlify.app/)**

---

## 📖 Overview

This dashboard is a powerful strategic planning tool built for executive teams, financial analysts, and product managers. It transforms a static financial report into a dynamic, hands-on model, allowing users to explore potential revenue outcomes in real-time by adjusting core business assumptions. The application provides a clear, data-driven view of the company's trajectory, making complex financial projections intuitive and accessible.

## ✨ Key Features

This application is packed with features designed for deep strategic analysis and easy presentation.

*   **Dynamic Financial Modeling:** Adjust 11 different core assumptions—from new user sign-ups to churn rate—using intuitive sliders. All charts, tables, and key metrics update instantly to reflect your changes.
*   **Interactive Pricing Table:** The pricing tier table is fully editable. You can change plan names, features, and, most importantly, the prices for the Basic and Professional plans, with all changes immediately impacting the 36-month revenue forecast.
*   **Multiple Chart Views:** Analyze the projection data from different angles with four distinct chart types:
    *   **MRR Growth:** A line chart showing the overall MRR trajectory.
    *   **MRR Composition:** A stacked area chart breaking down revenue by plan.
    *   **Customer Flow:** A bar chart comparing new vs. churned customers.
    *   **Final Customer Mix:** A pie chart showing the distribution of customers across tiers at month 36.
*   **AI-Powered Narrative Analysis:** Don't just see the data—understand the story behind it. The "✨ Explain with AI" feature uses the Google Gemini API to generate a personalized, step-by-step guided tour that explains the current projection based on your specific assumptions.
*   **Guided Onboarding Tour:** A welcoming, step-by-step tour introduces first-time users to the dashboard's key interactive features, ensuring they can get started immediately.
*   **Comprehensive Export Options:** Seamlessly integrate your findings into reports and presentations with robust download capabilities:
    *   **Full Report:** Download the entire dashboard view as a high-resolution **PNG** or a multi-page **PDF**.
    *   **Section-Specific:** Export the Pricing Table or the complete Financial Projections section as a **PNG**.
    *   **Data Export:** Download the raw projection data or the pricing table structure as a **CSV** file for use in other tools like Excel or Google Sheets.
*   **Persistent State:** All your assumption adjustments are automatically saved in your browser's local storage. You can refresh the page or come back later, and your scenario will be exactly as you left it.

## 👩‍💼 For Non-Technical Users: How to Use the Dashboard

This dashboard is designed to be intuitive. Here’s how you can get the most out of it:

1.  **Take the Guided Tour:** When you first visit, you'll be prompted to take a quick tour. Click "Next" to be guided through the main interactive elements.
2.  **Adjust the Levers:** In the **Financial Projections** section, use the sliders to change the assumptions. For example, see what happens to the final MRR if you increase the "Free-to-Paid Conversion" rate.
3.  **Edit the Pricing:** In the **Pricing & Feature Tiers** section, click on the prices for the "Basic Plan" or "Professional Plan" to type in new values. Watch how this immediately affects the charts below.
4.  **Get AI Insights:** Once you've set up a scenario you're interested in, click the **"✨ Explain with AI"** button. An AI analyst will walk you through a 5-step story explaining what the data means.
5.  **Switch Chart Views:** Use the tabs next to the projection chart ("MRR Growth", "MRR Composition", etc.) to explore the data from different perspectives.
6.  **Download Your Report:** Use the **"Download"** buttons in the header or in each section to save your work as an image, PDF, or data file.

## 👨‍💻 For Technical Users: Technical Overview

This project is a modern, client-side single-page application built with a focus on interactivity, performance, and security.

### Core Technologies

*   **Frontend:** [React](https://reactjs.org/) (v18) with [TypeScript](https://www.typescriptlang.org/) for robust, type-safe components.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first, responsive design system.
*   **Charting:** [Recharts](https://recharts.org/) for creating beautiful, declarative, and interactive charts.
*   **AI Integration:** [Google Gemini API](https://ai.google.dev/) for generating narrative explanations of the financial data.

### Key Libraries

*   **Exporting to Image/PDF:**
    *   `html-to-image`: For converting DOM elements into high-quality PNG images.
    *   `jspdf` & `html2canvas`: For client-side generation of PDF documents from the dashboard's HTML content.
*   **State Management:**
    *   React Hooks (`useState`, `useMemo`, `useCallback`) are used for managing local component and application state.
    *   A custom `useLocalStorage` hook provides persistence for user-adjusted assumptions across browser sessions.

### Architecture & Project Structure

The application follows a standard component-based architecture.

*   `src/components/`: Contains all reusable React components (e.g., `SliderInput`, `Header`, `Section`).
*   `src/hooks/`: Holds custom React hooks, such as `useProjection` for the core calculation logic and `useLocalStorage` for state persistence.
*   `src/constants.ts`: A central file for default data, assumptions, and configuration constants.
*   `src/types.ts`: Defines all TypeScript types and interfaces used throughout the application.
*   `netlify/functions/`: Contains the serverless backend function.
    *   `generate-explanation.ts`: A Netlify serverless function that acts as a secure backend proxy. It receives data from the frontend, calls the Gemini API using a secure environment variable, and returns the result. **This prevents the API key from ever being exposed on the client side.**

### Setup and Running Locally

This project is configured to run in a modern development environment that supports ES modules and import maps.

1.  **Dependencies:** All dependencies are managed via an `importmap` in `index.html`. There is no `package.json` for a traditional `npm install` step.
2.  **Environment Variables:** The AI functionality relies on a secure backend function that requires a Google Gemini API key. To run this part of the application, you need to set up an environment variable. If deploying on Netlify, this would be configured in the site settings:
    *   **Variable:** `API_KEY`
    *   **Value:** `Your_Google_Gemini_API_Key_Here`

Without this key, the dashboard will function correctly, but the "Explain with AI" feature will return an error.
