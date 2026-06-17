import dynamic from 'next/dynamic';

export const DynamicBarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), {
  ssr: false,
  loading: () => <div style={{ height: 250, background: '#f8f9fa', borderRadius: 8 }} />,
});

export const DynamicBar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });

export const DynamicPieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), {
  ssr: false,
  loading: () => <div style={{ height: 280, background: '#f8f9fa', borderRadius: 8 }} />,
});

export const DynamicPie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });

export const DynamicRadarChart = dynamic(() => import('recharts').then((mod) => mod.RadarChart), {
  ssr: false,
  loading: () => <div style={{ height: 280, background: '#f8f9fa', borderRadius: 8 }} />,
});

export const DynamicRadar = dynamic(() => import('recharts').then((mod) => mod.Radar), {
  ssr: false,
});

export const DynamicLineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), {
  ssr: false,
  loading: () => <div style={{ height: 250, background: '#f8f9fa', borderRadius: 8 }} />,
});

export const DynamicLine = dynamic(() => import('recharts').then((mod) => mod.Line), {
  ssr: false,
});

export const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
export const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
export const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), {
  ssr: false,
});
export const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
export const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });
export const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
export const PolarGrid = dynamic(() => import('recharts').then((mod) => mod.PolarGrid), {
  ssr: false,
});
export const PolarAngleAxis = dynamic(() => import('recharts').then((mod) => mod.PolarAngleAxis), {
  ssr: false,
});
export const PolarRadiusAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarRadiusAxis),
  { ssr: false }
);
export const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
