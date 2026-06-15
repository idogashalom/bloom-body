import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import TrackOrder from "./pages/TrackOrder";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Footer from "./components/Footer";
import BloomModals from "./components/BloomModals";
import Toast from "./components/Toast";
import DeliveryNotification from "./components/DeliveryNotification";
import PaymentSelection from "./pages/PaymentSelection";
import { ShopProvider } from "./context/ShopContext";
import "./components/Hero3D.css";
import './App.css'

// Admin imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import UserDashboard from "./pages/Dashboard";
import Products from "./pages/admin/Products";
import Notifications from "./pages/admin/Notifications";
import Shop from "./pages/admin/Shop";

function App() {
  return (
    <div>
      <ShopProvider>
        <BrowserRouter>
          <Routes>
            {/* Admin Routes (Standalone, without standard Navbar/Footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="shop" element={<Shop />} />
            </Route>

            {/* Public Routes with standard Navbar and Footer */}
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      <Route path='/' element={<Home />} />
                      <Route path='/about' element={<About />} />
                      <Route path='/contact' element={<Contact />} />
                      <Route path='/product' element={<Product />} />
                      <Route path='/cart' element={<Cart />} />
                      <Route path='/login' element={<Login />} />
                      <Route path='/register' element={<Register />} />
                      <Route path='/product/:id' element={<ProductDetails />} />
                      <Route path='/payment' element={<PaymentSelection />} />
                      <Route path='/track-order' element={<TrackOrder />} />
                      <Route path='/dashboard' element={<UserDashboard />} />
                    </Routes>
                  </main>
                  <Footer />
                  <BloomModals />
                  <DeliveryNotification />
                  <Toast />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </ShopProvider>
    </div >
  )
}

export default App;
