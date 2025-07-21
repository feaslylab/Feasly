import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Milestone } from '@/hooks/useMilestones';

const milestoneSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  target_date: z.date({
    required_error: 'Target date is required',
  }),
  status: z.enum(['planned', 'in_progress', 'completed']),
  description: z.string().optional(),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone?: Milestone;
  projectId: string;
  onSave: (data: MilestoneFormData & { project_id: string }) => Promise<void>;
}

// Predefined milestone suggestions
const MILESTONE_SUGGESTIONS = [
  'Permits Approved',
  'Site Mobilization',
  'Foundation Complete',
  'Structure Complete',
  'MEP Rough-in',
  'Facade Complete',
  'Interior Fit-out',
  'Final Inspections',
  'Handover',
  'Project Close-out'
];

export function MilestoneDialog({ 
  open, 
  onOpenChange, 
  milestone, 
  projectId,
  onSave 
}: MilestoneDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      label: milestone?.label || '',
      target_date: milestone?.target_date ? new Date(milestone.target_date) : undefined,
      status: milestone?.status || 'planned',
      description: milestone?.description || '',
    },
  });

  const handleSubmit = async (data: MilestoneFormData) => {
    try {
      setIsSubmitting(true);
      await onSave({
        ...data,
        project_id: projectId,
        target_date: data.target_date,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving milestone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue('label', suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {milestone ? 'Edit Milestone' : 'Create New Milestone'}
          </DialogTitle>
          <DialogDescription>
            {milestone 
              ? 'Update milestone details and track progress.'
              : 'Add a new milestone to track project progress.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Milestone Label</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Permits Approved"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  
                  {/* Milestone suggestions */}
                  {!milestone && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-2">
                        Quick suggestions:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {MILESTONE_SUGGESTIONS.slice(0, 5).map((suggestion) => (
                          <Button
                            key={suggestion}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs h-6"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planned">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span>Planned</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this milestone..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : milestone ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}