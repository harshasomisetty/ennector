import * as React from "react";
import Layout from "../../components/Layout";
import {NextPage} from "next";
import CreateNewProject from "../../components/CreateNewProject";
import CreatedProjects from "../../components/CreatedProjects";

const CreatePage: NextPage = () => {
  return (
    <Layout title="Ennector">
      <div className="grid grid-cols-2 text-center gap-4 items-stretchh-full">
        <div className="border-2 rounded p-4 ">
          <CreatedProjects />
        </div>
        <div className="border-2 rounded">
          <CreateNewProject />
        </div>
      </div>
    </Layout>
  );
};

export default CreatePage;
