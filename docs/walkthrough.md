# BlueSentinel - Product Walkthrough

Welcome to the **BlueSentinel **. This walkthrough highlights the key features and design decisions of the platform.

---

## 1. The Landing Experience (`index.html`)

The entry point is designed to immerse the user immediately.

- **Dynamic Background**: A "Constellation" canvas effect simulates a digital nervous system, reacting to mouse movement.
- **Scroll Reveals**: As you scroll, cards and sections fade in and tilt (`visual-effects.js`), creating a sense of depth.
- **Call to Action**: Two clear paths - "Launch Console" (Dashboard) or "System Architecture" (Learn More).

---

## 2. The Command Center (`dashboard.html`)

The heart of the application.

- **Floating Dock**:
  - Located on the left, this macOS-inspired dock provides instant access to Monitor, News, Logs, Archives, and Forums.
  - Icons magnify on hover for a tactile feel.
- **Bento Grid System**:
  - Data is organized into a modular grid.
  - **Row 1**: High-priority sensor cards (Temp, pH, Turbidity, DO).
  - **Row 2**: Long-term context (AI Projections, Chemical Analysis).
  - **Row 3**: Synthesis (Eco-System natural language summary, Health Index).
- **Gemini AI Integration**:
  - The "Eco-System Analysis" block allows users to ask the AI for a health report based on current data.
  - **SentinelBuddy**: A chatbot available via the floating button for Q&A.

---

## 3. Global Intelligence (`logs.html`)

Visualizing data at a planetary scale.

- **3D Interactive Globe**:
  - We replaced standard 2D maps with `globe.gl`.
  - Real-time "incidents" glow on the dark side of the earth.
- **Log Table**:
  - A detailed history of every alert, color-coded by severity (Info, Warning, Critical).

---

## 4. Community Collaboration (`forums.html`)

Empowering the citizen scientist.

- **Real-Time Feed**:
  - Posts appear instantly without page reloads, powered by Firebase Realtime Database.
- **Field Reporting**:
  - A dedicated form for manual entry of observed data, bridging the gap between automated sensors and human observation.

---

## 5. Educational Hub (`contact.html`)

More than just a contact form.

- **Project Documentation**:
  - Detailed breakdown of the **Data Workflow** (Acquire -> Synthesize -> Predict).
  - **System Architecture** diagram description.
  - **Tech Stack** visualization.
- **Team**:
  - Credits to the engineering team.

---

## 6. Design System (`UI`)

- **Palette**: Deep Ocean Blue (`#0a0a0f`), Cyan Accents (`#00f0ff`), and Glassmorphism (Frosted backgrounds).
- **Typography**: *Space Grotesk* for headers, *Inter* for readable data.
- **Interaction**: Everything reacts. Cards tilt, buttons glow, and the cursor snaps to interactive elements.
