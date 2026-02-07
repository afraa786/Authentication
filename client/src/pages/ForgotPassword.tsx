import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/components/AuthLayout';
import { authApi, ApiError } from '@/services/api';

const schema = z.object({
  email: z.string().trim().email('Please enter a valid email').max(255),
});

type FormData = z.infer<typeof schema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
      await authApi.forgotPassword({ email: data.email });
      setSent(true);
      toast.success('Reset instructions sent to your email.');
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
      title="Reset your password"
      subtitle="We'll send you a code to get back in"
    >
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
          <KeyRound className="w-7 h-7 text-accent" />
        </div>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="auth-label">
              Email address
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

          <Button
            type="submit"
            className="auth-button w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Send reset code
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">Check your inbox</p>
            <p className="text-sm text-muted-foreground mt-1">
              If an account exists with that email, we've sent reset instructions.
            </p>
          </div>
          <Link
            to="/reset-password"
            className="auth-link inline-block text-sm"
          >
            I have a reset code →
          </Link>
        </div>
      )}

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

export default ForgotPassword;
