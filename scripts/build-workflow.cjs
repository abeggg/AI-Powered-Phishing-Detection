const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'workflow/phishing_detection_n8n.json');
const workflow = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const node of workflow.nodes) {
  const source = {
    'Normalize CSV': 'normalize-csv.js', 'Analyze URLs': 'analyze-urls.js',
    'Validate LLM Response': 'validate-response.js', 'Normalize Results': 'normalize-results.js'
  }[node.name];
  if (source) node.parameters.jsCode = fs.readFileSync(path.join(root, 'workflow/code', source), 'utf8').replace(/\r\n/g, '\n');
}
const generated = JSON.stringify(workflow, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (generated !== fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')) throw new Error('Workflow code differs from the editable source files.');
  console.log('Embedded workflow code matches all four source files.');
} else { fs.writeFileSync(file, generated); console.log('Workflow source synchronized.'); }
