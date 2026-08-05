import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { useRegisterOrganization } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

const schema = z.object({
  orgName: z.string().min(2, 'Organization name is required'),
  name: z.string().min(2, 'Your name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterOrganization() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const registerOrg = useRegisterOrganization();

  return (
    <AuthLayout title="Create your organization" subtitle="You'll be set up as the Admin">
      <form onSubmit={handleSubmit((v) => registerOrg.mutate(v))} className="space-y-4">
        <div>
          <label className="label">Organization name</label>
          <input className="input" placeholder="Acme Manufacturing Pvt Ltd" {...register('orgName')} />
          {errors.orgName && <p className="mt-1 text-xs text-danger">{errors.orgName.message}</p>}
        </div>
        <div>
          <label className="label">Your name</label>
          <input className="input" placeholder="Jane Doe" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@company.com" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="At least 8 characters" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        {registerOrg.isError && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger">
            {(registerOrg.error as any)?.response?.data?.message ?? 'Registration failed.'}
          </p>
        )}

        <button type="submit" disabled={registerOrg.isPending} className="btn-primary w-full">
          {registerOrg.isPending && <Spinner className="h-4 w-4 text-white" />}
          Create organization
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
