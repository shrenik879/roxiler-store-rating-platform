import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerSchema } from '@/validations/schemas';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { extractError } from '@/services/axios';
import { ROLE_HOME } from '@/constants';

export default function Register() {
  const { register: signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  if (isAuthenticated) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />;

  const onSubmit = async (values) => {
    try {
      const u = await signup(values);
      toast.success('Account created');
      navigate(ROLE_HOME[u.role] || '/', { replace: true });
    } catch (err) {
      toast.error(extractError(err).message);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up as a normal user to start rating stores"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Full name"
          placeholder="Your full legal name (20-60 characters)"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="address"
          label="Address"
          placeholder="Optional · up to 400 characters"
          error={errors.address?.message}
          {...register('address')}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="8-16 chars, 1 uppercase, 1 special"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
