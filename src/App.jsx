import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

const About = lazy(() => import('./pages/About'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Contact = lazy(() => import('./pages/Contact'));
const Shipping = lazy(() => import('./pages/Shipping'));
const HowToOrder = lazy(() => import('./pages/HowToOrder'));
const Policies = lazy(() => import('./pages/Policies'));
const PaymentMethods = lazy(() => import('./pages/PaymentMethods'));
const Returns = lazy(() => import('./pages/Returns'));
const Terms = lazy(() => import('./pages/Terms'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Account = lazy(() => import('./pages/Account'));
const Admin = lazy(() => import('./pages/Admin'));
const Quote = lazy(() => import('./pages/Quote'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Shop = lazy(() => import('./pages/Shop'));

const pageFallback = (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    Loading...
  </div>
);

const withSuspense = (element) => (
  <Suspense fallback={pageFallback}>{element}</Suspense>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about-us" element={withSuspense(<About />)} />
        <Route path="about" element={withSuspense(<About />)} />
        <Route path="shop" element={withSuspense(<Shop />)} />
        <Route path="product/:slug" element={withSuspense(<Product />)} />
        <Route path="product" element={withSuspense(<Product />)} />
        <Route path="cart" element={withSuspense(<Cart />)} />
        <Route path="contact" element={withSuspense(<Contact />)} />
        <Route path="quote" element={withSuspense(<Quote />)} />
        <Route path="request-quote" element={withSuspense(<Quote />)} />
        <Route path="shipping" element={withSuspense(<Shipping />)} />
        <Route path="how-to-order" element={withSuspense(<HowToOrder />)} />
        <Route path="policies" element={withSuspense(<Policies />)} />
        <Route path="payment-methods" element={withSuspense(<PaymentMethods />)} />
        <Route path="returns" element={withSuspense(<Returns />)} />
        <Route path="terms" element={withSuspense(<Terms />)} />
        <Route path="login" element={withSuspense(<Login />)} />
        <Route path="register" element={withSuspense(<Register />)} />
        <Route path="forgot-password" element={withSuspense(<ForgotPassword />)} />
        <Route path="reset-password" element={withSuspense(<ResetPassword />)} />
        <Route path="account" element={withSuspense(<ProtectedRoute><Account /></ProtectedRoute>)} />
        <Route path="admin" element={withSuspense(<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>)} />
        <Route path="*" element={withSuspense(<NotFound />)} />
      </Route>
    </Routes>
  );
}

export default App;
