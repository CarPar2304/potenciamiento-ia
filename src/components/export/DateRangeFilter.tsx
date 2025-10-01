import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export const DateRangeFilter = ({ dateRange, onDateRangeChange }: DateRangeFilterProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Rango de fechas</h4>
        <p className="text-xs text-muted-foreground">
          Filtra los registros por fecha de solicitud o creación
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Fecha desde */}
        <div className="space-y-2">
          <Label className="text-sm">Desde</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  format(dateRange.from, 'dd/MM/yyyy', { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) =>
                  onDateRangeChange({ ...dateRange, from: date })
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Fecha hasta */}
        <div className="space-y-2">
          <Label className="text-sm">Hasta</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !dateRange.to && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.to ? (
                  format(dateRange.to, 'dd/MM/yyyy', { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) =>
                  onDateRangeChange({ ...dateRange, to: date })
                }
                disabled={(date) =>
                  dateRange.from ? date < dateRange.from : false
                }
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {dateRange.from && dateRange.to && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
          className="w-full"
        >
          Limpiar filtro de fechas
        </Button>
      )}
    </div>
  );
};

const Label = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <label className={className}>{children}</label>
);
