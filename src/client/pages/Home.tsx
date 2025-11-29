import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "@/client/components/Button";
import CreateWeaveModal from "@/client/components/CreateWeaveModal";
import PatternPreview from "@/client/components/PatternPreview";
import { fetchWeaves } from "@/client/lib/api";
import { usePageTitle } from "@/client/lib/title";

export default function Home() {
  const [creatingWeave, setCreatingWeave] = useState(false);
  const { data: weaves } = useQuery({
    queryKey: ["weaves"],
    queryFn: fetchWeaves,
  });

  usePageTitle("Your Weaves");

  return (
    <>
      <h2>Your weaves</h2>
      <div className="grid overflow-auto">
        {weaves?.map((weave) => (
          <a key={weave.id} href={`/weaves/${weave.id}`}>
            <h3>{weave.name}</h3>
            <PatternPreview pattern={weave.pattern} />
          </a>
        ))}
      </div>
      <Button onClick={() => setCreatingWeave(true)}>New Weave</Button>
      <CreateWeaveModal open={creatingWeave} toggleOpen={setCreatingWeave} />
    </>
  );
}
