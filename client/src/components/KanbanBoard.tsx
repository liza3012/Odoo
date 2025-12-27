import { useMemo } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { MaintenanceRequest, Equipment } from "@shared/schema";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { useUpdateMaintenanceRequest } from "@/hooks/use-maintenance";
import { useState } from "react";

interface KanbanBoardProps {
  requests: MaintenanceRequest[];
  equipmentList: Equipment[];
}

type Status = "new" | "in_progress" | "repaired" | "scrap";

const COLUMNS: { id: Status; title: string; color: string }[] = [
  { id: "new", title: "New Requests", color: "bg-blue-500/20 text-blue-400" },
  { id: "in_progress", title: "In Progress", color: "bg-amber-500/20 text-amber-400" },
  { id: "repaired", title: "Repaired", color: "bg-emerald-500/20 text-emerald-400" },
  { id: "scrap", title: "Scrap / Decommission", color: "bg-red-500/20 text-red-400" },
];

export function KanbanBoard({ requests, equipmentList }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const updateRequest = useUpdateMaintenanceRequest();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = useMemo(() => {
    const cols = {
      new: [] as MaintenanceRequest[],
      in_progress: [] as MaintenanceRequest[],
      repaired: [] as MaintenanceRequest[],
      scrap: [] as MaintenanceRequest[],
    };
    requests.forEach((req) => {
      const status = req.status as Status;
      if (cols[status]) {
        cols[status].push(req);
      }
    });
    return cols;
  }, [requests]);

  function findEquipment(id: number) {
    return equipmentList.find(e => e.id === id);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeRequest = requests.find(r => r.id === activeId);
    if (!activeRequest) return;

    // Dropped on a container (column)
    if (COLUMNS.some(col => col.id === overId)) {
      if (activeRequest.status !== overId) {
        updateRequest.mutate({ 
          id: activeId, 
          status: overId as Status 
        });
      }
    } 
    // Dropped on another card
    else {
       const overRequest = requests.find(r => r.id === overId);
       if (overRequest && activeRequest.status !== overRequest.status) {
         updateRequest.mutate({ 
           id: activeId, 
           status: overRequest.status as Status 
         });
       }
    }

    setActiveId(null);
  }

  const activeRequest = activeId ? requests.find(r => r.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full min-h-[500px]">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            count={columns[col.id].length}
            requests={columns[col.id]}
            equipmentList={equipmentList}
          />
        ))}
      </div>

      <DragOverlay>
        {activeRequest ? (
          <KanbanCard 
            request={activeRequest} 
            equipment={findEquipment(activeRequest.equipmentId)}
            isOverlay 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
