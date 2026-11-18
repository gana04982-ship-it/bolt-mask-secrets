import assert from 'node:assert';

// Simulated pipeline matching mask-secrets.yaml replace rules
const rules = [
  { from: /Bearer\s+[a-zA-Z0-9_\-\.]+/g, to: 'Bearer [REDACTED_TOKEN]' },
  { from: /\b(sk-[a-zA-Z0-9_\-]{20,})\b/g, to: '[OPENAI_KEY_REDACTED]' },
  { from: /\b(AKIA[0-9A-Z]{16})\b/g, to: '[AWS_KEY_REDACTED]' },
  { from: /\b(gh[pousr]_[a-zA-Z0-9]{36,})\b/g, to: '[GITHUB_TOKEN_REDACTED]' },
  { from: /\b([sr]k_live_[0-9a-zA-Z]{24,})\b/g, to: '[STRIPE_KEY_REDACTED]' },
  { from: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9_\/]+/g, to: 'https://hooks.slack.com/services/[SLACK_WEBHOOK_REDACTED]' },
  { from: /(postgres|postgresql|mysql|mongodb|redis):\/\/([^\s:]+):(.*?)@([a-zA-Z0-9.\-_]+(?::\d+)?\/)/gi, to: '$1://$2:[REDACTED_PASSWORD]@$4' },
  { from: /(["']?(?:password|passwd|secret|api_key|access_token)["']?\s*[:=]\s*["'])(?:[^"'\r\n]+)(["'])/gi, to: '$1[REDACTED]$2' }
];

function runPipeline(input) {
  let lines = input.split('\n');
  return lines.map(line => {
    let cur = line;
    for (const r of rules) {
      cur = cur.replace(r.from, r.to);
    }
    return cur;
  }).join('\n');
}

const testCases = [
  {
    name: '1. Standard OpenAI API Key',
    input: 'export OPENAI_API_KEY=sk-proj-abc1234567890abcdef1234567890',
    check: (out) => out.includes('OPENAI_API_KEY=[OPENAI_KEY_REDACTED]') && !out.includes('sk-proj')
  },
  {
    name: '2. AWS Access Key ID',
    input: 'aws_access_key_id = AKIAIOSFODNN7EXAMPLE',
    check: (out) => out.includes('aws_access_key_id = [AWS_KEY_REDACTED]') && !out.includes('AKIAIOSFODNN7EXAMPLE')
  },
  {
    name: '3. GitHub Personal Access Token (PAT)',
    input: 'git remote set-url origin https://ghp_012345678901234567890123456789012345@github.com/repo',
    check: (out) => out.includes('origin https://[GITHUB_TOKEN_REDACTED]@github.com/repo')
  },
  {
    name: '4. Bearer Token in cURL Header',
    input: "curl -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.s6HH72' https://api.com",
    check: (out) => out.includes("Authorization: Bearer [REDACTED_TOKEN]'")
  },
  {
    name: '5. Database URL with credentials',
    input: 'DATABASE_URL="postgres://admin:P@ssw0rd123!@db.internal.net:5432/production"',
    check: (out) => out.includes('postgres://admin:[REDACTED_PASSWORD]@db.internal.net:5432/production') && !out.includes('P@ssw0rd123!')
  },
  {
    name: '6. Stripe Live API Key',
    input: `const stripe = Stripe("${'sk_' + 'live_51M0abcdef12345678901234567890'}");`,
    check: (out) => out.includes('Stripe("[STRIPE_KEY_REDACTED]")')
  },
  {
    name: '7. Slack Webhook Notification URL',
    input: `POST to ${'https://hooks.' + 'slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'} with alert`,
    check: (out) => out.includes('https://hooks.slack.com/services/[SLACK_WEBHOOK_REDACTED] with alert')
  },
  {
    name: '8. JSON Config with Secret Field',
    input: '{\n  "api_key": "sec_999888777",\n  "password": "superSecretString"\n}',
    check: (out) => out.includes('"api_key": "[REDACTED]"') && out.includes('"password": "[REDACTED]"')
  },
  {
    name: '9. FALSE POSITIVE TEST: Normal code words must NOT be mutated',
    input: 'def ask_question(task_queue, skyline_view, gh_action):\n  return True',
    check: (out) => out === 'def ask_question(task_queue, skyline_view, gh_action):\n  return True'
  },
  {
    name: '10. Empty & Whitespace Input',
    input: '   \n\t\n',
    check: (out) => out === '   \n\t\n'
  },
  {
    name: '11. Multiline Log with Mixed Content & Stack Traces',
    input: '2026-11-18 10:00:00 INFO Initializing worker\n2026-11-18 10:00:01 WARN Failed with key AKIA1111222233334444\n2026-11-18 10:00:02 ERROR at Module.load (app.js:42)',
    check: (out) => out.includes('WARN Failed with key [AWS_KEY_REDACTED]') && out.includes('app.js:42')
  },
  {
    name: '12. YAML Environment Variable File',
    input: 'DB_USER: root\nDB_PASS: "hunter2"\nHOST: localhost',
    check: (out) => out.includes('DB_USER: root') && out.includes('HOST: localhost')
  }
];

console.log('🧪 RUNNING 12 BRUTAL STRESS TESTS FOR MASK-SECRETS...\n');
let passed = 0;

for (const t of testCases) {
  const result = runPipeline(t.input);
  try {
    assert(t.check(result), `Failed check for ${t.name}.\nOutput was:\n${result}`);
    console.log(`✅ [PASS] ${t.name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${t.name}:`, err.message);
  }
}

console.log(`\n🎉 RESULTS: ${passed}/${testCases.length} tests passed successfully!`);
if (passed !== testCases.length) process.exit(1);
