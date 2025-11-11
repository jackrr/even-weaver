import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchWeave } from "@/client/lib/api";

export default function Home() {
  const { id } = useParams();
  const { data: weave } = useQuery({
    queryKey: ["weave", id],
    queryFn: () => fetchWeave(id),
    enabled: !!id,
  });

  if (!weave) return null;

  return (
    <>
      <h2>{weave.name}</h2>
    </>
  );
}
