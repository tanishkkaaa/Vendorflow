import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { useRegisterVendor } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  name: z.string().min(2, 'Your name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterVendor() {
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId') ?? '';
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const registerVendor = useRegisterVendor();

  return (
    <AuthLayout title="Register as a vendor" subtitle="Create your vendor account to receive RFQ invitations">
      {!organizationId && (
        <p className="mb-4 rounded-md bg-warning-light px-3 py-2 text-sm text-warning">
          This link is missing an organization reference. Ask the company inviting you for the correct registration link.
        </p>
      )}
      <form onSubmit={handleSubmit((v) => registerVendor.mutate({ ...v, organizationId }))} className="space-y-4">
        <div>
          <label className="label">Company name</label>
          <input className="input" placeholder="Sunil Traders Pvt Ltd" {...register('companyName')} />
          {errors.companyName && <p className="mt-1 text-xs text-danger">{errors.companyName.message}</p>}
        </div>
        <div>
          <label className="label">Contact person</label>
          <input className="input" placeholder="Sunil Kumar" {...register('contactPerson')} />
          {errors.contactPerson && <p className="mt-1 text-xs text-danger">{errors.contactPerson.message}</p>}
        </div>
        <div>
          <label className="label">Your name (login account)</label>
          <input className="input" placeholder="Sunil Kumar" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@vendor.com" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" placeholder="+91 98765 43210" {...register('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="At least 8 characters" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        {registerVendor.isError && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger">
            {(registerVendor.error as any)?.response?.data?.message ?? 'Registration failed.'}
          </p>
        )}
        {registerVendor.isSuccess && (
          <p className="rounded-md bg-success-light px-3 py-2 text-sm text-success">Account created — please sign in.</p>
        )}

        <button type="submit" disabled={registerVendor.isPending || !organizationId} className="btn-primary w-full">
          {registerVendor.isPending && <Spinner className="h-4 w-4 text-white" />}
          Register
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
