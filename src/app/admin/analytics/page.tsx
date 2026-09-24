'use client';

import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Scale,
  Sparkles,
  Sprout,
  Droplets,
  Award
} from 'lucide-react';

export default function AnalyticsPage() {
  // Chart 1: Variety Yield Benchmark
  const varietyYieldData = [
    { variety: 'DBW-187', actualYield: 56.5, benchmark: 51.0, rustResistance: 96 },
    { variety: 'HD-2967', actualYield: 54.0, benchmark: 49.5, rustResistance: 91 },
    { variety: 'HD-3086', actualYield: 53.0, benchmark: 48.5, rustResistance: 93 },
    { variety: 'DBW-222', actualYield: 52.0, benchmark: 47.0, rustResistance: 89 },
    { variety: 'PBW-550', actualYield: 49.5, benchmark: 46.0, rustResistance: 86 },
    { variety: 'Sharbati C-306', actualYield: 44.0, benchmark: 42.0, rustResistance: 82 },
  ];

  // Chart 2: Sowing Date Window vs Yield Maunds
  const sowingDateData = [
    { window: 'Oct 25 - Nov 05 (Early)', avgYield: 56.0, tillerDensity: 490 },
    { window: 'Nov 06 - Nov 15 (Optimal)', avgYield: 53.5, tillerDensity: 470 },
    { window: 'Nov 16 - Nov 25 (Normal)', avgYield: 48.0, tillerDensity: 430 },
    { window: 'Nov 26 - Dec 05 (Late)', avgYield: 41.0, tillerDensity: 370 },
    { window: 'Dec 06+ (Very Late)', avgYield: 34.0, tillerDensity: 310 },
  ];

  // Chart 3: District Acreage & Production
  const districtPerformance = [
    { district: 'Ludhiana', acreage: 62.0, expectedTons: 132.5, avgYield: 54.1 },
    { district: 'Karnal', acreage: 48.0, expectedTons: 106.4, avgYield: 55.0 },
    { district: 'Patiala', acreage: 42.0, expectedTons: 88.8, avgYield: 52.0 },
    { district: 'Bathinda', acreage: 38.0, expectedTons: 79.2, avgYield: 51.5 },
    { district: 'Meerut', acreage: 31.5, expectedTons: 64.0, avgYield: 50.0 },
    { district: 'Indore', acreage: 25.0, expectedTons: 48.6, avgYield: 48.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Wheat Analytics & Yield Intelligence"
        description="Agronomic data correlations: seed variety performance, sowing window yield curves, and fertilizer split responses."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Top Performing Variety"
          value="Subhani-2021"
          subtitle="55.0 Maunds/Acre Average"
          icon={Award}
          variant="primary"
        />
        <MetricCard
          title="Optimal Sowing Window"
          value="Oct 25 - Nov 10"
          subtitle="+18% yield premium vs late sown"
          icon={Sprout}
        />
        <MetricCard
          title="Laser Leveling Impact"
          value="+4.5 Mnds/Ac"
          subtitle="22% water saving recorded"
          icon={Droplets}
          trend={{ value: '4.5', isPositive: true, label: 'maunds gain' }}
        />
        <MetricCard
          title="State Yield Outperformance"
          value="+21.4%"
          subtitle="vs Provincial 34 Maund Avg"
          icon={TrendingUp}
          trend={{ value: '21.4%', isPositive: true, label: 'above state' }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Seed Variety Performance Comparison */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Seed Variety Yield Benchmark (Maunds/Acre)</CardTitle>
            <CardDescription className="text-xs">Monitored crop yield vs baseline research station benchmark</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varietyYieldData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="variety" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[30, 60]} tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.8rem', fontSize: '12px' }}
                    formatter={(value: any, name: any) => [`${value} Maunds/Ac`, name === 'actualYield' ? 'Actual Monitored' : 'Benchmark']}
                  />
                  <Bar dataKey="actualYield" fill="hsl(var(--primary))" name="actualYield" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="benchmark" fill="#94a3b8" name="benchmark" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Sowing Date Curve */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Sowing Date vs Yield Penalty Curve</CardTitle>
            <CardDescription className="text-xs">Each week of sowing delay after Nov 15 reduces yield by ~1.5 maunds/acre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sowingDateData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="window" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis domain={[25, 60]} tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.8rem', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} Maunds/Acre`, 'Average Yield']}
                  />
                  <Line type="monotone" dataKey="avgYield" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* District Intelligence Breakdown */}
      <Card className="border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">District Agro-Ecological Output Breakdown</CardTitle>
          <CardDescription className="text-xs">Cultivated acreage, estimated harvest tons, and average productivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {districtPerformance.map((dist) => (
              <div key={dist.district} className="p-4 rounded-xl border bg-card/60 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>{dist.district}</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {dist.avgYield} Mnds/Ac
                  </Badge>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Monitored Acreage:</span>
                  <span className="font-semibold text-foreground">{dist.acreage} Acres</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Expected Harvest:</span>
                  <span className="font-bold text-primary">{dist.expectedTons} Metric Tons</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
