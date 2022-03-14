import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";

import CreateNewProject from "../../components/CreateNewProject";
import CreatedProjects from "../../components/CreatedProjects";

const CreatePage: NextPage = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  if (!publicKey) {
    return (
      <Layout title="Ennector">
        <div className="grid grid-cols-1 text-center gap-4 items-stretchh-full">
          {/* <div className="border-2 rounded p-4 "> */}
          {/*   <CreatedProjects /> */}
          {/* </div> */}
          <div className="border-2 rounded m-2 p-2">
            <p>plis connect wallet</p>
          </div>
        </div>
      </Layout>
    );
  } else {
    return (
      <Layout title="Ennector">
        <div className="grid grid-cols-1 text-center gap-4 items-stretchh-full">
          {/* <div className="border-2 rounded p-4 "> */}
          {/*   <CreatedProjects /> */}
          {/* </div> */}
          <div className="border-2 rounded m-2 p-2">
            <CreateNewProject />
          </div>
        </div>
      </Layout>
    );
  }
};

export default CreatePage;
