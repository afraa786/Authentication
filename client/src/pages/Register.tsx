import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CatAnimation, { type CatMode } from '@/components/CatAnimation';
import { authApi, ApiError } from '@/services/api';

const schema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be under 30 characters'),
    email: z
      .string()
      .trim()
      .email('Please enter a valid email')
      .max(255),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [catMode, setCatMode] = useState<CatMode>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout>>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFocus = useCallback((mode: CatMode) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setCatMode(mode);
  }, []);

  const handleBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => setCatMode('idle'), 120);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const usernameField = register('username');
  const emailField = register('email');
  const passwordField = register('password');
  const confirmPasswordField = register('confirmPassword');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Simulated API call - replace with actual authApi.register
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                  fill="currentColor"
                  className="text-primary-foreground"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              Appu
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Start your journey with us today
          </p>
        </div>

        {/* Cats Animation */}
        <CatAnimation mode={catMode} />

        {/* Card */}
        <div className="auth-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="auth-label">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="johndoe"
                  className="auth-input pl-10"
                  {...usernameField}
                  onFocus={() => handleFocus('email')}
                  onBlur={(e) => {
                    usernameField.onBlur(e);
                    handleBlur();
                  }}
                />
              </div>
              {errors.username && (
                <p className="auth-error">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="auth-label">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="auth-input pl-10"
                  {...emailField}
                  onFocus={() => handleFocus('email')}
                  onBlur={(e) => {
                    emailField.onBlur(e);
                    handleBlur();
                  }}
                />
              </div>
              {errors.email && (
                <p className="auth-error">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="auth-label">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="auth-input pl-10 pr-10"
                  {...passwordField}
                  onFocus={() => handleFocus('password')}
                  onBlur={(e) => {
                    passwordField.onBlur(e);
                    handleBlur();
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="auth-error">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="auth-label">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="auth-input pl-10 pr-10"
                  {...confirmPasswordField}
                  onFocus={() => handleFocus('password')}
                  onBlur={(e) => {
                    confirmPasswordField.onBlur(e);
                    handleBlur();
                  }}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="auth-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="auth-button w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Create Account
            </Button>
          </form>

          <div className="auth-divider" />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;