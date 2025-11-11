import { useQuery } from "@tanstack/react-query";
import { fetchColors, type Color } from "../lib/api";

export function useColorMap() {
  const { data: colors } = useQuery({
    queryKey: ["colors"],
    queryFn: fetchColors,
    staleTime: "static",
    select: (colors: Color[]) => {
      const colorMap: { [id: number]: Color } = {};
      return colors.reduce((colorMap, color) => {
        colorMap[color.id] = color;
        return colorMap;
      }, colorMap);
    },
  });

  return colors;
}
