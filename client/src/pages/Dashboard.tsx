import { useState } from "react";
import { useEquipmentList } from "@/hooks/use-equipment";
import { useMaintenanceRequests } from "@/hooks/use-maintenance";
import { EquipmentCard } from "@/components/EquipmentCard";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CreateEquipmentDialog } from "@/components/CreateEquipmentDialog";
import { CreateMaintenanceDialog } from "@/components/CreateMaintenanceDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, LayoutGrid, Kanban, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: equipment, isLoading: loadingEquipment, refetch: refetchEquipment } = useEquipmentList();
  const { data: requests, isLoading: loadingRequests, refetch: refetchRequests } = useMaintenanceRequests();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"grid" | "kanban">("grid");

  const filteredEquipment = equipment?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getRequestCount(equipmentId: number) {
    if (!requests) return 0;
    return requests.filter(r => r.equipmentId === equipmentId && r.status !== "repaired").length;
  }

  if (loadingEquipment || loadingRequests) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading GearGuard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <RefreshCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                GearGuard
              </h1>
              <p className="text-xs text-muted-foreground tracking-wide uppercase">Maintenance Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search equipment..." 
                className="pl-9 bg-white/5 border-white/10 rounded-xl focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <CreateEquipmentDialog />
            <CreateMaintenanceDialog />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        <Tabs defaultValue="equipment" className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5 pb-1">
            <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl">
              <TabsTrigger value="equipment" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Equipment Grid
              </TabsTrigger>
              <TabsTrigger value="kanban" className="rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Kanban className="w-4 h-4 mr-2" />
                Maintenance Board
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { refetchEquipment(); refetchRequests(); }}
                className="text-muted-foreground hover:text-white"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>

          <TabsContent value="equipment" className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEquipment?.map((item) => (
                <EquipmentCard 
                  key={item.id} 
                  equipment={item} 
                  requestCount={getRequestCount(item.id)}
                />
              ))}
              {filteredEquipment?.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  <p className="text-lg">No equipment found matching "{searchTerm}"</p>
                  <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2 text-primary">
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="kanban" className="mt-0 h-full focus-visible:outline-none">
            <KanbanBoard 
              requests={requests || []} 
              equipmentList={equipment || []} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
