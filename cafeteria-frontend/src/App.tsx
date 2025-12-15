import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { fetchProfile } from './store/slices/authSlice';
import { setUser } from './store/slices/cartSlice';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import TrustedFriends from './pages/TrustedFriends';
import TestFeatures from './pages/TestFeatures';
import Statistics from './pages/Statistics';
import FinanceManagement from './pages/FinanceManagement';
import MenuItemDetail from './pages/MenuItemDetail';
import MenuManagement from './pages/MenuManagement';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, user]);

  // Sync cart with user changes
  useEffect(() => {
    dispatch(setUser(user?.id || null));
  }, [dispatch, user?.id]);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Menu />} />
        <Route path="menu" element={<Menu />} />
        <Route path="menu/:id" element={<MenuItemDetail />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="trusted-friends" element={<TrustedFriends />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="finance-management" element={<FinanceManagement />} />
          <Route path="menu-management" element={<MenuManagement />} />
          <Route path="test-features" element={<TestFeatures />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

