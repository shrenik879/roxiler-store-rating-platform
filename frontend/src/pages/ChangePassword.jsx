import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { changePasswordSchema } from '@/validations/schemas';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { extractError } from '@/services/axios';

export default function ChangePassword() {
  const { logout } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (values) => {
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed. Please sign in again.');
      reset();
      setTimeout(logout, 1200);
    } catch (err) {
      toast.error(extractError(err).message);
    }
  };

  return (
    <>
      <PageHeader title="Change password" description="Update the password for your account." />
      <Card className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="currentPassword"
            label="Current password"
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            id="newPassword"
            label="New password"
            type="password"
            hint="8-16 characters, one uppercase letter, one special character"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        </form>
      </Card>
    </>
  );
}
