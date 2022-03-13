import * as React from "react";
import Layout from "../components/Layout";
import {NextPage} from "next";

import {useWallet} from "@solana/wallet-adapter-react";

const IndexPage: NextPage = () => {
  // const {publicKey, sendTransaction} = useWallet();

  return (
    <Layout title="Ennector">
      <h1 className="text-xl text-center">Ennector</h1>
      <p className="text-center">
        Connecting people and capital, creators to communities
      </p>
    </Layout>
  );
};

export default IndexPage;
