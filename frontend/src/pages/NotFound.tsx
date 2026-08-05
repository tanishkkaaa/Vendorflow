import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-surface text-center">
      <h1 className="font-display text-4xl font-bold text-ink">404</h1>
      <p className="text-muted">This page doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
    </div>
  );
}
