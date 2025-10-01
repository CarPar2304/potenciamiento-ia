import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExportField } from '@/utils/exportUtils';

interface FieldSelectorProps {
  fields: ExportField[];
  selectedFields: string[];
  onFieldToggle: (fieldKey: string) => void;
  disabled?: boolean;
  title: string;
  description?: string;
}

export const FieldSelector = ({
  fields,
  selectedFields,
  onFieldToggle,
  disabled = false,
  title,
  description,
}: FieldSelectorProps) => {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      <ScrollArea className="h-[200px] rounded-md border p-3">
        <div className="space-y-3">
          {fields.map((field) => {
            const isSelected = selectedFields.includes(field.key);
            
            return (
              <div
                key={field.key}
                className="flex items-center space-x-3 py-1 hover:bg-muted/50 rounded px-2 transition-colors"
              >
                <Checkbox
                  id={field.key}
                  checked={isSelected}
                  onCheckedChange={() => onFieldToggle(field.key)}
                  disabled={disabled}
                  className="flex-shrink-0"
                />
                <Label
                  htmlFor={field.key}
                  className={`text-sm cursor-pointer flex-1 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {field.label}
                </Label>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
