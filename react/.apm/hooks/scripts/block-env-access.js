const fs = require('fs');

let input = '';

try {
  input = fs.readFileSync(0, 'utf8');
} catch {
  process.exit(0);
}

let payload;

try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

// Extract file paths to check based on tool type
const toolInput = payload.tool_input || {};
const pathsToCheck = [];

if (toolInput.file_path) {
  pathsToCheck.push(toolInput.file_path);
}

if (toolInput.path) {
  pathsToCheck.push(toolInput.path);
}

if (pathsToCheck.length === 0) {
  process.exit(0);
}

const allowedPatterns = [/\.env\.example$/i, /\.env\.template$/i];

const blockedPatterns = [
  /(^|\/)\.env$/i,

  /\.env\.[^/]+$/i,

  /\/secrets?\//i,

  /\/\.secrets\//i,

  /\.pem$/i,

  /\.key$/i,

  /\.p12$/i,

  /\.pfx$/i,

  /\.jks$/i,

  /\.keystore$/i,

  /\.crt$/i,

  /\.cer$/i,

  /\.der$/i,

  /\/\.ssh\//i,

  /\/\.aws\//i,

  /\/\.azure\//i,

  /\/\.gcp\//i,

  /\/\.config\/gcloud\//i,

  /\/id_rsa$/i,

  /\/id_dsa$/i,

  /\/id_ecdsa$/i,

  /\/id_ed25519$/i,
];

const isBlocked = pathsToCheck.some((p) => {
  const isAllowed = allowedPatterns.some((pattern) => pattern.test(p));
  if (isAllowed) return false;
  return blockedPatterns.some((pattern) => pattern.test(p));
});

if (isBlocked) {
  const blockedPath = pathsToCheck.find((p) => {
    const isAllowed = allowedPatterns.some((pattern) => pattern.test(p));
    if (isAllowed) return false;
    return blockedPatterns.some((pattern) => pattern.test(p));
  });

  const reason =
    'Access to runtime environment files, credentials, certificates, private keys, and secret material is prohibited. Only .env.example and .env.template may be accessed.';

  console.log(
    JSON.stringify({
      systemMessage: `[block-env-access] Blocked access to sensitive file: ${blockedPath}\n${reason}`,
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  );
}

process.exit(0);
