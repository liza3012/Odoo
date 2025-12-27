import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MaintenanceRequest, Equipment } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, AlertCircle } from "lucide-react";
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

  const isCritical = request.priority === "critical";
  const isOverdue = request.scheduledDate && isPast(new Date(request.scheduledDate)) && request.status !== "repaired" && request.status !== "scrap";

  const priorityColors = {
    low: "text-slate-400 border-slate-700 bg-slate-900/50",
    medium: "text-blue-400 border-blue-700 bg-blue-900/50",
    high: "text-amber-400 border-amber-700 bg-amber-900/50",
    critical: "text-red-400 border-red-700 bg-red-900/50",
  };

  // Generate avatar initials or use image service
  const initials = request.technician.split(' ').map(n => n[0]).join('').substring(0, 2);
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.technician}`;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        className={cn(
          "p-4 cursor-grab active:cursor-grabbing border-white/10 bg-card hover:border-primary/50 transition-all",
          isOverlay && "shadow-2xl scale-105 border-primary bg-card/90 backdrop-blur-xl rotate-2",
          isOverdue && "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        )}
      >
        <div className="flex justify-between items-start gap-2 mb-2">
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

        <h4 className="font-semibold text-sm text-white mb-1 line-clamp-2 leading-tight">
          {request.title}
        </h4>
        
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          {equipment?.name || "Unknown Equipment"}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-70" />
            {format(new Date(request.scheduledDate), "MMM d")}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground text-right hidden sm:block">
              {request.technician}
            </span>
            <Avatar className="w-6 h-6 border border-white/10">
              {/* Using descriptive HTML comment for potential image replacement */}
              {/* Technician avatar based on name seed */}
              <AvatarImage src={avatarUrl} alt={request.technician} />
              <AvatarFallback className="text-[10px] bg-secondary">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </Card>
    </div>
  );
}
