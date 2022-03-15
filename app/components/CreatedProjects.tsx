import {useState, useEffect} from "react";
import LinkButton from "./LinkButton";
import ProjectList from "./ProjectList";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";

const CreatedProjects = () => {
  const [projects, setProjects] = useState();
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  useEffect(() => {
    async function fetchData() {
      let response = await fetch("api/findProjects/" + publicKey);
      let data = await response.json();
      setProjects(data);
    }
    fetchData();
  }, []);

  return (
    <div>
      {projects.length > 0 ? (
        <div>
          <p>Your created Projects</p>
          <ProjectList projects={projects} />
        </div>
      ) : (
        <div>
          <p>You haven't created any projects yet!</p>
        </div>
      )}

      <LinkButton
        name="Create New Project"
        link="/create/NewProject"
        attributes="rounded-lg px-4 py-3 cursor-pointer bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring focus:ring-purple-300"
        /* attributes="bg-purple-400" */
      />
    </div>
  );
};

export default CreatedProjects;
