import {useRouter} from "next/router";

const ClearData = () => {
  const router = useRouter();
  async function clearDataApi() {
    let response = await fetch("api/clearData");
    let data = await response.json();

    router.reload();
  }

  return (
    <button className="border p-2 rounded" onClick={clearDataApi}>
      Clear Data
    </button>
  );
};

export default ClearData;
