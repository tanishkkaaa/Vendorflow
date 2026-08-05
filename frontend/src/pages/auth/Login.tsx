import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { useLogin } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const login = useLogin();

  const onSubmit = (values: FormValues) => login.mutate(values);

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your VendorFlow AI account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@company.com" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        {login.isError && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger">
            {(login.error as any)?.response?.data?.message ?? 'Login failed. Check your credentials.'}
          </p>
        )}

        <button type="submit" disabled={login.isPending} className="btn-primary w-full">
          {login.isPending && <Spinner className="h-4 w-4 text-white" />}
          Sign in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New organization?{' '}
        <Link to="/register-organization" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
