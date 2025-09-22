import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutiveKPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  format?: 'number' | 'currency' | 'percentage';
  className?: string;
}

export function ExecutiveKPI({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  format = 'number',
  className 
}: ExecutiveKPIProps) {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    if (isNaN(numVal)) return val;
    
    switch (format) {
      case 'currency':
        if (numVal >= 1000000) {
          return `$${(numVal / 1000000).toFixed(1)}M`;
        }
        if (numVal >= 1000) {
          return `$${(numVal / 1000).toFixed(0)}K`;
        }
        return `$${numVal.toLocaleString()}`;
      case 'percentage':
        return `${numVal.toFixed(1)}%`;
      case 'number':
      default:
        if (numVal >= 1000000) {
          return `${(numVal / 1000000).toFixed(1)}M`;
        }
        if (numVal >= 1000) {
          return `${(numVal / 1000).toFixed(0)}K`;
        }
        return numVal.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success border-success/20 bg-success/10';
      case 'down':
        return 'text-destructive border-destructive/20 bg-destructive/10';
      default:
        return 'text-muted-foreground border-muted-foreground/20 bg-muted/10';
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      "bg-gradient-to-br from-background to-background/80 backdrop-blur-sm",
      "border-l-4 border-l-primary/30",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-full bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {formatValue(value)}
          </div>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
          
          {trend && trendValue && (
            <div className="flex items-center space-x-1">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getTrendColor())}
              >
                {getTrendIcon()}
                <span className="ml-1">{trendValue}</span>
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}