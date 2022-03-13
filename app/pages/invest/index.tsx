import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import InvestNewProject from "../../components/InvestNewProject";
import InvestedProjects from "../../components/InvestedProjects";

const InvestPage: NextPage = () => {
  return (
    <Layout title="Ennector">
      <div className="grid grid-cols-2 text-center gap-4 items-stretchh-full">
        <div className="border-2 rounded p-4 ">
          <InvestedProjects />
        </div>
        <div className="border-2 rounded">
          <InvestNewProject />
        </div>
      </div>
    </Layout>
  );
};

export default InvestPage;
