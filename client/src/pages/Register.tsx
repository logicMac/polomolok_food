import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password, recaptchaToken);
      
      if (result.success) {
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        // Reset reCAPTCHA on error
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md animate-fade-in-up my-auto">
          {/* Logo/Brand */}
          <div className="mb-6 lg:mb-10 text-center lg:text-left animate-slide-down">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Food Order
              </h1>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">Polomolok's finest delivery</p>
          </div>

          {/* Register Form */}
          <div className="mb-6 text-center lg:text-left animate-fade-in animation-delay-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">Create account</h2>
            <p className="text-gray-400 text-sm sm:text-base">Join us and start ordering delicious food</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in animation-delay-400">
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-white" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent focus:bg-zinc-900 transition-all duration-300 text-sm sm:text-base hover:border-zinc-700"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-white" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent focus:bg-zinc-900 transition-all duration-300 text-sm sm:text-base hover:border-zinc-700"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-white" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent focus:bg-zinc-900 transition-all duration-300 text-sm sm:text-base hover:border-zinc-700"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Min 8 characters, 1 uppercase, 1 lowercase, 1 number
              </p>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-white">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-white" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent focus:bg-zinc-900 transition-all duration-300 text-sm sm:text-base hover:border-zinc-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-red-400 animate-shake">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Registration Failed</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* reCAPTCHA */}
            <div className="w-full">
              <div className="flex justify-center">
                <div className="transform scale-90 sm:scale-100 origin-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={(import.meta as any).env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={handleRecaptchaChange}
                    theme="dark"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !recaptchaToken}
              className="relative w-full bg-gradient-to-r from-white to-gray-100 text-black font-semibold rounded-xl py-3 sm:py-3.5 hover:from-gray-100 hover:to-white transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-emerald-500/0 to-green-500/0 group-hover:from-green-500/20 group-hover:via-emerald-500/20 group-hover:to-green-500/20 transition-all duration-500"></div>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 text-center text-sm sm:text-base">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-white font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: 'url(https://cdn.prod.website-files.com/5acc07fc6634d231ac4bcca6/6320a0603151dde41d816976_one2_best_food_delivery_service.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center relative z-10 max-w-lg animate-fade-in-up animation-delay-400">
            <div className="mb-8">
              <div className="inline-block p-5 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-500 shadow-2xl">
                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
              Join Our Community
            </h2>
            <p className="text-lg xl:text-xl text-gray-100 drop-shadow-lg leading-relaxed mb-10">
              Create an account and enjoy exclusive deals, fast delivery, and personalized recommendations
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-default">
                <p className="text-white font-semibold">🎁 Welcome Bonus</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-default">
                <p className="text-white font-semibold">💳 Easy Checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
