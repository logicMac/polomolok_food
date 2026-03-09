import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
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

    const result = await register(name, email, password, recaptchaToken);
    
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
    
    setLoading(false);
  };

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

          {/* Register Form */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Create account</h2>
            <p className="text-gray-400">Join us and start ordering delicious food</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                Min 8 characters, 1 uppercase, 1 lowercase, 1 number
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* reCAPTCHA */}
            <div className="w-full">
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  theme="dark"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold rounded-lg py-3 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-white font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://cdn.prod.website-files.com/5acc07fc6634d231ac4bcca6/6320a0603151dde41d816976_one2_best_food_delivery_service.jpeg)',
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Join Our Community
            </h2>
            <p className="text-xl text-gray-200 max-w-md mx-auto drop-shadow-lg">
              Create an account and enjoy exclusive deals, fast delivery, and personalized recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
