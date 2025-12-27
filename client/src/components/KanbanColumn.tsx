import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MaintenanceRequest, Equipment } from "@shared/schema";
import { KanbanCard } from "./KanbanCard";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  requests: MaintenanceRequest[];
  equipmentList: Equipment[];
}

export function KanbanColumn({ id, title, color, count, requests, equipmentList }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color.split(' ')[0].replace('/20', '')}`} />
          <h3 className="font-display font-semibold text-white">{title}</h3>
        </div>
        <Badge variant="secondary" className="bg-white/5 text-muted-foreground hover:bg-white/10">
          {count}
        </Badge>
      </div>
      
      <div ref={setNodeRef} className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)]">
        <SortableContext items={requests.map(r => r.id)} strategy={verticalListSortingStrategy}>
          {requests.map((request) => (
            <KanbanCard 
              key={request.id} 
              request={request} 
              equipment={equipmentList.find(e => e.id === request.equipmentId)}
            />
          ))}
        </SortableContext>
        {requests.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground/40 italic">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}
