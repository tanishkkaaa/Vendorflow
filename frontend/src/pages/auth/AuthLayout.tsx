import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-ink p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display font-bold text-accent">V</div>
          <span className="font-display text-xl font-semibold">VendorFlow AI</span>
        </div>
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Vendor procurement, <br /> without the spreadsheets.
          </h2>
          <p className="mt-4 max-w-md text-white/60">
            RFQs, AI quote comparison, sequential approvals, contract tracking, and purchase orders — in one place.
          </p>
        </div>
        <p className="text-xs text-white/30">© {new Date().getFullYear()} VendorFlow AI</p>
      </div>

      <div className="flex w-full items-center justify-center bg-surface p-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-display text-2xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
