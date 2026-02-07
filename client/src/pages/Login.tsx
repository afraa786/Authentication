import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import CatAnimation, { type CatMode } from '@/components/CatAnimation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, ApiError } from '@/services/api';

const schema = z.object({
  email: z.string().trim().email('Please enter a valid email').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [catMode, setCatMode] = useState<CatMode>('idle');
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

  const emailField = register('email');
  const passwordField = register('password');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
      });
      login(response.token, response.refreshToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
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
            Welcome back
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Sign in to your account
          </p>
        </div>

        {/* Cats */}
        <CatAnimation mode={catMode} />

        {/* Card */}
        <div className="auth-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="auth-label">
                  Password
                </Label>
                <Link to="/forgot-password" className="auth-link text-xs">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="auth-input pl-10"
                  {...passwordField}
                  onFocus={() => handleFocus('password')}
                  onBlur={(e) => {
                    passwordField.onBlur(e);
                    handleBlur();
                  }}
                />
              </div>
              {errors.password && (
                <p className="auth-error">{errors.password.message}</p>
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
              Sign in
            </Button>
          </form>

          <div className="auth-divider" />

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
