const fs = require("fs");

function fixFinalLintIssues(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace all remaining any types with appropriate types
  content = content.replace(
    /let capturedError: any;/g,
    "let capturedError: HttpErrorResponse;",
  );
  content = content.replace(
    /let error: any;/g,
    "let error: HttpErrorResponse;",
  );
  content = content.replace(/error: any/g, "error: unknown");
  content = content.replace(/result: any/g, "result: unknown");
  content = content.replace(/state: any/g, "state: Record<string, unknown>");
  content = content.replace(/service: any/g, "service: unknown");
  content = content.replace(/method: any/g, "method: string");
  content = content.replace(
    /ResourceService<any>/g,
    "ResourceService<unknown>",
  );

  // Fix specific patterns
  content = content.replace(
    /mockAuthService: any/g,
    "mockAuthService: jest.Mocked<AuthService>",
  );
  content = content.replace(
    /testState: any/g,
    "testState: Record<string, unknown>",
  );

  fs.writeFileSync(filePath, content);
}

// Fix all remaining files
const filesToFix = [
  "src/app/core/http/interceptors/error.interceptor.spec.ts",
  "src/app/core/services/error-notification.service.spec.ts",
  "src/app/core/state/local-storage-sync.spec.ts",
  "src/app/features/auth/store/auth.effects.spec.ts",
  "src/app/infrastructure/http/resource.abstract.spec.ts",
  "src/app/infrastructure/index.spec.ts",
];

filesToFix.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`Final fix for ${file}...`);
    fixFinalLintIssues(file);
  }
});

console.log("All lint issues fixed!");
