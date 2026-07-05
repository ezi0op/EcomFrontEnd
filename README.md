# 💻 E-Commerce Platform - React Frontend

This is the frontend application of the E-Commerce platform. It is a modern, single-page application built using **React 19**, **Vite 8**, and **Tailwind CSS v4**.

## 🛠️ Tech Stack & Libraries

- **Framework:** React 19 (using Vite 8 for fast building and HMR)
- **Routing:** React Router v7 (configured with route guards for authenticated spaces)
- **HTTP Client:** Axios (configured with interceptors to automatically append JWT bearer tokens)
- **Styling:** Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin for maximum performance)
- **Icons:** Lucide React & FontAwesome Icons

---

## 📁 Key Directory Structure

```text
FrontEnd/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── Components/
│   │   ├── Admin/          # Dashboard, Users, Products, Coupons, and Orders administration
│   │   │   ├── AdminCoupons.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminOverview.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   └── AdminUsers.jsx
│   │   ├── Page1/          # Storefront views & Customer interface components
│   │   │   ├── AI/         # AI insight, advice, and comparison modals
│   │   │   ├── Cart.jsx    # Guest & logged-in user cart management
│   │   │   ├── Orders.jsx  # Order placement history and invoice downloads
│   │   │   ├── Header.jsx  # Context-aware navigation and search bar
│   │   │   ├── Mid.jsx     # Product list with filters (category, price)
│   │   │   └── Footer.jsx  # Standard layout footer
│   │   ├── Page2/          # Alternate storefront and product components
│   │   ├── User/           # Authentication components (Login, Registration, Profile update)
│   │   └── PrivateRoute.jsx# Route protector guard for authorized routes
│   ├── config/
│   │   ├── axios.js        # Axios instance configured with Authorization interceptors
│   │   └── config.js       # Base API URL provider
│   ├── App.jsx             # Root routing layout definition
│   ├── index.css           # Global CSS & Tailwind imports
│   └── main.jsx            # Application mount point
├── package.json            # Scripts & package configurations
└── vite.config.js          # Vite and build plugins configuration
```

---

## ⚡ Development & Setup

### Prerequisites
- **Node.js** v18+ and **npm** installed.
- Backend server running (by default expected at `http://localhost:8080`).

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd FrontEnd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables (Optional):
   Create a `.env` file in the root of the `FrontEnd` directory to point to your backend:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```
   *The server runs locally at: `http://localhost:5173`*

---

## 🔑 State Management & Auth Flow

1. **Authentication Token:**
   Upon successful login through [Login.jsx](file:///c:/Users/itspa/FirstBitSolutions/E-Commerce-Project/FrontEnd/src/Components/User/Login.jsx), the JWT string and User Role are stored in `localStorage`:
   ```javascript
   localStorage.setItem('token', data.token);
   localStorage.setItem('userRole', data.role);
   ```

2. **API Requests Interceptor:**
   All outgoing API requests automatically have the JWT bearer token attached. This logic is handled globally inside [axios.js](file:///c:/Users/itspa/FirstBitSolutions/E-Commerce-Project/FrontEnd/src/config/axios.js):
   ```javascript
   axiosInstance.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

3. **Cart Persistence:**
   Guest cart items are saved in `localStorage` until the customer logs in. Once logged in, the guest cart is synchronized with the backend database so the user doesn't lose selected items.

---

## 📦 Production Build

To build the project for production (compiles and minifies assets):
```bash
npm run build
```
The production bundle will be generated in the `dist/` directory, ready to be served by web servers or static hosts like Vercel, Netlify, or AWS S3.
