const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Run application TypeScript with the project's compiler, replacing only
// external boundaries such as database access in tests.
function load(source, replacements = {}, cache = new Map()) {
  if (Object.hasOwn(replacements, source)) return replacements[source];
  const filename = path.resolve(__dirname, '../..', source.replace(/^@\//, 'src/') + '.ts');
  if (cache.has(filename)) return cache.get(filename).exports;
  const mod = new Module(filename, module);
  cache.set(filename, mod);
  mod.filename = filename;
  mod.paths = module.paths;
  mod.require = (id) => {
    if (Object.hasOwn(replacements, id)) return replacements[id];
    if (id.startsWith('@/')) return load(id, replacements, cache);
    if (id.startsWith('.')) {
      const relative = path.relative(path.resolve(__dirname, '../..'), path.resolve(path.dirname(filename), id));
      return load(relative, replacements, cache);
    }
    return require(id);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  }).outputText, filename);
  return mod.exports;
}

module.exports = { load };
