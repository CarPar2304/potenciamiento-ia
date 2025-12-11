import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  variant: 'primary' | 'success' | 'warning' | 'error';
}

const variants = {
  primary: {
    bg: 'bg-primary/10',
    icon: 'text-primary',
    border: 'border-l-primary'
  },
  success: {
    bg: 'bg-success/10',
    icon: 'text-success',
    border: 'border-l-success'
  },
  warning: {
    bg: 'bg-warning/10', 
    icon: 'text-warning',
    border: 'border-l-warning'
  },
  error: {
    bg: 'bg-destructive/10',
    icon: 'text-destructive', 
    border: 'border-l-destructive'
  }
};

export const StatCard = memo(function StatCard({ title, value, description, icon: Icon, variant }: StatCardProps) {
  const style = variants[variant];

  return (
    <Card className={`relative overflow-hidden group hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-fade-in border-l-4 ${style.border} backdrop-blur-sm`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-3 rounded-xl ${style.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-5 w-5 ${style.icon}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">{value}</div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
});
