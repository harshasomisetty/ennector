import LinkButton from "./LinkButton";

const CreatedProjects = () => {
  return (
    <div>
      <p>Your created Projects</p>
      <LinkButton
        name="Create New Project"
        link="/creators/NewProject"
        attributes="border-2 rounded-full p-2 cursor-pointer bg-purple-500 hover:bg-purple-600 active:bg-purple-700 focus:outline-none focus:ring focus:ring-purple-300"
        /* attributes="bg-purple-400" */
      />
    </div>
  );
};

export default CreatedProjects;
