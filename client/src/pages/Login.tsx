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
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-white mb-2">Food Order</h1>
            <p className="text-gray-400">Polomolok's finest delivery</p>
          </div>

          {!showOTP ? (
            <>
              {/* Login Form */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome back</h2>
                <p className="text-gray-400">Please enter your details to sign in</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
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
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div key={error} className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-400 animate-shake">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold mb-1">Login Failed</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-sm text-green-400">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{message}</p>
                    </div>
                  </div>
                )}

                {loginAttempts > 0 && loginAttempts < 10 && (
                  <div className={`flex items-center justify-center gap-2 text-xs ${loginAttempts >= 7 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    <AlertCircle className="w-3 h-3" />
                    <span>{10 - loginAttempts} login {10 - loginAttempts === 1 ? 'attempt' : 'attempts'} remaining (resets in 15 min)</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <span className="text-gray-400">Don't have an account? </span>
                <Link to="/register" className="text-white font-medium hover:underline">
                  Sign up
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Verify OTP</h2>
                <p className="text-gray-400">Enter the 6-digit code sent to your email</p>
              </div>

              {message && (
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 text-sm text-blue-400 mb-5 text-center">
                  {message}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-5" onReset={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white text-center text-2xl font-bold tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <span>{rateLimitRemaining} {rateLimitRemaining === 1 ? 'attempt' : 'attempts'} remaining (5 max per 5 min)</span>
                    </div>
                  )}
                  {isLocked && (
                    <div className="flex items-center justify-center gap-2 text-sm mt-3 text-red-400 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span>
                        Account locked. Try again in {Math.floor(lockTimeRemaining / 60)}:{String(lockTimeRemaining % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-400 animate-shake">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
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
                  className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="w-full bg-zinc-900 text-white font-medium rounded-lg py-3 hover:bg-zinc-800 transition"
                >
                  Back to login
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://www.foodiv.com/wp-content/uploads/2023/06/online-ordering-business.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-8 relative z-10">
            <div className="mb-8">
              <div className="inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Order Your Favorite Food
            </h2>
            <p className="text-xl text-gray-200 max-w-md mx-auto drop-shadow-lg">
              Fast delivery, fresh ingredients, and delicious meals delivered right to your door in Polomolok
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
