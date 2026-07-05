# 💻 React Frontend SPA — E-Commerce Application

<div align="center">

[![React](https://img.shields.io/badge/React-19.2.4-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.2.2-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v7.14.0-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1.15.0-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)

*A premium, high-performance web dashboard and storefront designed with Tailwind CSS v4, smooth modal workflows, dynamic filters, and real-time state management.*

</div>

---

## 🚀 Architectural Overview

The frontend interface acts as a single-page application (SPA) executing client-side routing and communicating with the Spring Boot server via secure asynchronous REST endpoints.

```text
       ┌────────────────────────┐
       │   React 19 SPA (Client)│
       └───────────┬────────────┘
                   │
         [ Axios Interceptor ]
         (Injects JWT Bearer)
                   │
                   ▼  HTTP Request
       ┌────────────────────────┐
       │  Spring Boot Backend   │
       └────────────────────────┘
```

### 🗝️ Core Frontend Capabilities
1. **JWT Header Injection**: Global token handler intercepts outgoing requests, attaching authorization headers dynamically.
2. **Guest Cart Synchronization**: Seamless localStorage cart tracking for guest users that syncs with database storage upon user authorization.
3. **AI Chat & Modal Workflows**: Live interaction frames allowing side-by-side product advice, description summaries, and specs checkups.
4. **Adaptive View System**: Smart, unified view routes that dynamically present standard user interfaces or Admin Dashboard management modules.

---

## 📸 User Interface Showcase

### 🛍️ Client-Facing Views

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <b>✨ Storefront Home & Hero</b><br>
      <img src="../screenshots/01_storefront_hero.png" alt="Storefront Hero" width="100%">
    </td>
    <td width="50%" align="center">
      <b>📦 Product Grid</b><br>
      <img src="../screenshots/03_featured_products.png" alt="Featured Products" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>🤖 AI Product Insight & Chat</b><br>
      <img src="../screenshots/02_ai_insight_modal.png" alt="AI Insight" width="100%">
    </td>
    <td width="50%" align="center">
      <b>⚖️ AI Side-by-Side Compare</b><br>
      <img src="../screenshots/04_ai_comparison_modal.png" alt="AI Compare" width="100%">
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>🛒 Shopping Cart & Checkout</b><br>
      <img src="../screenshots/05_cart_checkout.png" alt="Cart Checkout" width="100%">
    </td>
    <td width="50%" align="center">
      <b>🎟️ Available Coupons Modal</b><br>
      <img src="../screenshots/06_available_coupons_modal.png" alt="Available Coupons" width="100%">
    </td>
  </tr>
</table>

<br>

<p align="center">
  <b>🎉 Checkout Confirmation Page</b><br>
  <img src="../screenshots/07_order_placed_modal.png" alt="Order Success" width="60%">
</p>

### 🛡️ Administrative Console Views

<table width="100%">
  <tr>
    <td width="50%" align="center">
      <b>📊 Analytics Dashboard Overview</b><br>
      <img src="../screenshots/08_admin_dashboard.png" alt="Admin Dashboard" width="100%">
    </td>
    <td width="50%" align="center">
      <b>📝 Catalog Inventory List</b><br>
      <img src="../screenshots/09_admin_product_inventory.png" alt="Admin Catalog" width="100%">
    </td>
  </tr>
</table>

<br>

<p align="center">
  <b>🎫 Coupon Management Dashboard</b><br>
  <img src="../screenshots/10_admin_coupon_management.png" alt="Admin Coupons" width="80%">
</p>

---

## 📁 Repository Map

```text
FrontEnd/
├── public/                 # Static assets and icons
├── src/
│   ├── Components/
│   │   ├── Admin/          # Administrative dashboards & metrics
│   │   │   ├── AdminCoupons.jsx   # Coupon creator and active triggers
│   │   │   ├── AdminDashboard.jsx # Entry view layout
│   │   │   ├── AdminOrders.jsx    # Status modification panel
│   │   │   ├── AdminOverview.jsx  # Chart metrics and aggregate statistics
│   │   │   ├── AdminProducts.jsx  # Complete catalog modification interface
│   │   │   └── AdminUsers.jsx     # User audit and access controls
│   │   ├── Page1/          # Storefront views & customer interactions
│   │   │   ├── AI/                # AI modal modules (advice, summary, comparison)
│   │   │   │   ├── AiInsightModal.jsx
│   │   │   │   ├── CompareBar.jsx
│   │   │   │   └── CompareModal.jsx
│   │   │   ├── Common/            # Reusable UI elements (toast alerts)
│   │   │   ├── Cart.jsx           # Guest & User Cart page layouts
│   │   │   ├── Orders.jsx         # User order log & iText PDF invoice request
│   │   │   ├── Header.jsx         # Global context-aware navigation
│   │   │   ├── Mid.jsx            # Main storefront listing with filter modules
│   │   │   └── Footer.jsx         # Standard catalog page footer
│   │   ├── Page2/          # Experimental storefront listings
│   │   ├── User/           # Authentication controls (Login, Signup, Profile)
│   │   └── PrivateRoute.jsx# Client-side router guard for private accounts
│   ├── config/
│   │   ├── axios.js        # Global Axios configs & JWT request interceptors
│   │   └── config.js       # Base server address definitions
│   ├── App.jsx             # React Router routing layout setup
│   ├── index.css           # Global custom style overrides
│   └── main.jsx            # React client mounting logic
├── package.json            # Target version dependencies & runner scripts
└── vite.config.js          # Vite compiler and tailwind integration plugin configurations
```

---

## ⚡ Setup & Run

### 📋 Prerequisites
- **Node.js** v18 or higher
- **npm** (Node Package Manager)

### 💻 Local Development Setup

1.  Navigate into the `FrontEnd` folder:
    ```bash
    cd FrontEnd
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    If your backend API server runs on a different port than `http://localhost:8080`, create a `.env` file:
    ```env
    VITE_API_URL=http://your-custom-backend-domain:port
    ```

4.  Start local development server:
    ```bash
    npm run dev
    ```
    
    *Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🔒 Session Security & API Integration

### JWT Storage
After a customer logs in successfully via [Login.jsx](file:///c:/Users/itspa/FirstBitSolutions/E-Commerce-Project/FrontEnd/src/Components/User/Login.jsx), token headers are kept in local storage:
```javascript
localStorage.setItem('token', data.token);
localStorage.setItem('userRole', data.role);
```

### Axios Interceptor
Incoming tokens are appended dynamically to all API calls through the configured instance in [axios.js](file:///c:/Users/itspa/FirstBitSolutions/E-Commerce-Project/FrontEnd/src/config/axios.js):
```javascript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📦 Production Builds
To build optimized and minified production bundles:
```bash
npm run build
```
Output files will compile inside the `/dist` directory, ready to be served by server scripts or CDN hosting providers.
