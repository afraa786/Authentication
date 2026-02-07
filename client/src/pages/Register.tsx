import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, User, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your journey with us today"
    >
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
              {...register('username')}
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
              {...register('email')}
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
              type="password"
              placeholder="••••••••"
              className="auth-input pl-10"
              {...register('password')}
            />
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
              type="password"
              placeholder="••••••••"
              className="auth-input pl-10"
              {...register('confirmPassword')}
            />
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
    </AuthLayout>
  );
};

export default Register;
