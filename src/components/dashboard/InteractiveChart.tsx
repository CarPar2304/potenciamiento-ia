import { useState, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { Download, Filter, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface InteractiveChartProps {
  title: string;
  description?: string;
  data: any[];
  type: 'bar' | 'pie' | 'line' | 'area' | 'scatter';
  config: Record<string, { label: string; color: string }>;
  xAxisKey?: string;
  yAxisKey?: string | string[];
  onDataPointClick?: (data: any) => void;
  onExport?: () => void;
  className?: string;
  height?: number;
}

export function InteractiveChart({
  title,
  description,
  data,
  type,
  config,
  xAxisKey = 'name',
  yAxisKey,
  onDataPointClick,
  onExport,
  className,
  height = 400
}: InteractiveChartProps) {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [isFiltered, setIsFiltered] = useState(false);

  const handleDataPointClick = useCallback((data: any) => {
    setSelectedData(data);
    onDataPointClick?.(data);
  }, [onDataPointClick]);

  const handleExport = useCallback(() => {
    // Create CSV export
    const csvContent = data.map(item => 
      Object.values(item).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    onExport?.();
  }, [data, title, onExport]);

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
      onClick: handleDataPointClick,
      className: "cursor-pointer"
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs fill-muted-foreground"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis className="text-xs fill-muted-foreground" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            {Array.isArray(yAxisKey) ? (
              yAxisKey.map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={config[key]?.color || `hsl(var(--primary))`}
                  radius={index === yAxisKey.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  stackId="a"
                  onClick={handleDataPointClick}
                />
              ))
            ) : (
              <Bar 
                dataKey={yAxisKey || 'value'} 
                fill={config[yAxisKey || 'value']?.color || `hsl(var(--primary))`}
                radius={[4, 4, 0, 0]}
                onClick={handleDataPointClick}
              />
            )}
          </BarChart>
        );

      case 'pie':
        const COLORS = Object.values(config).map(c => c.color);
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onClick={handleDataPointClick}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
          </PieChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs fill-muted-foreground"
            />
            <YAxis className="text-xs fill-muted-foreground" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            {Array.isArray(yAxisKey) ? (
              yAxisKey.map(key => (
                <Line 
                  key={key}
                  type="monotone"
                  dataKey={key} 
                  stroke={config[key]?.color || `hsl(var(--primary))`}
                  strokeWidth={2}
                  dot={{ r: 4, className: "cursor-pointer" }}
                  onClick={handleDataPointClick}
                />
              ))
            ) : (
              <Line 
                type="monotone"
                dataKey={yAxisKey || 'value'} 
                stroke={config[yAxisKey || 'value']?.color || `hsl(var(--primary))`}
                strokeWidth={2}
                dot={{ r: 4, className: "cursor-pointer" }}
                onClick={handleDataPointClick}
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs fill-muted-foreground"
            />
            <YAxis className="text-xs fill-muted-foreground" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area
              type="monotone"
              dataKey={Array.isArray(yAxisKey) ? yAxisKey[0] : (yAxisKey || 'value')}
              stroke={config[Array.isArray(yAxisKey) ? yAxisKey[0] : (yAxisKey || 'value')]?.color || `hsl(var(--primary))`}
              fill={config[Array.isArray(yAxisKey) ? yAxisKey[0] : (yAxisKey || 'value')]?.color || `hsl(var(--primary))`}
              fillOpacity={0.3}
              strokeWidth={2}
              onClick={handleDataPointClick}
            />
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number"
              dataKey="x" 
              className="text-xs fill-muted-foreground"
            />
            <YAxis 
              type="number"
              dataKey="y"
              className="text-xs fill-muted-foreground" 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Scatter 
              data={data} 
              fill={config.scatter?.color || `hsl(var(--primary))`}
              onClick={handleDataPointClick}
            />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsFiltered(!isFiltered)}>
                  <Filter className="mr-2 h-4 w-4" />
                  {isFiltered ? 'Quitar filtro' : 'Filtrar datos'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={`h-[${height}px]`}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </ChartContainer>
        
        {selectedData && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium">Datos seleccionados:</p>
            <pre className="text-xs mt-1 text-muted-foreground">
              {JSON.stringify(selectedData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}