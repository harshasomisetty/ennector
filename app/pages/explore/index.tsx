import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import {useWallet, useConnection} from "@solana/wallet-adapter-react";

import ExploreProjects from "../../components/ExploreProjects";

const ExplorePage: NextPage = () => {
  return (
    <Layout title="Ennector">
      <div className="grid grid-cols-1 text-center gap-4 items-stretchh-full">
        <div className="border-2 rounded p-4 ">
          <ExploreProjects />
        </div>
      </div>
    </Layout>
  );
};

export default ExplorePage;
