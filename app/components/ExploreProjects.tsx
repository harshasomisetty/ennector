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
      <p>Explore all Projects</p>
      <ProjectList projects={projects} />
    </div>
  );
};

export default ExploreProjects;
