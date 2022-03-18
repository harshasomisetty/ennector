import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import {useWallet} from "@solana/wallet-adapter-react";
import InvestedProjects from "../../components/InvestedProjects";

const InvestPage: NextPage = () => {
  const {publicKey} = useWallet();
  return (
    <Layout title="Primal">
      <div className="text-center gap-4 items-stretchh-full">
        <div className="p-4 ">
          {publicKey ? (
            <InvestedProjects />
          ) : (
            <p>Please connect Wallet to see invested projects</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InvestPage;
