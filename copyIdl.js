const fs = require('fs');
const idl = require('./target/idl/ennector.json');

fs.writeFileSync('./app/idl.json', JSON.stringify(idl));
