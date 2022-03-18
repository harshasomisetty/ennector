import {useState, useEffect} from "react";
import ProjectList from "./ProjectList";

const ExploreProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchData() {
      let response = await fetch("api/findProjects");
      let data = await response.json();

      setProjects(data);
    }
    fetchData();
  }, []);
  return (
    <div>
      <h2>Explore all Projects</h2>
      {projects.length > 0 ? (
        <ProjectList projects={projects} />
      ) : (
        <p>No projects created yet! </p>
      )}
    </div>
  );
};

export default ExploreProjects;
