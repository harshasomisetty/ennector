import {useRouter} from "next/router";

const ClearData = () => {
  async function clearDataApi() {
    let response = await fetch("api/clearData");
    let data = await response.json();
    router.reload();
  }

  return (
    <button className="border p-2 m-2 rounded" onClick={clearDataApi}>
      Clear Mongo
    </button>
  );
};

export default ClearData;
