import ProjectCard from "./ProjectCard";

const ProjectList = ({projects}) => (
  <div>
    <div className="grid grid-cols-3">
      {projects.map((project) => (
        <ProjectCard project={project} />
      ))}
    </div>
  </div>
);

export default ProjectList;
