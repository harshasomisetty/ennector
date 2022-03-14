import * as React from "react";
import Layout from "../components/Layout";
import {NextPage} from "next";

import {useWallet, useConnection} from "@solana/wallet-adapter-react";

const IndexPage: NextPage = () => {
  const {connection} = useConnection();
  const {publicKey, sendTransaction} = useWallet();

  if (!publicKey) {
    return (
      <Layout title="Ennector">
        <h1 className="text-xl text-center">Ennector</h1>
        <p className="text-center">
          Connecting people and capital, creators to communities
        </p>
        <p>plis connect wallet</p>
      </Layout>
    );
  } else {
    return (
      <Layout title="Ennector">
        <h1 className="text-xl text-center">Ennector</h1>
        <p className="text-center">
          Connecting people and capital, creators to communities
        </p>
        <p>connected wallet gg</p>
      </Layout>
    );
  }
};

export default IndexPage;
