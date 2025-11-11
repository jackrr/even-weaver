import Button from "./components/Button";
import CreateProjectModal from "./components/CreateProjectModal";
import { useState } from "react";

export default function Home() {
  const [creatingProject, setCreatingProject] = useState(false);

  return (
    <>
      <h1>Home</h1>
      <a href="/logout">Log Out</a>
      <Button onClick={() => setCreatingProject(true)}>New Project</Button>
      <CreateProjectModal
        open={creatingProject}
        toggleOpen={setCreatingProject}
      />
    </>
  );
}
