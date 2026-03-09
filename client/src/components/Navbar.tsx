import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard, UtensilsCrossed, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-zinc-800 bg-black/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-white hover:opacity-80 transition">
            <UtensilsCrossed className="w-6 h-6" />
            <span className="text-xl font-bold">Polomolok Food</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-zinc-900 hover:text-white transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/cart"
                      className="relative flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-zinc-900 hover:text-white transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Cart</span>
                      {totalItems > 0 && (
                        <span className="absolute -top-1 right-0 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/orders"
                      className="px-4 py-2 rounded-lg text-gray-300 hover:bg-zinc-900 hover:text-white transition"
                    >
                      Orders
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-zinc-900 hover:text-white transition"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-zinc-900 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-gray-300 hover:bg-zinc-900 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-zinc-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-zinc-800">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-gray-300 hover:bg-zinc-900 hover:text-white rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/cart"
                      className="block px-4 py-2 text-gray-300 hover:bg-zinc-900 hover:text-white rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cart {totalItems > 0 && `(${totalItems})`}
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-300 hover:bg-zinc-900 hover:text-white rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-300 hover:bg-zinc-900 hover:text-white rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-zinc-900 hover:text-white rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-300 hover:bg-zinc-900 hover:text-white rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 bg-white text-black font-semibold hover:bg-gray-200 rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
