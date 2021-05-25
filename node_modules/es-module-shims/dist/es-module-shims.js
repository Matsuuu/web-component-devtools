/* ES Module Shims 0.4.5 */
(function () {
  'use strict';

  const resolvedPromise = Promise.resolve();

  let baseUrl;

  function createBlob (source) {
    return URL.createObjectURL(new Blob([source], { type: 'application/javascript' }));
  }

  const hasDocument = typeof document !== 'undefined';

  // support browsers without dynamic import support (eg Firefox 6x)
  let dynamicImport;
  try {
    dynamicImport = (0, eval)('u=>import(u)');
  }
  catch (e) {
    if (hasDocument) {
      self.addEventListener('error', e => importShim.e = e.error);
      dynamicImport = blobUrl => {
        const topLevelBlobUrl = createBlob(
          `import*as m from'${blobUrl}';self.importShim.l=m;self.importShim.e=null`
        );
        const s = document.createElement('script');
        s.type = 'module';
        s.src = topLevelBlobUrl;
        document.head.appendChild(s);
        return new Promise((resolve, reject) => {
          s.addEventListener('load', () => {
            document.head.removeChild(s);
            importShim.e ? reject(importShim.e) : resolve(importShim.l, baseUrl);
          });
        });
      };
    }
  }

  if (hasDocument) {
    const baseEl = document.querySelector('base[href]');
    if (baseEl)
      baseUrl = baseEl.href;
  }

  if (!baseUrl && typeof location !== 'undefined') {
    baseUrl = location.href.split('#')[0].split('?')[0];
    const lastSepIndex = baseUrl.lastIndexOf('/');
    if (lastSepIndex !== -1)
      baseUrl = baseUrl.slice(0, lastSepIndex + 1);
  }

  let esModuleShimsSrc;
  if (hasDocument) {
    esModuleShimsSrc = document.currentScript && document.currentScript.src;
  }

  const backslashRegEx = /\\/g;
  function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
    // strip off any trailing query params or hashes
    parentUrl = parentUrl && parentUrl.split('#')[0].split('?')[0];
    if (relUrl.indexOf('\\') !== -1)
      relUrl = relUrl.replace(backslashRegEx, '/');
    // protocol-relative
    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
    }
    // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
        relUrl.length === 1  && (relUrl += '/')) ||
        relUrl[0] === '/') {
      const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
      // Disabled, but these cases will give inconsistent results for deep backtracking
      //if (parentUrl[parentProtocol.length] !== '/')
      //  throw new Error('Cannot resolve');
      // read pathname from parent URL
      // pathname taken to be part after leading "/"
      let pathname;
      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.slice(parentProtocol.length + 2);
          pathname = pathname.slice(pathname.indexOf('/') + 1);
        }
        else {
          pathname = parentUrl.slice(8);
        }
      }
      else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
      }

      if (relUrl[0] === '/')
        return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;

      // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'
      const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

      const output = [];
      let segmentIndex = -1;
      for (let i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.slice(segmentIndex, i + 1));
            segmentIndex = -1;
          }
        }

        // new segment - check if it is relative
        else if (segmented[i] === '.') {
          // ../ segment
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
            output.pop();
            i += 2;
          }
          // ./ segment
          else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
            i += 1;
          }
          else {
            // the start of a new segment as below
            segmentIndex = i;
          }
        }
        // it is the start of a new segment
        else {
          segmentIndex = i;
        }
      }
      // finish reading out the last segment
      if (segmentIndex !== -1)
        output.push(segmented.slice(segmentIndex));
      return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
    }
  }

  /*
   * Import maps implementation
   *
   * To make lookups fast we pre-resolve the entire import map
   * and then match based on backtracked hash lookups
   *
   */
  const emptyImportMap = { imports: {}, scopes: {} };

  function resolveUrl (relUrl, parentUrl) {
    return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (relUrl.indexOf(':') !== -1 ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
  }

  async function hasStdModule (name) {
    try {
      await dynamicImport(name);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  async function resolveAndComposePackages (packages, outPackages, baseUrl, parentMap, parentUrl) {
    outer: for (let p in packages) {
      const resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
      let target = packages[p];
      if (typeof target === 'string')
        target = [target];
      else if (!Array.isArray(target))
        continue;

      for (const rhs of target) {
        if (typeof rhs !== 'string')
          continue;
        const mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(rhs, baseUrl) || rhs, parentUrl);
        if (mapped && (!mapped.startsWith('std:') || await hasStdModule(mapped))) {
          outPackages[resolvedLhs] = mapped;
          continue outer;
        }
      }
      targetWarning(p, packages[p], 'bare specifier did not resolve');
    }
  }

  async function resolveAndComposeImportMap (json, baseUrl, parentMap) {
    const outMap = { imports: Object.assign({}, parentMap.imports), scopes: Object.assign({}, parentMap.scopes) };

    if (json.imports)
      await resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap, null);

    if (json.scopes)
      for (let s in json.scopes) {
        const resolvedScope = resolveUrl(s, baseUrl);
        await resolveAndComposePackages(json.scopes[s], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, parentMap, resolvedScope);
      }

    return outMap;
  }

  function getMatch (path, matchObj) {
    if (matchObj[path])
      return path;
    let sepIndex = path.length;
    do {
      const segment = path.slice(0, sepIndex + 1);
      if (segment in matchObj)
        return segment;
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1)
  }

  function applyPackages (id, packages) {
    const pkgName = getMatch(id, packages);
    if (pkgName) {
      const pkg = packages[pkgName];
      if (pkg === null) return;
      if (id.length > pkgName.length && pkg[pkg.length - 1] !== '/')
        targetWarning(pkgName, pkg, "should have a trailing '/'");
      else
        return pkg + id.slice(pkgName.length);
    }
  }

  function targetWarning (match, target, msg) {
    console.warn("Package target " + msg + ", resolving target '" + target + "' for " + match);
  }

  function resolveImportMap (importMap, resolvedOrPlain, parentUrl) {
    let scopeUrl = parentUrl && getMatch(parentUrl, importMap.scopes);
    while (scopeUrl) {
      const packageResolution = applyPackages(resolvedOrPlain, importMap.scopes[scopeUrl]);
      if (packageResolution)
        return packageResolution;
      scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), importMap.scopes);
    }
    return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(':') !== -1 && resolvedOrPlain;
  }

  /* es-module-lexer 0.3.24 */
  function parse(Q,B="@"){if(!A)return init.then(()=>parse(Q));const C=(A.__heap_base.value||A.__heap_base)+4*Q.length-A.memory.buffer.byteLength;if(C>0&&A.memory.grow(Math.ceil(C/65536)),function(A,Q){const B=A.length;let C=0;for(;C<B;)Q[C]=A.charCodeAt(C++);}(Q,new Uint16Array(A.memory.buffer,A.sa(Q.length),Q.length+1)),!A.parse())throw Object.assign(new Error(`Parse error ${B}:${Q.slice(0,A.e()).split("\n").length}:${A.e()-Q.lastIndexOf("\n",A.e()-1)}`),{idx:A.e()});const g=[],E=[];for(;A.ri();)g.push({s:A.is(),e:A.ie(),ss:A.ss(),se:A.se(),d:A.id()});for(;A.re();)E.push(Q.slice(A.es(),A.ee()));return [g,E,!!A.f()]}let A;const init=WebAssembly.compile((Q="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","function"==typeof atob?Uint8Array.from(atob(Q),A=>A.charCodeAt(0)):Buffer.from(Q,"base64"))).then(WebAssembly.instantiate).then(({exports:Q})=>{A=Q;});var Q;

  class WorkerShim {
    constructor(aURL, options = {}) {
      if (options.type !== 'module')
        return new Worker(aURL, options);

      if (!esModuleShimsSrc)
        throw new Error('es-module-shims.js must be loaded with a script tag for WorkerShim support.');

      options.importMap = options.importMap || emptyImportMap;

      const workerScriptUrl = createBlob(
        `importScripts('${esModuleShimsSrc}');importShim.map=${JSON.stringify(options.importMap)};importShim('${new URL(aURL, baseUrl).href}').catch(e=>setTimeout(()=>{throw e}))`
      );

      return new Worker(workerScriptUrl, Object.assign({}, options, { type: undefined }));
    }
  }

  let id = 0;
  const registry = {};

  async function loadAll (load, seen) {
    if (load.b || seen[load.u])
      return;
    seen[load.u] = 1;
    await load.L;
    return Promise.all(load.d.map(dep => loadAll(dep, seen)));
  }

  async function topLevelLoad (url, source) {
    await init;
    const load = getOrCreateLoad(url, source);
    const seen = {};
    await loadAll(load, seen);
    lastLoad = undefined;
    resolveDeps(load, seen);
    const module = await dynamicImport(load.b);
    // if the top-level load is a shell, run its update function
    if (load.s)
      (await dynamicImport(load.s)).u$_(module);
    return module;
  }

  async function importShim$1 (id, parentUrl) {
    return topLevelLoad(await resolve(id, parentUrl || baseUrl));
  }

  self.importShim = importShim$1;

  const meta = {};
  const wasmModules = {};

  const edge = navigator.userAgent.match(/Edge\/\d\d\.\d+$/);

  Object.defineProperties(importShim$1, {
    map: { value: emptyImportMap, writable: true },
    m: { value: meta },
    w: { value: wasmModules },
    l: { value: undefined, writable: true },
    e: { value: undefined, writable: true }
  });
  importShim$1.fetch = url => fetch(url);
  importShim$1.skip = /^https?:\/\/(cdn\.pika\.dev|dev\.jspm\.io|jspm\.dev)\//;

  let lastLoad;
  function resolveDeps (load, seen) {
    if (load.b || !seen[load.u])
      return;
    seen[load.u] = 0;

    for (const dep of load.d)
      resolveDeps(dep, seen);

    // "execution"
    const source = load.S;
    // edge doesnt execute sibling in order, so we fix this up by ensuring all previous executions are explicit dependencies
    let resolvedSource = edge && lastLoad ? `import '${lastLoad}';` : '';

    const [imports] = load.a;

    if (!imports.length) {
      resolvedSource += source;
    }
    else {
      // once all deps have loaded we can inline the dependency resolution blobs
      // and define this blob
      let lastIndex = 0, depIndex = 0;
      for (const { s: start, e: end, d: dynamicImportIndex } of imports) {
        // dependency source replacements
        if (dynamicImportIndex === -1) {
          const depLoad = load.d[depIndex++];
          let blobUrl = depLoad.b;
          if (!blobUrl) {
            // circular shell creation
            if (!(blobUrl = depLoad.s)) {
              blobUrl = depLoad.s = createBlob(`export function u$_(m){${
                depLoad.a[1].map(
                  name => name === 'default' ? `$_default=m.default` : `${name}=m.${name}`
                ).join(',')
              }}${
                depLoad.a[1].map(name =>
                  name === 'default' ? `let $_default;export{$_default as default}` : `export let ${name}`
                ).join(';')
              }\n//# sourceURL=${depLoad.r}?cycle`);
            }
          }
          // circular shell execution
          else if (depLoad.s) {
            resolvedSource += source.slice(lastIndex, start - 1) + '/*' + source.slice(start - 1, end + 1) + '*/' + source.slice(start - 1, start) + blobUrl + source[end] + `;import*as m$_${depIndex} from'${depLoad.b}';import{u$_ as u$_${depIndex}}from'${depLoad.s}';u$_${depIndex}(m$_${depIndex})`;
            lastIndex = end + 1;
            depLoad.s = undefined;
            continue;
          }
          resolvedSource += source.slice(lastIndex, start - 1) + '/*' + source.slice(start - 1, end + 1) + '*/' + source.slice(start - 1, start) + blobUrl;
          lastIndex = end;
        }
        // import.meta
        else if (dynamicImportIndex === -2) {
          meta[load.r] = { url: load.r };
          resolvedSource += source.slice(lastIndex, start) + 'importShim.m[' + JSON.stringify(load.r) + ']';
          lastIndex = end;
        }
        // dynamic import
        else {
          resolvedSource += source.slice(lastIndex, dynamicImportIndex + 6) + 'Shim(' + source.slice(start, end) + ', ' + JSON.stringify(load.r);
          lastIndex = end;
        }
      }

      resolvedSource += source.slice(lastIndex);
    }

    let sourceMappingResolved = '';
    const sourceMappingIndex = resolvedSource.lastIndexOf('//# sourceMappingURL=');
    if (sourceMappingIndex > -1) {
      const sourceMappingEnd = resolvedSource.indexOf('\n',sourceMappingIndex);
      const sourceMapping = resolvedSource.slice(sourceMappingIndex, sourceMappingEnd > -1 ? sourceMappingEnd : undefined);
      sourceMappingResolved = `\n//# sourceMappingURL=` + resolveUrl(sourceMapping.slice(21), load.r);
    }
    load.b = lastLoad = createBlob(resolvedSource + sourceMappingResolved + '\n//# sourceURL=' + load.r);
    load.S = undefined;
  }

  function getOrCreateLoad (url, source) {
    let load = registry[url];
    if (load)
      return load;

    load = registry[url] = {
      // url
      u: url,
      // response url
      r: undefined,
      // fetchPromise
      f: undefined,
      // source
      S: undefined,
      // linkPromise
      L: undefined,
      // analysis
      a: undefined,
      // deps
      d: undefined,
      // blobUrl
      b: undefined,
      // shellUrl
      s: undefined,
    };

    if (url.startsWith('std:'))
      return Object.assign(load, {
        r: url,
        f: resolvedPromise,
        L: resolvedPromise,
        b: url
      });

    load.f = (async () => {
      if (!source) {
        const res = await importShim$1.fetch(url);
        if (!res.ok)
          throw new Error(`${res.status} ${res.statusText} ${res.url}`);

        load.r = res.url;

        const contentType = res.headers.get('content-type');
        if (contentType.match(/^(text|application)\/(x-)?javascript(;|$)/)) {
          source = await res.text();
        }
        else if (contentType.match(/^application\/json(;|$)/)) {
          source = `export default JSON.parse(${JSON.stringify(await res.text())})`;
        }
        else if (contentType.match(/^text\/css(;|$)/)) {
          source = `const s=new CSSStyleSheet();s.replaceSync(${JSON.stringify(await res.text())});export default s`;
        }
        else if (contentType.match(/^application\/wasm(;|$)/)) {
          const module = wasmModules[url] = await WebAssembly.compile(await res.arrayBuffer());
          let deps = WebAssembly.Module.imports ? WebAssembly.Module.imports(module).map(impt => impt.module) : [];

          const aDeps = [];
          load.a = [aDeps, WebAssembly.Module.exports(module).map(expt => expt.name)];

          const depStrs = deps.map(dep => JSON.stringify(dep));

          let curIndex = 0;
          load.S = depStrs.map((depStr, idx) => {
              const index = idx.toString();
              const strStart = curIndex + 17 + index.length;
              const strEnd = strStart + depStr.length - 2;
              aDeps.push({
                s: strStart,
                e: strEnd,
                d: -1
              });
              curIndex += strEnd + 3;
              return `import*as m${index} from${depStr};`
            }).join('') +
            `const module=importShim.w[${JSON.stringify(url)}],exports=new WebAssembly.Instance(module,{` +
            depStrs.map((depStr, idx) => `${depStr}:m${idx},`).join('') +
            `}).exports;` +
            load.a[1].map(name => name === 'default' ? `export default exports.${name}` : `export const ${name}=exports.${name}`).join(';');
          return deps;
        }
        else {
          throw new Error(`Unknown Content-Type "${contentType}"`);
        }
      }
      try {
        load.a = parse(source, load.u);
      }
      catch (e) {
        console.warn(e);
        load.a = [[], []];
      }
      load.S = source;
      return load.a[0].filter(d => d.d === -1).map(d => source.slice(d.s, d.e));
    })();

    load.L = load.f.then(async deps => {
      load.d = await Promise.all(deps.map(async depId => {
        const resolved = await resolve(depId, load.r || load.u);
        if (importShim$1.skip.test(resolved))
          return { b: resolved };
        const depLoad = getOrCreateLoad(resolved);
        await depLoad.f;
        return depLoad;
      }));
    });

    return load;
  }

  let importMapPromise;

  if (hasDocument) {
    // preload import maps
    for (const script of document.querySelectorAll('script[type="importmap-shim"][src]'))
      script._f = fetch(script.src);
    // load any module scripts
    for (const script of document.querySelectorAll('script[type="module-shim"]'))
      topLevelLoad(script.src || `${baseUrl}?${id++}`, script.src ? null : script.innerHTML);
  }

  async function resolve (id, parentUrl) {
    if (!importMapPromise) {
      importMapPromise = resolvedPromise;
      if (hasDocument)
        for (const script of document.querySelectorAll('script[type="importmap-shim"]')) {
          importMapPromise = importMapPromise.then(async () => {
            importShim$1.map = await resolveAndComposeImportMap(script.src ? await (await (script._f || fetch(script.src))).json() : JSON.parse(script.innerHTML), script.src || baseUrl, importShim$1.map);
          });
        }
    }
    await importMapPromise;
    return resolveImportMap(importShim$1.map, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
  }

  function throwUnresolved (id, parentUrl) {
    throw Error("Unable to resolve specifier '" + id + (parentUrl ? "' from " + parentUrl : "'"));
  }

  self.WorkerShim = WorkerShim;

}());
