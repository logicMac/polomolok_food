import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Shield, ArrowRight, AlertCircle, Clock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  
  const { login, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from registration (only once on mount)
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, []); // Empty dependency array - only run once

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Don't clear error here - let it persist until we have a result
    // setError('');
    // setMessage('');

    try {
      const result = await login(email, password);
      
      console.log('Login result:', result); // Debug log
      
      if (result.success && result.otpSent) {
        setShowOTP(true);
        setMessage(result.message || 'OTP sent to your email');
        setLoginAttempts(0); // Reset on success
        setError(''); // Clear error only on success
      } else {
        const errorMsg = result.message || 'Login failed. Please try again.';
        console.log('Setting error:', errorMsg); // Debug log
        setMessage(''); // Clear message on error
        setError(errorMsg); // Set error
        setLoginAttempts(prev => prev + 1);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred. Please try again.';
      console.log('Caught error:', errorMsg); // Debug log
      setMessage(''); // Clear message on error
      setError(errorMsg); // Set error
      setLoginAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Account locked. Please wait ${Math.ceil(lockTimeRemaining / 60)} more minutes.`);
      return;
    }
    
    setLoading(true);
    // Don't clear error here - let it persist until we have a result
    // setError('');

    try {
      const result = await verifyOTP(email, otp);
      
      console.log('OTP verification result:', result); // Debug log
      
      if (result.success) {
        setError(''); // Clear error on success
        setMessage('Login successful! Redirecting...');
        
        // Get user from localStorage to check role
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Redirect based on role
          if (user.role === 'admin') {
            setTimeout(() => navigate('/admin'), 500);
          } else if (user.role === 'rider') {
            setTimeout(() => navigate('/rider'), 500);
          } else {
            setTimeout(() => navigate('/'), 500);
          }
        } else {
          setTimeout(() => navigate('/'), 500);
        }
      } else {
        setMessage(''); // Clear message on error
        setError(result.message || 'Invalid OTP. Please try again.');
        setOtpAttempts(prev => prev + 1);
        
        // Calculate remaining attempts (5 max per 5 minutes)
        const remaining = 5 - (otpAttempts + 1);
        setRateLimitRemaining(remaining);
        
        // Lock if no attempts remaining
        if (remaining <= 0) {
          setIsLocked(true);
          setLockTimeRemaining(300); // 5 minutes in seconds
        }
        
        console.log('OTP error set, staying on OTP screen'); // Debug log
      }
    } catch (err: any) {
      setMessage(''); // Clear message on error
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setOtpAttempts(prev => prev + 1);
      console.log('OTP catch error, staying on OTP screen'); // Debug log
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer for lock
  useEffect(() => {
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setOtpAttempts(0);
            setRateLimitRemaining(null);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockTimeRemaining]);  

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-8 lg:mb-12 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Food Order</h1>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">Polomolok's finest delivery</p>
          </div>

          {!showOTP ? (
            <>
              {/* Login Form */}
              <div className="mb-6 lg:mb-8 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Welcome back</h2>
                <p className="text-gray-400 text-sm sm:text-base">Please enter your details to sign in</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition text-sm sm:text-base"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition text-sm sm:text-base"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div key={error} className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-red-400 animate-shake">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Login Failed</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-green-400">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                      <p>{message}</p>
                    </div>
                  </div>
                )}

                {loginAttempts > 0 && loginAttempts < 10 && (
                  <div className={`flex items-center justify-center gap-2 text-xs ${loginAttempts >= 7 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    <AlertCircle className="w-3 h-3" />
                    <span>{10 - loginAttempts} login {10 - loginAttempts === 1 ? 'attempt' : 'attempts'} remaining</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold rounded-xl py-3 sm:py-3.5 hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 sm:mt-8 text-center text-sm sm:text-base">
                <span className="text-gray-400">Don't have an account? </span>
                <Link to="/register" className="text-white font-medium hover:underline">
                  Sign up
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification */}
              <div className="mb-6 sm:mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-zinc-900 rounded-full mb-4 border border-zinc-800">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Verify OTP</h2>
                <p className="text-gray-400 text-sm sm:text-base px-4">Enter the 6-digit code sent to your email</p>
              </div>

              {message && (
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-3 text-xs sm:text-sm text-blue-400 mb-5 text-center">
                  {message}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-4 sm:space-y-5" onReset={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 sm:py-4 text-white text-center text-xl sm:text-2xl font-bold tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLocked}
                    required
                    autoComplete="off"
                  />
                  
                  {/* Rate limit indicator */}
                  {rateLimitRemaining !== null && rateLimitRemaining > 0 && (
                    <div className={`flex items-center justify-center gap-2 text-xs mt-2 ${rateLimitRemaining <= 2 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      <AlertCircle className="w-3 h-3" />
                      <span>{rateLimitRemaining} {rateLimitRemaining === 1 ? 'attempt' : 'attempts'} remaining</span>
                    </div>
                  )}
                  {isLocked && (
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm mt-3 text-red-400 bg-red-500/10 border border-red-500/50 rounded-xl p-3">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span>
                        Locked. Try in {Math.floor(lockTimeRemaining / 60)}:{String(lockTimeRemaining % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-red-400 animate-shake">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Verification Failed</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || isLocked}
                  className="w-full bg-white text-black font-semibold rounded-xl py-3 sm:py-3.5 hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : isLocked ? (
                    'Account Locked'
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowOTP(false);
                    setOtp('');
                    setError('');
                    setMessage('');
                    setOtpAttempts(0);
                    setRateLimitRemaining(null);
                  }}
                  className="w-full bg-zinc-900 text-white font-medium rounded-xl py-3 sm:py-3.5 hover:bg-zinc-800 transition border border-zinc-800 text-sm sm:text-base"
                >
                  Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://www.foodiv.com/wp-content/uploads/2023/06/online-ordering-business.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center relative z-10 max-w-lg">
            <div className="mb-8 animate-fade-in">
              <div className="inline-block p-5 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20">
                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
              Order Your Favorite Food
            </h2>
            <p className="text-lg xl:text-xl text-gray-100 drop-shadow-lg leading-relaxed">
              Fast delivery, fresh ingredients, and delicious meals delivered right to your door in Polomolok
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                <p className="text-white font-semibold">⚡ Fast Delivery</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                <p className="text-white font-semibold">🎯 Track Orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
