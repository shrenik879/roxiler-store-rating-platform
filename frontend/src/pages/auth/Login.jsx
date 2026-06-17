import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginSchema } from '@/validations/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { extractError } from '@/services/axios';
import { ROLE_HOME } from '@/constants';

export default function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;

  const onSubmit = async (values) => {
    try {
      const u = await login(values);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      const dest = location.state?.from?.pathname || ROLE_HOME[u.role] || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      const e = extractError(err);
      setError('password', { message: e.message });
      toast.error(e.message);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your Store Rating dashboard"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="text-primary hover:text-primary-hover font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-xs text-muted">
        Demo · admin@storerating.com / Admin@1234 · owner1@storerating.com / Owner@123 ·
        aarav@example.com / User@1234
      </p>
    </AuthLayout>
  );
}
