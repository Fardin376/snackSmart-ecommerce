import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Topbar from './components/Topbar.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Products from './pages/Products.jsx';
import Cart from './pages/Cart.jsx';
import ConfirmEmail from './pages/ConfirmEmail.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Customers from './pages/admin/Customers.jsx';
import Admins from './pages/admin/Admins.jsx';
import Inventory from './pages/admin/Inventory.jsx';
import Sales from './pages/admin/Sales.jsx';
import Coupons from './pages/admin/Coupons.jsx';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0);

  const handleCartOpen = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);
  const handleCartUpdate = () => setCartRefreshTrigger((prev) => prev + 1);

  return (
    <>
      <Router>
        <Routes>
          {/* Admin Routes (no topbar) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="admins" element={<Admins />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<Sales />} />
            <Route path="coupons" element={<Coupons />} />
          </Route>

          {/* Customer Routes (with topbar) */}
          <Route
            path="/*"
            element={
              <>
                <Topbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                  onCartOpen={handleCartOpen}
                  cartRefreshTrigger={cartRefreshTrigger}
                />
                <Cart
                  isOpen={isCartOpen}
                  onClose={handleCartClose}
                  onCartUpdate={handleCartUpdate}
                  cartRefreshTrigger={cartRefreshTrigger}
                />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Products
                        searchTerm={searchTerm}
                        sortOption={sortOption}
                        onCartUpdate={handleCartUpdate}
                      />
                    }
                  />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/confirm" element={<ConfirmEmail />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
