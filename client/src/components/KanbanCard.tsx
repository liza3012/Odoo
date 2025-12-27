import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MaintenanceRequest, Equipment } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, AlertCircle, Clock, ShieldCheck, Wrench } from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  request: MaintenanceRequest;
  equipment?: Equipment;
  isOverlay?: boolean;
}

export function KanbanCard({ request, equipment, isOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: "text-slate-400 border-slate-700 bg-slate-900/50",
    medium: "text-blue-400 border-blue-700 bg-blue-900/50",
    high: "text-amber-400 border-amber-700 bg-amber-900/50",
    critical: "text-red-400 border-red-700 bg-red-900/50",
  };

  const initials = request.technician.split(' ').map(n => n[0]).join('').substring(0, 2);
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.technician}`;
  const isOverdue = request.scheduledDate && isPast(new Date(request.scheduledDate)) && request.status !== "repaired" && request.status !== "scrap";

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        className={cn(
          "p-4 cursor-grab active:cursor-grabbing border-white/10 bg-card hover:border-primary/50 transition-all",
          isOverlay && "shadow-2xl scale-105 border-primary bg-card/90 backdrop-blur-xl rotate-2",
          isOverdue && "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        )}
      >
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex justify-between items-start gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-[10px] uppercase px-1.5 py-0 h-5", priorityColors[request.priority as keyof typeof priorityColors])}
            >
              {request.priority}
            </Badge>
            {isOverdue && (
              <div className="flex items-center text-[10px] text-red-400 font-bold bg-red-950/30 px-2 py-0.5 rounded-full border border-red-900/50">
                <AlertCircle className="w-3 h-3 mr-1" />
                OVERDUE
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] uppercase px-1.5 py-0 h-5",
                request.type === 'preventive' ? "text-emerald-400 border-emerald-700 bg-emerald-950/30" : "text-slate-400 border-white/10"
              )}
            >
              {request.type === 'preventive' ? (
                <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> Preventive</span>
              ) : (
                <span className="flex items-center gap-1"><Wrench className="w-2.5 h-2.5" /> Corrective</span>
              )}
            </Badge>
          </div>
        </div>

        <h4 className="font-semibold text-sm text-white mb-1 line-clamp-2 leading-tight">
          {request.title}
        </h4>
        
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          {equipment?.name || "Unknown Equipment"}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            <div className="flex items-center">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              {format(new Date(request.scheduledDate), "MMM d")}
            </div>
            <div className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
              {request.durationHours}h
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border border-white/10">
              <AvatarImage src={avatarUrl} alt={request.technician} />
              <AvatarFallback className="text-[10px] bg-secondary">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </Card>
    </div>
  );
}
