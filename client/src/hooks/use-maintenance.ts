import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateMaintenanceRequest, type UpdateMaintenanceRequest } from "@shared/schema";

export function useMaintenanceRequests() {
  return useQuery({
    queryKey: [api.maintenance.list.path],
    queryFn: async () => {
      const res = await fetch(api.maintenance.list.path);
      if (!res.ok) throw new Error("Failed to fetch maintenance requests");
      return api.maintenance.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMaintenanceRequest) => {
      const res = await fetch(api.maintenance.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.maintenance.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create request");
      }
      return api.maintenance.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.maintenance.list.path] });
    },
  });
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateMaintenanceRequest) => {
      const url = buildUrl(api.maintenance.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update request");
      return api.maintenance.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.maintenance.list.path] });
    },
  });
}
