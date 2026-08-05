import { Wallet, Award, FileWarning, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useAnalyticsSummary, useMonthlySpending, useVendorSpendRanking } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/utils/format';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary();
  const { data: monthly, isLoading: loadingMonthly } = useMonthlySpending(6);
  const { data: vendorRanking, isLoading: loadingRanking } = useVendorSpendRanking(5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="This month's spend"
          value={loadingSummary ? '—' : formatCurrency(summary?.currentMonthSpend ?? 0)}
          icon={Wallet}
        />
        <StatCard
          label="Avg. approval time"
          value={loadingSummary ? '—' : `${summary?.averageApprovalTimeHours ?? 0}h`}
          icon={Clock}
        />
        <StatCard
          label="Contracts expiring soon"
          value={loadingSummary ? '—' : summary?.expiringContractsCount ?? 0}
          icon={FileWarning}
          accent
        />
        <StatCard
          label="Top vendor score"
          value={loadingSummary ? '—' : `${summary?.topVendors?.[0]?.score ?? 0}/100`}
          icon={Award}
          sublabel={summary?.topVendors?.[0]?.companyName}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Monthly spending trend" className="lg:col-span-2">
          {loadingMonthly ? (
            <div className="flex h-72 items-center justify-center"><Spinner /></div>
          ) : (
            <div className="h-72">
              <Line
                data={{
                  labels: (monthly ?? []).map((m) => MONTH_LABELS[m._id.month - 1]),
                  datasets: [
                    {
                      label: 'Spend',
                      data: (monthly ?? []).map((m) => m.totalSpend),
                      borderColor: '#2C5F6F',
                      backgroundColor: 'rgba(44,95,111,0.1)',
                      tension: 0.35,
                      fill: true,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          )}
        </Card>

        <Card title="Top vendors by spend">
          {loadingRanking ? (
            <div className="flex h-72 items-center justify-center"><Spinner /></div>
          ) : (
            <div className="h-72">
              <Bar
                data={{
                  labels: (vendorRanking ?? []).map((v) => v.vendorName),
                  datasets: [
                    {
                      label: 'Spend',
                      data: (vendorRanking ?? []).map((v) => v.totalSpend),
                      backgroundColor: '#E8A33D',
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  indexAxis: 'y' as const,
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          )}
        </Card>
      </div>

      <Card title="Top rated vendors">
        {loadingSummary ? (
          <Spinner />
        ) : (
          <div className="divide-y divide-border">
            {(summary?.topVendors ?? []).map((v) => (
              <div key={v._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{v.companyName}</p>
                  <p className="text-xs text-muted">{v.ratingCount} rating(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-border">
                    <div className="h-full bg-primary" style={{ width: `${v.score}%` }} />
                  </div>
                  <span className="w-10 text-right text-sm font-medium text-ink">{v.score}</span>
                </div>
              </div>
            ))}
            {(summary?.topVendors ?? []).length === 0 && <p className="py-6 text-center text-sm text-muted">No rated vendors yet</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
