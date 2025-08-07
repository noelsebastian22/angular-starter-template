const fs = require("fs");

const commitMsgFile = process.argv[2];
const commitMsg = fs.readFileSync(commitMsgFile, "utf8").trim();

// Allowed commit types
const allowedTypes = [
  "feat",
  "fix",
  "chore",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "revert",
];

const typePattern = allowedTypes.join("|");

// Conventional Commit Regex:
// Line 1: type(optional-scope): description
// Lines 2+: optional body and footer (ignored by validation here)
const conventionalRegex = new RegExp(
  `^(${typePattern})(\\([a-z0-9-]+\\))?: .{1,100}(\\n{2}([\\s\\S]*))?$`,
  "i",
);

if (!conventionalRegex.test(commitMsg)) {
  console.error("\n❌ Invalid commit message format!\n");

  console.log("🧾 Your commit message:");
  console.log(`> ${commitMsg.split("\n")[0]}\n`);

  console.log("✅ Valid format:");
  console.log("  <type>[optional scope]: <short description>");
  console.log("  ");
  console.log("  [optional body]");
  console.log("  ");
  console.log("  [optional footer(s)]\n");

  console.log("💡 Examples:");
  console.log("  feat(auth): add login form");
  console.log("  fix(core): handle undefined user");
  console.log("  ");
  console.log("  This commit fixes a bug that caused login to fail");
  console.log("  ");
  console.log("  BREAKING CHANGE: refactored auth module");

  console.log("\n📌 Allowed types:", allowedTypes.join(", "));
  process.exit(1);
}
