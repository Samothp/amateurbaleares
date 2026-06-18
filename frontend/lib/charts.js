import dynamic from 'next/dynamic';

export const DynamicBarChart = dynamic(
  () => import('recharts').then((m) => m.BarChart),
  {
    ssr: false,
    loading: () => <div style={{ height: 250, background: '#f8f9fa', borderRadius: 8 }} />,
  }
);
export const DynamicBar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
export const DynamicPieChart = dynamic(
  () => import('recharts').then((m) => m.PieChart),
  {
    ssr: false,
    loading: () => <div style={{ height: 280, background: '#f8f9fa', borderRadius: 8 }} />,
  }
);
export const DynamicPie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false });
export const DynamicRadarChart = dynamic(
  () => import('recharts').then((m) => m.RadarChart),
  {
    ssr: false,
    loading: () => <div style={{ height: 280, background: '#f8f9fa', borderRadius: 8 }} />,
  }
);
export const DynamicRadar = dynamic(() => import('recharts').then((m) => m.Radar), {
  ssr: false,
});
export const DynamicLineChart = dynamic(
  () => import('recharts').then((m) => m.LineChart),
  {
    ssr: false,
    loading: () => <div style={{ height: 250, background: '#f8f9fa', borderRadius: 8 }} />,
  }
);
export const DynamicLine = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
export const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
export const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
export const CartesianGrid = dynamic(() => import('recharts').then((m) => m.CartesianGrid), {
  ssr: false,
});
export const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
export const Legend = dynamic(() => import('recharts').then((m) => m.Legend), { ssr: false });
export const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);
export const PolarGrid = dynamic(() => import('recharts').then((m) => m.PolarGrid), {
  ssr: false,
});
export const PolarAngleAxis = dynamic(() => import('recharts').then((m) => m.PolarAngleAxis), {
  ssr: false,
});
export const PolarRadiusAxis = dynamic(
  () => import('recharts').then((m) => m.PolarRadiusAxis),
  { ssr: false }
);
export const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false });
