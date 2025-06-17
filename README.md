# Smart Greenhouse Frontend – 4th Semester SEP4 Project

This project is the frontend part of a **smart greenhouse system**, developed during the 4th semester at VIA University College as part of the Semester Project 4 (SEP4) course.

The goal was to simulate a modern greenhouse management interface, focused solely on the **frontend**, while **mocking machine learning predictions** and **IoT sensor data**.

---

## 🌱 Project Overview

The system allows greenhouse users to monitor sensor data (e.g. temperature, air humidity, soil humidity) and simulate responses to environmental changes while being able to interact with actuators. Although backend systems such as ML and IoT services are mocked, the frontend behaves as if it's communicating with a real distributed setup.

---

## 🧰 Tech Stack

| Layer        | Technology             |
|--------------|------------------------|
| Frontend     | React + TypeScript     |
| State & Logic| React Hooks            |
| Styles       | Chakra UI              |
| Database     | Remote MySQL           |
| Testing      | Vitest + RTL           |
| Deployment   | Render (CI/CD)         |

---

## 🧪 Demo Credentials

To test the project, you can use the following demo login credentials:

- **Username:** `admin`  
- **Password:** `admin123`

🔗 **Frontend:** [https://sep4-frontend.onrender.com/](https://sep4-frontend.onrender.com/)  
🔗 **Backend (API):** [https://sep4-backend.onrender.com/](https://sep4-backend.onrender.com/)

Note that as we are using Render's free version, it might take around a minute to load the project.

---

## 🧪 Testing

- Includes basic **unit tests** and **integration tests** for components
- Includes automatic testing in CI pipeline with GitHub Actions
---

## 🚀 Deployment

- Deployed using **Render**
- Auto-build and deploy on push to `main`
- Accessible via live URL above

---
