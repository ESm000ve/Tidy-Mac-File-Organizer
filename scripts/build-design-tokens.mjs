import fs from 'node:fs';
const snapshot = JSON.parse(fs.readFileSync(new URL('../design-system/figma-tokens.json', import.meta.url), 'utf8'));
const byId = Object.fromEntries(snapshot.variables.map(v => [v.id, v]));
const cssName = name => '--tidy-' + name.replaceAll('/', '-').replaceAll('_', '-');
function resolve(value, mode, stack = []) {
  if (value?.type === 'VARIABLE_ALIAS') {
    if (stack.includes(value.id)) throw Error('Circular token alias');
    const variable = byId[value.id];
    if (!variable) throw Error('Missing alias: ' + value.id);
    return resolve(variable.values[mode] ?? Object.values(variable.values)[0], mode, [...stack, value.id]);
  }
  if (typeof value === 'object') return '#' + ['r','g','b'].map(k => Math.round(value[k] * 255).toString(16).padStart(2,'0')).join('');
  return value;
}
const tokens = {};
const blocks = [];
for (const collection of snapshot.collections) {
  for (const mode of collection.modes) {
    const vars = snapshot.variables.filter(v => v.collection === collection.id);
    const values = Object.fromEntries(vars.map(v => [v.name, resolve(v.values[mode.modeId], mode.modeId)]));
    tokens[collection.name.replace('Tidy · ', '').toLowerCase() + '/' + mode.name.toLowerCase()] = values;
    const selector = mode.name === 'Dark' ? '.dark' : mode.name === 'Reduced' ? '[data-motion="reduced"]' : ':root';
    const lines = vars.map(v => {
      const raw = v.values[mode.modeId];
      const value = raw?.type === 'VARIABLE_ALIAS' ? 'var(' + cssName(byId[raw.id].name) + ')' : values[v.name];
      const unit = v.type === 'FLOAT' ? (v.name.startsWith('duration/') ? 'ms' : 'px') : '';
      return '  ' + cssName(v.name) + ': ' + value + unit + ';';
    });
    blocks.push(selector + ' {\n' + lines.join('\n') + '\n}');
  }
}
blocks.push('@media (prefers-reduced-motion: reduce) { :root { --tidy-duration-feedback: 0ms; --tidy-duration-control: 0ms; --tidy-duration-panel: 0ms; } }');
fs.writeFileSync(new URL('../design-system/tokens.css', import.meta.url), '/* Generated from figma-tokens.json. Run npm run tokens:build. */\n' + blocks.join('\n\n') + '\n');
fs.writeFileSync(new URL('../design-system/tokens.ts', import.meta.url), '// Generated from the Figma snapshot. Do not edit manually.\nexport const tokens = ' + JSON.stringify(tokens, null, 2) + ' as const;\nexport type TokenCollection = keyof typeof tokens;\n');
console.log('Generated ' + snapshot.variables.length + ' Figma tokens.');
