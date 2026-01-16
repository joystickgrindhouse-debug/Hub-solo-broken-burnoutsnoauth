import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertCalibration } from "@shared/routes";

export function useCalibration() {
  return useQuery({
    queryKey: [api.calibration.get.path],
    queryFn: async () => {
      const res = await fetch(api.calibration.get.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch calibration");
      return api.calibration.get.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useSaveCalibration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCalibration) => {
      const res = await fetch(api.calibration.save.path, {
        method: api.calibration.save.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) throw new Error("Invalid calibration data");
        throw new Error("Failed to save calibration");
      }
      return api.calibration.save.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.calibration.get.path] });
    },
  });
}
