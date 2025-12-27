import { Equipment, MaintenanceRequest } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle2, Factory, History, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useMaintenanceRequests } from "@/hooks/use-maintenance";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EquipmentCardProps {
  equipment: Equipment;
  requestCount: number;
}

export function EquipmentCard({ equipment, requestCount }: EquipmentCardProps) {
  const { data: requests } = useMaintenanceRequests();
  const [showHistory, setShowHistory] = useState(false);

  const history = requests?.filter(r => r.equipmentId === equipment.id)
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group relative overflow-hidden rounded-2xl glass-card p-6 cursor-pointer"
        onClick={() => setShowHistory(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-primary">
              <Factory className="w-6 h-6" />
            </div>
            <Badge 
              variant="outline" 
              className={equipment.isUnderRepair 
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }
            >
              {equipment.isUnderRepair ? (
                <span className="flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> Under Repair
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              )}
            </Badge>
          </div>

          <h3 className="text-xl font-display font-bold text-white mb-1 group-hover:text-primary transition-colors">
            {equipment.name}
          </h3>
          <p className="text-sm text-muted-foreground font-mono mb-4">
            SN: {equipment.serialNumber}
          </p>

          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Department</span>
              <span className="text-white">{equipment.department}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Team</span>
              <span className="text-white">{equipment.assignedTeam}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Open Requests</span>
              <span className={`font-bold ${requestCount > 0 ? 'text-accent' : 'text-muted-foreground'}`}>
                {requestCount}
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center text-xs text-primary/60 group-hover:text-primary transition-colors">
            <History className="w-3 h-3 mr-1" />
            View Maintenance History
          </div>
        </div>
      </motion.div>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="glass-panel border-white/10 text-white sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">
              <History className="text-primary" />
              Maintenance History
            </DialogTitle>
            <div className="text-sm text-muted-foreground font-mono">
              {equipment.name} • {equipment.serialNumber}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 mt-4">
            <div className="space-y-4">
              {history && history.length > 0 ? (
                history.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-primary">{req.title}</h4>
                        <p className="text-xs text-muted-foreground">Technician: {req.technician}</p>
                      </div>
                      <Badge variant="outline" className={
                        req.status === 'repaired' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        req.status === 'scrap' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }>
                        {req.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-white/60 font-mono">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {format(new Date(req.scheduledDate), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {req.durationHours}h
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-4">
                        {req.type}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  No maintenance records found.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
