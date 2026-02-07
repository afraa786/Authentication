import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, KeyRound, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { authApi, ApiError } from '@/services/api';

const schema = z
  .object({
    otp: z.string().trim().min(4, 'Reset code must be 4 digits').max(4),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const ResetPassword = () => {
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
      await authApi.resetPassword({
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Reset failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Enter your reset code and choose a new password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="otp" className="auth-label">
            Reset Code
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="otp"
              placeholder="Enter 4-digit code"
              className="auth-input pl-10"
              maxLength={4}
              {...register('otp')}
            />
          </div>
          {errors.otp && (
            <p className="auth-error">{errors.otp.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="auth-label">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              className="auth-input pl-10"
              {...register('newPassword')}
            />
          </div>
          {errors.newPassword && (
            <p className="auth-error">{errors.newPassword.message}</p>
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
          Reset Password
        </Button>
      </form>

      <div className="auth-divider" />

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
