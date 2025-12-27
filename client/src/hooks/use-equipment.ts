import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateEquipmentRequest } from "@shared/schema";

export function useEquipmentList() {
  return useQuery({
    queryKey: [api.equipment.list.path],
    queryFn: async () => {
      const res = await fetch(api.equipment.list.path);
      if (!res.ok) throw new Error("Failed to fetch equipment");
      return api.equipment.list.responses[200].parse(await res.json());
    },
  });
}

export function useEquipment(id: number | null) {
  return useQuery({
    queryKey: [api.equipment.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.equipment.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch equipment details");
      return api.equipment.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEquipmentRequest) => {
      const res = await fetch(api.equipment.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.equipment.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create equipment");
      }
      return api.equipment.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.equipment.list.path] });
    },
  });
}
