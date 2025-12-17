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
      <h2 className="my-4 text-lg">Your weaves</h2>
      <div className="flex flex-row flex-wrap overflow-y-auto gap-4 font-semibold">
        {weaves?.map((weave) => (
          <a className="relative" key={weave.id} href={`/weaves/${weave.id}`}>
            <h3 className="mb-2 absolute top-1/2 left-1/2 -translate-1/2 text-xl bg-gray-900 opacity-80 p-4 rounded-lg">
              {weave.name}
            </h3>
            <PatternPreview pattern={weave.pattern} />
          </a>
        ))}
      </div>
      <Button className="mt-5" onClick={() => setCreatingWeave(true)}>
        Add a new Weave
      </Button>
      <CreateWeaveModal open={creatingWeave} toggleOpen={setCreatingWeave} />
    </>
  );
}
