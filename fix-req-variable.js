const fs = require("fs");

function fixReqVariable(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace all instances of const _req with const req
  content = content.replace(/const _req = /g, "const req = ");

  fs.writeFileSync(filePath, content);
}

// Fix the resource.abstract.spec.ts file
const file = "src/app/infrastructure/http/resource.abstract.spec.ts";
console.log(`Fixing req variable references in ${file}...`);
fixReqVariable(file);
console.log("Done!");
