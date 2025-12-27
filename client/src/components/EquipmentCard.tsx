import { Equipment } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle2, Factory } from "lucide-react";
import { motion } from "framer-motion";

interface EquipmentCardProps {
  equipment: Equipment;
  requestCount: number;
}

export function EquipmentCard({ equipment, requestCount }: EquipmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl glass-card p-6"
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
      </div>
    </motion.div>
  );
}
