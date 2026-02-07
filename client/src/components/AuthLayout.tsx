import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  wide?: boolean;
}


const AuthLayout = ({ children, title, subtitle, wide }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient p-4">
      <motion.div
        className={`w-full ${wide ? 'max-w-lg' : 'max-w-md'}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="text-center mb-8">
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
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>
          )}
        </div>
        <div className="auth-card p-8">{children}</div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
