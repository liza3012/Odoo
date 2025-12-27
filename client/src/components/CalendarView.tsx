import { MaintenanceRequest } from "@shared/schema";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { ShieldCheck, Wrench, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  requests: MaintenanceRequest[];
  onDateClick?: (date: Date) => void;
}

export function CalendarView({ requests, onDateClick }: CalendarViewProps) {
  const preventiveRequests = requests.filter(r => r.type === "preventive");

  const renderDay = (day: Date) => {
    const dayRequests = preventiveRequests.filter(r => isSameDay(new Date(r.scheduledDate), day));
    
    if (dayRequests.length === 0) return null;

    return (
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
        {dayRequests.slice(0, 3).map((req) => (
          <TooltipProvider key={req.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="glass-panel border-white/10 p-3 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm">Preventive Maintenance</span>
                </div>
                <div className="font-semibold text-white">{req.title}</div>
                <div className="text-[10px] uppercase text-muted-foreground font-mono flex items-center gap-2">
                  <span>{req.technician}</span>
                  <span>•</span>
                  <span>{req.durationHours}h duration</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {dayRequests.length > 3 && (
          <div className="text-[8px] text-emerald-400 font-bold">+{dayRequests.length - 3}</div>
        )}
      </div>
    );
  };

  return (
    <Card className="glass-panel border-white/10 overflow-hidden">
      <CardHeader className="border-b border-white/5 bg-white/5 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-display flex items-center gap-2">
            <ShieldCheck className="text-emerald-400 w-6 h-6" />
            Maintenance Schedule
          </CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Preventive</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Calendar
          mode="single"
          className="p-4"
          onSelect={(date) => date && onDateClick?.(date)}
          components={ {
            Day: ({ date, ...props }) => {
              const hasRequests = preventiveRequests.some(r => isSameDay(new Date(r.scheduledDate), date));
              return (
                <div className="relative h-12 w-12 flex flex-col items-center justify-center">
                  <button
                    {...props}
                    className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 hover-elevate",
                      props.selected && "bg-primary/20 text-primary border border-primary/30",
                      hasRequests && "font-bold text-white"
                    )}
                  >
                    {date.getDate()}
                  </button>
                  {renderDay(date)}
                </div>
              );
            }
          } }
        />
        <div className="px-6 py-4 bg-white/5 border-t border-white/5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Showing monthly overview of <span className="text-emerald-400 font-semibold">Preventive Maintenance</span> schedule. 
              Click any date to quickly schedule a new preventive maintenance request for that day. 
              Hover over colored indicators to see technical details.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
