import { readFileSync } from 'node:fs';
import path from 'node:path';

let input = '';

try {
  input = readFileSync(0, 'utf8');
} catch {
  process.exit(0);
}

let payload;

try {
  payload = JSON.parse(input);
} catch {
  process.exit(0);
}

// Extract file paths to check based on tool type.
// VS Code passes tool inputs in camelCase (e.g. filePath), while Claude Code
// uses snake_case (e.g. file_path). Tool input shapes also vary by tool: some
// expose a single path, others a `files` array (of strings or objects). To stay
// compatible across agents and tools, recursively collect any string that looks
// like a file path from the tool input.
const toolInput = payload.tool_input || {};

const pathKeys = new Set([
  'filePath',
  'file_path',
  'path',
  'uri',
  'fsPath',
  'includePattern',
]);

const pathsToCheck = [];

const collectPaths = (value, keyHint) => {
  if (value == null) return;

  if (typeof value === 'string') {
    // Only consider strings that look like paths (contain a separator or a
    // file extension / dotfile), and only when surfaced via a path-like key.
    if (
      keyHint &&
      (value.includes('/') ||
        value.includes('\\') ||
        /\.[\w.]+$/.test(value) ||
        value.startsWith('.'))
    ) {
      pathsToCheck.push(path.normalize(value));
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPaths(item, keyHint));
    return;
  }

  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      collectPaths(v, pathKeys.has(k) ? k : undefined);
    }
  }
};

// `files` arrays may contain plain path strings; treat their items as paths.
if (Array.isArray(toolInput.files)) {
  toolInput.files.forEach((item) => collectPaths(item, 'filePath'));
}

collectPaths(toolInput);

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

  // Exit code 2 is the most restrictive block: VS Code stops the tool call and
  // surfaces stderr to the model. This guarantees the block even if the JSON
  // output is not honored.
  process.stderr.write(
    `[block-env-access] Blocked access to sensitive file: ${blockedPath}. ${reason}\n`,
  );
  process.exit(2);
}

process.exit(0);
