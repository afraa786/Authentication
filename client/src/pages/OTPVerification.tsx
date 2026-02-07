import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import AuthLayout from '@/components/AuthLayout';
import { authApi, ApiError } from '@/services/api';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || '';

  const [userId, setUserId] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (!userId.trim()) {
      toast.error('Please enter your user ID or email.');
      return;
    }
    if (otp.length < 4) {
      toast.error('Please enter the complete OTP.');
      return;
    }

    setIsVerifying(true);
    try {
      await authApi.verifyOtp(userId.trim(), otp);
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!userId.trim()) {
      toast.error('Please enter your email first.');
      return;
    }

    setIsResending(true);
    try {
      await authApi.resendOtp({ email: userId.trim() });
      toast.success('A new OTP has been sent to your email.');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to resend OTP. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the code we sent to your inbox"
    >
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
      </div>

      <div className="space-y-5">
        {!emailFromState && (
          <div className="space-y-1.5">
            <Label htmlFor="userId" className="auth-label">
              User ID / Email
            </Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="you@example.com"
              className="auth-input"
            />
          </div>
        )}

        {emailFromState && (
          <p className="text-center text-sm text-muted-foreground">
            Code sent to{' '}
            <span className="font-medium text-foreground">{emailFromState}</span>
          </p>
        )}

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={handleVerify}
          className="auth-button w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isVerifying}
        >
          {isVerifying ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          Verify
        </Button>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="auth-link inline-flex items-center gap-1.5"
            type="button"
          >
            {isResending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : null}
            Resend OTP
          </button>
        </div>
      </div>

      <div className="auth-divider" />

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{' '}
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default OTPVerification;
