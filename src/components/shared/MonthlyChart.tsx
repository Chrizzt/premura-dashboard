import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyChartProps {
  data: { label: string; appointments: number }[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#16213e',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 8,
              color: '#e2e8f0',
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="appointments"
            stroke="#7b2ff7"
            strokeWidth={2.5}
            dot={{ fill: '#7b2ff7', strokeWidth: 0, r: 4 }}
            activeDot={{ fill: '#00d4ff', r: 6, strokeWidth: 0 }}
            name="Appointments"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
