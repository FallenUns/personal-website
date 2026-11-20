import { memo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';
import type { ChartConfig } from '../content/types';

interface InteractiveChartProps {
  config: ChartConfig;
}

// Type definitions for recharts custom components
interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

interface TooltipPayloadItem {
  dataKey: string;
  value: number | string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

interface LegendPayloadItem {
  color: string;
  value: string;
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[];
}

const RADIAN = Math.PI / 180;

// Custom label function for pie charts
const renderCustomizedLabel = ({
  cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0
}: PieLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="500"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip with dark theme
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tip">
        <p><strong>{label}</strong></p>
        {payload.map((entry: TooltipPayloadItem, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend with dark theme
const CustomLegend = ({ payload }: CustomLegendProps) => {
  return (
    <div className="chart-legend">
      {payload?.map((entry: LegendPayloadItem, index: number) => (
        <span key={index}>
          <i style={{ backgroundColor: entry.color }} />
          {entry.value}
        </span>
      ))}
    </div>
  );
};

const InteractiveChart = ({ config }: InteractiveChartProps) => {
  const {
    type,
    title,
    data,
    xAxisKey,
    yAxisKeys,
    colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316']
  } = config;
  const height = 300;

  const chartColors = colors.length >= yAxisKeys.length ? colors : [
    ...colors,
    ...Array(yAxisKeys.length - colors.length).fill('#6b7280')
  ];

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 20, left: 10, bottom: 40 }
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="currentColor" strokeOpacity={0.5}
              fontSize={10}
              tick={{ fill: 'currentColor', fillOpacity: 0.75 }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="currentColor" strokeOpacity={0.5}
              fontSize={10}
              tick={{ fill: 'currentColor', fillOpacity: 0.75 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {yAxisKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={chartColors[index]}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                animationBegin={index * 200}
              />
            ))}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="currentColor" strokeOpacity={0.5}
              fontSize={10}
              tick={{ fill: 'currentColor', fillOpacity: 0.75 }}
            />
            <YAxis 
              stroke="currentColor" strokeOpacity={0.5}
              fontSize={10}
              tick={{ fill: 'currentColor', fillOpacity: 0.75 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {yAxisKeys.map((key, index) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={chartColors[index]}
                strokeWidth={3}
                dot={{ fill: chartColors[index], strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: chartColors[index] }}
                animationDuration={1000}
                animationBegin={index * 200}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {yAxisKeys.map((key, index) => (
                <linearGradient key={key} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors[index]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors[index]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="currentColor" strokeOpacity={0.5}
              fontSize={12}
              tick={{ fill: 'currentColor', fillOpacity: 0.75 }}
            />
            <YAxis 
              stroke="currentColor" strokeOpacity={0.5}
              fontSize={12}
              tick={{ fill: 'currentColor', fillOpacity: 0.75 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {yAxisKeys.map((key, index) => (
              <Area 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={chartColors[index]}
                fillOpacity={1}
                fill={`url(#colorGradient${index})`}
                strokeWidth={2}
                animationDuration={1000}
                animationBegin={index * 200}
              />
            ))}
          </AreaChart>
        );

      case 'pie': {
        const pieData = data.map((item, index) => ({
          ...item,
          value: item[yAxisKeys[0]] as number,
          fill: chartColors[index % chartColors.length]
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={height * 0.3}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        );
      }

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.12} />
            <XAxis 
              dataKey={xAxisKey}
              type="number"
              name={xAxisKey}
              domain={[(min: number) => Math.floor(min - 2), (max: number) => Math.ceil(max + 2)]} 
              stroke="currentColor" strokeOpacity={0.5}
              fontSize={12}
              tick={{ fill: 'currentColor', fillOpacity: 0.75 }}
            />
            <YAxis 
              type="number"
              dataKey={yAxisKeys[0]}
              name={yAxisKeys[0]}
              domain={[(min: number) => Math.floor(min - 2), (max: number) => Math.ceil(max + 2)]}
              stroke="currentColor" strokeOpacity={0.5}
              fontSize={12}
              tick={{ fill: 'currentColor', fillOpacity: 0.75 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {yAxisKeys.map((key, index) => (
              <Scatter 
                key={key}
                dataKey={key} 
                fill={chartColors[index]}
              />
            ))}
          </ScatterChart>
        );

      default:
        return <p>Unsupported chart type: {type}</p>;
    }
  };

  return (
    <figure className="chart">
      <figcaption>{title}</figcaption>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </figure>
  );
};

export default memo(InteractiveChart);
