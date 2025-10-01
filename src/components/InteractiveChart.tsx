import React, { memo } from 'react';
import { motion } from 'framer-motion';
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
import type { ChartConfig } from '../data/projects';

interface InteractiveChartProps {
  config: ChartConfig;
  className?: string;
}

const RADIAN = Math.PI / 180;

// Custom label function for pie charts
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
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
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
        <p className="text-white/90 font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend with dark theme
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80 text-sm capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const InteractiveChart: React.FC<InteractiveChartProps> = ({ config, className = '' }) => {
  const {
    type,
    title,
    data,
    xAxisKey,
    yAxisKeys,
    colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'],
    width = 500,
    height = 300
  } = config;

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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="rgba(255,255,255,0.7)"
              fontSize={10}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              fontSize={10}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="rgba(255,255,255,0.7)"
              fontSize={10}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              fontSize={10}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
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

      case 'pie':
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
              outerRadius={Math.min(width, height) * 0.3}
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

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.7)"
              fontSize={12}
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
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
        return <div className="text-white/60">Unsupported chart type: {type}</div>;
    }
  };

  return (
    <motion.div 
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      </div>
      
      <div className="w-full overflow-hidden" style={{ height: Math.min(height, 300) }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default memo(InteractiveChart);