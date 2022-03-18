import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import {useWallet} from "@solana/wallet-adapter-react";

const HomePage: NextPage = () => {
  const {publicKey} = useWallet();

  if (!publicKey) {
    return (
      <Layout title="Primal">
        <h1 className="text-xl text-center">Primal</h1>
        <p className="text-center">
          Connecting people and capital, creators to communities
        </p>
        <p>plis connect wallet</p>
      </Layout>
    );
  } else {
    return (
      <Layout title="Primal">
        <h1 className="text-xl text-center">Primal</h1>
        <p className="text-center">
          Connecting people and capital, creators to communities
        </p>
        <p>connected wallet gg</p>
      </Layout>
    );
  }
};

export default HomePage;
