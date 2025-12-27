import { useMemo } from "react";
import { MaintenanceRequest, Equipment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { BarChart3, PieChart as PieChartIcon, Users, Tag } from "lucide-react";

interface AnalyticsReportProps {
  requests: MaintenanceRequest[];
  equipment: Equipment[];
}

export function AnalyticsReport({ requests, equipment }: AnalyticsReportProps) {
  // Data for Requests per Team (Pivot)
  const teamData = useMemo(() => {
    const counts: Record<string, number> = {};
    const equipmentMap = new Map(equipment.map(e => [e.id, e]));
    
    requests.forEach(req => {
      const eq = equipmentMap.get(req.equipmentId);
      const team = eq?.assignedTeam || "Unassigned";
      counts[team] = (counts[team] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [requests, equipment]);

  // Data for Requests per Equipment Category (Department)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    const equipmentMap = new Map(equipment.map(e => [e.id, e]));

    requests.forEach(req => {
      const eq = equipmentMap.get(req.equipmentId);
      const category = eq?.department || "General";
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [requests, equipment]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Requests per Team Chart */}
        <Card className="glass-panel border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-xl font-display flex items-center gap-2">
              <Users className="text-primary w-6 h-6" />
              Requests per Team
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} layout="vertical" margin={ { left: 40, right: 20 } }>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  width={100}
                />
                <RechartsTooltip 
                  contentStyle={ { backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '8px' } }
                  itemStyle={ { color: '#3b82f6' } }
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {teamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests per Category Chart */}
        <Card className="glass-panel border-white/10 overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-xl font-display flex items-center gap-2">
              <Tag className="text-accent w-6 h-6" />
              Requests by Department
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={ { backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '8px' } }
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Summary Table (Pivot Table Style) */}
      <Card className="glass-panel border-white/10 overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <CardTitle className="text-xl font-display flex items-center gap-2">
            <BarChart3 className="text-primary w-6 h-6" />
            Maintenance Summary Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-6 py-4">Department / Team</th>
                  <th className="px-6 py-4 text-center">Corrective</th>
                  <th className="px-6 py-4 text-center">Preventive</th>
                  <th className="px-6 py-4 text-center">Total Requests</th>
                  <th className="px-6 py-4 text-center">Est. Duration (h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categoryData.map((cat, idx) => {
                  const catRequests = requests.filter(r => {
                    const eq = equipment.find(e => e.id === r.equipmentId);
                    return eq?.department === cat.name;
                  });
                  const corrective = catRequests.filter(r => r.type === 'corrective').length;
                  const preventive = catRequests.filter(r => r.type === 'preventive').length;
                  const duration = catRequests.reduce((sum, r) => sum + (r.durationHours || 0), 0);

                  return (
                    <tr key={cat.name} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                      <td className="px-6 py-4 text-center text-slate-400">{corrective}</td>
                      <td className="px-6 py-4 text-center text-emerald-400">{preventive}</td>
                      <td className="px-6 py-4 text-center font-bold text-primary">{cat.value}</td>
                      <td className="px-6 py-4 text-center text-accent">{duration}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
