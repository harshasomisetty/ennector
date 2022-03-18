const fs = require("fs");
const idl = require("./target/idl/primal.json");

fs.writeFileSync("./app/idl.json", JSON.stringify(idl));
