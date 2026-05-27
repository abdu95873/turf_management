import { FiBriefcase, FiCalendar, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import { DashboardCard, DashboardPage } from "../shared/PageChrome";

export default function UserOverviewPage() {
  const kpis = [
    { label: "Total Bookings", value: "128", icon: FiCalendar },
    { label: "Active Venues", value: "36", icon: FiBriefcase },
    { label: "Monthly Spend", value: "42,500 BDT", icon: FiDollarSign },
    { label: "Saved Slots", value: "14", icon: FiTrendingUp },
  ];
  const weeklyUtilization = [52, 68, 61, 75, 73, 82, 78];
  const bookingSplit = [
    { label: "Football", value: 48 },
    { label: "Cricket", value: 30 },
    { label: "Swimming", value: 22 },
  ];

  return (
    <DashboardPage title="User Overview" subtitle="Quick summary for your account">
      <section className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Icon />
              </div>
              <h3 className="mb-1 text-sm text-slate-500">{kpi.label}</h3>
              <p className="text-3xl font-extrabold text-emerald-900">{kpi.value}</p>
            </div>
          );
        })}
      </section>
      <DashboardCard title="Cashflow Preview">
        <div className="h-56 rounded-xl border border-slate-200 bg-linear-to-b from-emerald-50 to-slate-50" />
      </DashboardCard>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DashboardCard title="Weekly Booking Utilization">
          <div className="flex h-40 items-end gap-2 rounded-xl bg-slate-50 p-3">
            {weeklyUtilization.map((item, idx) => (
              <div key={item + idx} className="flex-1 rounded-t-md bg-emerald-500/80" style={{ height: `${item}%` }} />
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-500">Last 7 days average utilization trend</p>
        </DashboardCard>

        <div className="xl:col-span-2">
          <DashboardCard title="Booking Category Split">
            <div className="space-y-3">
              {bookingSplit.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </section>
    </DashboardPage>
  );
}
