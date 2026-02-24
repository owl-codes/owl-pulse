import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

interface SparklineChartProps {
  data: number[];
  isPositive: boolean;
  coinId: string;
}

export function SparklineChart({ data, isPositive, coinId }: SparklineChartProps) {
  if (!data || data.length === 0) return null;

  // Format data for Recharts
  const chartData = data.map((val, index) => ({ value: val, index }));
  
  // Vibrant colors matching the theme
  const color = isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)";
  const gradientId = `sparkline-gradient-${coinId}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        {/* Hide YAxis but use domain to auto-scale the chart nicely */}
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          isAnimationActive={false} // Prevents lag on rapid auto-refresh
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
