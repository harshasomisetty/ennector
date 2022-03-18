import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import {useWallet} from "@solana/wallet-adapter-react";

import CreateNewProject from "../../components/CreateNewProject";
import CreatedProjects from "../../components/CreatedProjects";

const CreatePage: NextPage = () => {
  const {publicKey} = useWallet();

  return (
    <Layout title="Primal">
      <div className="grid grid-cols-1 text-center gap-4 items-stretchh-full">
        <div className="m-2 p-2">
          {publicKey ? (
            <CreatedProjects />
          ) : (
            <p>Please connect wallet to see your created projects</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CreatePage;
