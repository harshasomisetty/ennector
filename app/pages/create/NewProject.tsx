import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import {useWallet} from "@solana/wallet-adapter-react";
import CreateNewProject from "../../components/CreateNewProject";

const NewProject: NextPage = () => {
  const {publicKey} = useWallet();

  return (
    <Layout title="Ennector">
      <div className="grid grid-cols-1 text-center gap-4 items-stretchh-full">
        <div className="border-2 rounded m-2 p-2">
          {publicKey ? <CreateNewProject /> : <p>plis connect wallet</p>}
        </div>
      </div>
    </Layout>
  );
};

export default NewProject;
