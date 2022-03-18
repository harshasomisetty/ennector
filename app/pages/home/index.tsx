import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import {useWallet} from "@solana/wallet-adapter-react";

const HomePage: NextPage = () => {
  const {publicKey} = useWallet();

  if (!publicKey) {
    return (
      <Layout title="Primal">
        <h1 className="text-center">Primal</h1>
        <h2 className="text-center">
          Connecting people and capital, creators to communities
        </h2>
        <p className="text-center">plis connect wallet</p>
      </Layout>
    );
  } else {
    return (
      <Layout title="Primal">
        <h1 className="text-center">Primal</h1>
        <h2 className="text-center">
          Connecting people and capital, creators to communities
        </h2>
        <p className="text-center">Wallet is Connection</p>
      </Layout>
    );
  }
};

export default HomePage;
