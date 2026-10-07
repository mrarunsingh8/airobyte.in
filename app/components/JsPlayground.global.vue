<script setup lang="ts">
/**
 * Runnable code group for JavaScript / TypeScript.
 *
 * In markdown (TWO colons). One fenced block per tab; the fence language decides JS or TS:
 *   ::js-playground
 *   ```js
 *   console.log('Hello')
 *   ```
 *   ```ts
 *   const msg: string = 'Hello'
 *   console.log(msg)
 *   ```
 *   ::
 * A filename in the fence (```js [app.js]) becomes the tab label.
 *
 * Multi-file projects (ES modules): when any block uses `import` / `export`, the blocks become
 * files in one project, shown as a file tree. Running starts the entry file (app.js, main.js,
 * index.js, or the last block; override with ::js-playground{entry="start.js"}).
 * Relative imports work across files and folders (```js [utils/price.js]):
 *   ::js-playground
 *   ```js [kitchen.js]
 *   export const cook = dish => `${dish} is ready`
 *   ```
 *   ```js [app.js]
 *   import { cook } from './kitchen.js'
 *   console.log(cook('Rajma Chawal'))
 *   ```
 *   ::
 *
 * In Vue: <JsPlayground />  |  <JsPlayground :languages="['js', 'ts']" />  |  <JsPlayground full /> (playground page)
 *
 * Code runs in a Web Worker (off the main thread, can be stopped, no access to the page).
 * Top-level `await` works. Single blocks run as classic scripts (as before); blocks that use
 * import/export run as real ES modules in a module worker.
 * TypeScript is stripped to JS in the browser with Sucrase (loaded on first TS run).
 */
import type { VNode } from 'vue'

type Lang = 'js' | 'ts'
type Level = 'log' | 'info' | 'warn' | 'error' | 'debug' | 'table' | 'system'
interface Line { id: number, level: Level, text: string }
interface Tab { id: string, lang: Lang, label: string, initial: string, path: string }

const props = withDefaults(defineProps<{
  code?: string
  /** Languages offered when no code blocks are given. Default: JavaScript only. */
  languages?: Lang[]
  /** Tab selected first */
  lang?: Lang
  /** Full page mode: examples, share link, remembers code, side-by-side console */
  full?: boolean
  /** Editor height class in full mode */
  heightClass?: string
  /** Stop code that runs longer than this (ms) */
  timeout?: number
  /** Multi-file projects: file to run (default: app.js, main.js, index.js, else the last block) */
  entry?: string
}>(), {
  code: 'console.log(\'Hello, ByteJS!\')\n',
  languages: () => ['js'],
  lang: undefined,
  full: false,
  heightClass: 'lg:h-[28rem]',
  timeout: 5000,
  entry: undefined
})

const toast = useToast()
const slots = useSlots()

/* ---------- tabs from slot code blocks ---------- */
interface Block { code: string, language?: string, filename?: string }
function collect(nodes: unknown, acc: Block[] = []): Block[] {
  for (const node of ([] as unknown[]).concat(nodes ?? [])) {
    const v = node as VNode
    const p = v?.props as Record<string, unknown> | null
    if (p && typeof p.code === 'string') {
      acc.push({ code: p.code, language: p.language as string | undefined, filename: p.filename as string | undefined })
      continue
    }
    const children = v?.children as unknown
    if (Array.isArray(children)) collect(children, acc)
    else if (children && typeof children === 'object' && typeof (children as Record<string, unknown>).default === 'function') {
      collect((children as Record<string, () => unknown>).default(), acc)
    }
  }
  return acc
}
function normalizePath(path: string): string {
  const out: string[] = []
  for (const part of path.replace(/^\/+/, '').split('/')) {
    if (!part || part === '.') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return out.join('/')
}
const toLang = (l?: string): Lang => (l === 'ts' || l === 'typescript' || l === 'tsx') ? 'ts' : 'js'
const langName: Record<Lang, string> = { js: 'JavaScript', ts: 'TypeScript' }
// same icons Nuxt UI's ::code-group uses
const langIcon: Record<Lang, string> = { js: 'i-vscode-icons-file-type-js', ts: 'i-vscode-icons-file-type-typescript' }

// The slot is read lazily, the first time the template renders. Reading it in setup()
// triggers Vue's "Slot invoked outside of the render function" warning.
// Markdown code blocks never change after render, so computing this once is enough.
let tabsCache: Tab[] | null = null
function getTabs(): Tab[] {
  if (!tabsCache) {
    const blocks = collect(slots.default?.())
    tabsCache = blocks.length
      ? blocks.map((b, i) => ({
          id: `t${i}`,
          lang: toLang(b.language),
          label: b.filename || langName[toLang(b.language)],
          initial: b.code,
          path: normalizePath(b.filename || `file${i + 1}.${toLang(b.language)}`)
        }))
      : (props.languages.length ? props.languages : ['js' as Lang]).map((l, i) => ({ id: `t${i}`, lang: l, label: langName[l], initial: props.code, path: `main.${l}` }))
  }
  return tabsCache
}
const tabs = computed(getTabs)

// Edited code per tab; a tab without an entry still shows its original code
const sources = reactive<Record<string, string>>({})
const picked = ref<string>()
const active = computed({
  get: () => picked.value ?? (projectMode.value ? entryTab.value : (tabs.value.find(t => t.lang === props.lang) ?? tabs.value[0])!).id,
  set: (id: string) => { picked.value = id }
})
const tab = computed(() => tabs.value.find(t => t.id === active.value)!)
const source = computed({
  get: () => sources[active.value] ?? tab.value.initial,
  set: (v: string) => { sources[active.value] = v }
})
const lang = computed(() => tab.value.lang)

/* ---------- multi-file projects (ES modules) ---------- */
const MODULE_SYNTAX = /^\s*(?:import\s*[\w*{"'\s]|export\s)/m
const usesModules = (code: string) => MODULE_SYNTAX.test(code) || /\bimport\.meta\b/.test(code)
/** Blocks become one project (file tree, run the entry file) when any of them uses import/export */
const projectMode = computed(() => tabs.value.some(t => usesModules(t.initial)))
const codeOf = (t: Tab) => sources[t.id] ?? t.initial

const ENTRY_NAMES = ['app', 'main', 'index']
const entryTab = computed<Tab>(() => {
  const list = tabs.value
  const wanted = props.entry ? normalizePath(props.entry) : ''
  return list.find(t => wanted && (t.path === wanted || t.label === props.entry))
    ?? ENTRY_NAMES.map(n => list.find(t => new RegExp(`(^|/)${n}\\.(m?js|ts)$`).test(t.path))).find(Boolean)
    ?? list[list.length - 1]!
})

/** Folder tree for the sidebar, flattened into rows */
type TreeRow = { kind: 'folder', key: string, label: string, depth: number } | { kind: 'file', key: string, label: string, depth: number, tab: Tab }
const tree = computed<TreeRow[]>(() => {
  type Node = { folders: Map<string, Node>, files: Tab[] }
  const root: Node = { folders: new Map(), files: [] }
  for (const t of tabs.value) {
    const parts = t.path.split('/')
    let node = root
    for (const dir of parts.slice(0, -1)) {
      if (!node.folders.has(dir)) node.folders.set(dir, { folders: new Map(), files: [] })
      node = node.folders.get(dir)!
    }
    node.files.push(t)
  }
  const rows: TreeRow[] = []
  const walk = (node: Node, depth: number, prefix: string) => {
    for (const [name, child] of [...node.folders].sort(([a], [b]) => a.localeCompare(b))) {
      rows.push({ kind: 'folder', key: `${prefix}${name}/`, label: name, depth })
      walk(child, depth + 1, `${prefix}${name}/`)
    }
    for (const t of node.files) rows.push({ kind: 'file', key: t.id, label: t.path.split('/').pop()!, depth, tab: t })
  }
  walk(root, 0, '')
  return rows
})

const lines = ref<Line[]>([])
const running = ref(false)
const duration = ref<number | null>(null)
const showOutput = ref(props.full)
let lineId = 0
// previous output stays (dimmed) until the new run prints something → no height jumps
const stale = ref(false)
/** Result of the last run: drives the status dot next to "Output" */
const status = computed<'idle' | 'running' | 'success' | 'error'>(() => {
  if (running.value) return 'running'
  if (duration.value === null && !lines.value.length) return 'idle'
  return lines.value.some(l => l.level === 'error' || (l.level === 'system' && l.text.startsWith('Stopped'))) ? 'error' : 'success'
})
const statusDot = {
  idle: 'bg-(--ui-text-dimmed)',
  running: 'bg-warning animate-pulse',
  success: 'bg-success',
  error: 'bg-error'
} as const
const statusText = { idle: 'Not run yet', running: 'Running', success: 'Ran successfully', error: 'Failed' } as const
let worker: Worker | null = null
let workerUrl: string | null = null
/** blob: URLs of the files in a multi-file run, and their file names (to clean up error messages) */
let moduleUrls: Record<string, string> = {}
let timer: ReturnType<typeof setTimeout> | null = null
let startedAt = 0

/* ---------- examples (full mode) ---------- */
const examples: { label: string, lang: Lang, code: string }[] = [
  { label: 'Hello world', lang: 'js', code: 'console.log(\'Hello, ByteJS!\')\n' },
  {
    label: 'Arrays & objects',
    lang: 'js',
    code: `const users = [
  { name: 'Asha', age: 28 },
  { name: 'Ravi', age: 34 },
  { name: 'Meera', age: 22 }
]

const adults = users.filter(u => u.age > 25)
console.log(adults)
console.log(users.map(u => u.name).join(', '))
console.table(users)
`
  },
  {
    label: 'Async / await',
    lang: 'js',
    code: `const wait = ms => new Promise(r => setTimeout(r, ms))

console.log('Starting...')
await wait(500)
console.log('Half a second later')

const results = await Promise.all([1, 2, 3].map(async n => {
  await wait(n * 100)
  return n * 2
}))
console.log(results)
`
  },
  {
    label: 'Classes',
    lang: 'js',
    code: `class Animal {
  constructor(name) { this.name = name }
  speak() { return \`\${this.name} makes a sound\` }
}

class Dog extends Animal {
  speak() { return \`\${this.name} barks\` }
}

console.log(new Dog('Bruno').speak())
console.log(new Dog('Bruno'))
`
  },
  {
    label: 'TypeScript types',
    lang: 'ts',
    code: `interface Course {
  title: string
  lessons: number
  tags?: string[]
}

function summary(course: Course): string {
  return \`\${course.title}: \${course.lessons} lessons\`
}

const js: Course = { title: 'JavaScript', lessons: 42, tags: ['web'] }
console.log(summary(js))

enum Level { Beginner, Intermediate, Advanced }
console.log(Level.Intermediate, Level[2])
`
  },
  {
    label: 'Errors',
    lang: 'js',
    code: `try {
  JSON.parse('{ bad json }')
} catch (err) {
  console.error('Caught:', err.message)
}

console.warn('This is a warning')
undefinedFunction()
`
  }
]
const exampleItems = computed(() => examples
  .filter(e => tabs.value.some(t => t.lang === e.lang) || e.lang === 'js')
  .map(e => ({ label: e.label, value: e.label })))
const selectedExample = ref<string>()
watch(selectedExample, (label) => {
  const ex = examples.find(e => e.label === label)
  if (!ex) return
  const target = tabs.value.find(t => t.lang === ex.lang) ?? tab.value
  active.value = target.id
  sources[target.id] = ex.code
  clearConsole()
})

/* ---------- persistence & sharing (full mode) ---------- */
const STORAGE_KEY = 'bytejs-playground'
const encode = (s: string) => btoa(unescape(encodeURIComponent(s)))
const decode = (s: string) => decodeURIComponent(escape(atob(s)))

function load(data: { code?: string, lang?: string }) {
  if (typeof data.code !== 'string') return
  const target = tabs.value.find(t => t.lang === data.lang) ?? tabs.value[0]!
  active.value = target.id
  sources[target.id] = data.code
}

onMounted(() => {
  if (!props.full) return
  const hash = window.location.hash.slice(1)
  if (hash) {
    try {
      return load(JSON.parse(decode(hash)))
    } catch { /* ignore bad links */ }
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) load(JSON.parse(saved))
  } catch { /* storage unavailable */ }
})

function persist() {
  if (!props.full) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: source.value, lang: lang.value }))
  } catch { /* storage unavailable */ }
}

async function share() {
  const url = `${window.location.origin}${window.location.pathname}#${encode(JSON.stringify({ code: source.value, lang: lang.value }))}`
  try {
    await navigator.clipboard.writeText(url)
    toast.add({ title: 'Link copied', description: 'Anyone with the link sees this code.', icon: 'i-lucide-link' })
  } catch {
    window.history.replaceState(null, '', url)
    toast.add({ title: 'Link is in the address bar', icon: 'i-lucide-link' })
  }
}

/* ---------- TypeScript ---------- */
let sucrase: { transform: (code: string, opts: object) => { code: string } } | null = null
async function toJs(code: string, l: Lang): Promise<string> {
  if (l === 'js') return code
  if (!sucrase) {
    push('system', 'Loading TypeScript compiler...')
    sucrase = await import(/* @vite-ignore */ 'https://esm.sh/sucrase@3.35.0')
  }
  return sucrase!.transform(code, { transforms: ['typescript'], disableESTransforms: true }).code
}

/* ---------- worker runtime ---------- */
const prelude = `
const __pg_post = (level, args) => self.postMessage({ level, text: args.map(a => __pg_fmt(a, 0, new WeakSet(), true)).join(' ') });
function __pg_fmt(v, depth, seen, top) {
  const t = typeof v;
  if (t === 'string') return top ? v : JSON.stringify(v);
  if (t === 'number' || t === 'boolean' || v === null || v === undefined) return String(v);
  if (t === 'bigint') return v + 'n';
  if (t === 'symbol') return v.toString();
  if (t === 'function') return v.toString().startsWith('class') ? '[class ' + (v.name || 'anonymous') + ']' : '[Function: ' + (v.name || 'anonymous') + ']';
  if (v instanceof Error) return v.stack || (v.name + ': ' + v.message);
  if (seen.has(v)) return '[Circular]';
  if (depth > 3) return Array.isArray(v) ? '[Array]' : '[Object]';
  seen.add(v);
  const pad = '  '.repeat(depth + 1), end = '  '.repeat(depth);
  const wrap = (open, items, close) => {
    if (!items.length) return open + close;
    const one = open + ' ' + items.join(', ') + ' ' + close;
    return one.length <= 72 && !one.includes('\\n') ? one : open + '\\n' + pad + items.join(',\\n' + pad) + '\\n' + end + close;
  };
  let out;
  if (Array.isArray(v)) out = v.length ? wrap('[', v.map(x => __pg_fmt(x, depth + 1, seen)), ']').replace('[ ', '[').replace(' ]', ']') : '[]';
  else if (v instanceof Map) out = 'Map(' + v.size + ') ' + wrap('{', [...v].map(([k, x]) => __pg_fmt(k, depth + 1, seen) + ' => ' + __pg_fmt(x, depth + 1, seen)), '}');
  else if (v instanceof Set) out = 'Set(' + v.size + ') ' + wrap('{', [...v].map(x => __pg_fmt(x, depth + 1, seen)), '}');
  else if (v instanceof Date) out = v.toISOString();
  else if (v instanceof RegExp) out = String(v);
  else if (v instanceof Promise) out = 'Promise { <pending> }';
  else {
    const name = v.constructor && v.constructor !== Object ? v.constructor.name + ' ' : '';
    out = name + wrap('{', Object.keys(v).map(k => (/^[A-Za-z_$][\\w$]*$/.test(k) ? k : JSON.stringify(k)) + ': ' + __pg_fmt(v[k], depth + 1, seen)), '}');
  }
  seen.delete(v);
  return out;
}
for (const m of ['log', 'info', 'warn', 'error', 'debug']) console[m] = (...a) => __pg_post(m, a);
console.table = (d) => __pg_post('table', [d]);
self.addEventListener('unhandledrejection', e => { e.preventDefault(); __pg_post('error', ['Uncaught (in promise)', e.reason]); });
// Track timers so a run only finishes when the main code AND all pending timers are done (like Node / the browser).
const __pg_timers = new Set();
let __pg_mainDone = false;
const __pg_uncaught = (e) => __pg_post('error', ['Uncaught ' + (e && e.name ? e.name + ': ' + e.message : __pg_fmt(e, 0, new WeakSet(), true))]);
const __pg_check = () => { if (__pg_mainDone && __pg_timers.size === 0) self.postMessage({ __done: true }); };
const __pg_call = (fn, args) => { try { if (typeof fn === 'function') fn(...args); } catch (e) { __pg_uncaught(e); } };
{
  const st = self.setTimeout.bind(self), ct = self.clearTimeout.bind(self);
  const si = self.setInterval.bind(self), ci = self.clearInterval.bind(self);
  self.setTimeout = (fn, ms, ...args) => {
    const id = st(() => { __pg_timers.delete(id); __pg_call(fn, args); __pg_check(); }, ms);
    __pg_timers.add(id);
    return id;
  };
  self.clearTimeout = (id) => { ct(id); if (__pg_timers.delete(id)) __pg_check(); };
  self.setInterval = (fn, ms, ...args) => {
    const id = si(() => __pg_call(fn, args), ms);
    __pg_timers.add(id);
    return id;
  };
  self.clearInterval = (id) => { ci(id); if (__pg_timers.delete(id)) __pg_check(); };
}
`


function flushStale() {
  if (stale.value) {
    lines.value = []
    stale.value = false
  }
}

function push(level: Level, text: string) {
  flushStale()
  lines.value.push({ id: ++lineId, level, text })
}

function stopWorker() {
  worker?.terminate()
  worker = null
  if (workerUrl) URL.revokeObjectURL(workerUrl)
  workerUrl = null
  for (const url of Object.keys(moduleUrls)) URL.revokeObjectURL(url)
  moduleUrls = {}
  if (timer) clearTimeout(timer)
  timer = null
}

function finish() {
  if (!running.value) return
  flushStale()
  duration.value = Math.round(performance.now() - startedAt)
  running.value = false
  // main code and all timers are done → nothing left to run
  stopWorker()
}

async function run() {
  stopWorker()
  stale.value = lines.value.length > 0
  duration.value = null
  showOutput.value = true
  running.value = true
  startedAt = performance.now()

  // Several files, or a file that uses import/export → run as ES modules
  const files = projectMode.value ? tabs.value : (usesModules(source.value) ? [tab.value] : null)

  let script: string
  try {
    if (files) {
      script = await buildModules(files)
    } else {
      const js = await toJs(source.value, lang.value)
      // Classic worker (module workers from blob: URLs are blocked in some browsers/origins).
      // The async wrapper keeps top-level `await` working.
      script = `${prelude}
(async () => {
${js}
})().then(
  () => { __pg_mainDone = true; __pg_check(); },
  (e) => { __pg_uncaught(e); self.postMessage({ __done: true }); }
);`
    }
    if (!stale.value) lines.value = lines.value.filter(l => l.level !== 'system')
  } catch (err) {
    push('error', `${files ? '' : 'Compile error: '}${(err as Error).message}`)
    for (const url of Object.keys(moduleUrls)) URL.revokeObjectURL(url)
    moduleUrls = {}
    duration.value = Math.round(performance.now() - startedAt)
    running.value = false
    return
  }

  workerUrl = URL.createObjectURL(new Blob([script], { type: 'text/javascript' }))
  worker = new Worker(workerUrl, files ? { type: 'module' } : undefined)

  worker.onmessage = (e: MessageEvent) => {
    if (e.data?.__done) return finish()
    push(e.data.level, files ? cleanUrls(e.data.text) : e.data.text)
  }
  worker.onerror = (e: Event) => {
    e.preventDefault()
    push('error', cleanUrls((e as ErrorEvent).message || 'The code could not be run (syntax error or blocked script).'))
    finish()
  }
  timer = setTimeout(() => {
    if (running.value) {
      flushStale()
      stopWorker()
      running.value = false
      duration.value = Math.round(performance.now() - startedAt)
      push('system', `Stopped: code ran longer than ${props.timeout / 1000}s (infinite loop?)`)
    }
  }, props.timeout)
}

/* ---------- ES module runner ----------
 * Each file becomes a blob: URL. Relative imports ("./kitchen.js", "../utils/price.js") are
 * rewritten to the blob URL of the matching file, dependencies first. import() with a computed
 * path goes through a small resolver inside the worker. The entry file is loaded by a wrapper
 * module that installs the console/timer prelude first.
 */
const isRelative = (spec: string) => spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('/')
const resolveFrom = (from: string, spec: string) =>
  normalizePath(spec.startsWith('/') ? spec : (from.includes('/') ? from.slice(0, from.lastIndexOf('/') + 1) : '') + spec)

/** Finds a file by path, allowing "./x" for x.js and "./x.js" for x.ts */
function findPath(files: Record<string, string>, path: string): string | null {
  const bare = path.replace(/\.(m?js|ts)$/, '')
  for (const p of [path, `${bare}.js`, `${bare}.ts`, `${bare}.mjs`, `${path}/index.js`, `${path}/index.ts`]) {
    if (p in files) return p
  }
  return null
}

function cleanUrls(text: string): string {
  let out = text
  for (const [url, path] of Object.entries(moduleUrls)) out = out.split(url).join(path)
  return out
}

async function buildModules(files: Tab[]): Promise<string> {
  const code: Record<string, string> = {}
  for (const t of files) code[t.path] = await toJs(codeOf(t), t.lang)

  const urlOf: Record<string, string> = {}
  const building = new Set<string>()
  const build = (path: string, importer?: string): string => {
    const found = findPath(code, path)
    if (!found) throw new Error(`Cannot find module "./${path}"${importer ? ` imported from ${importer}` : ''}`)
    if (urlOf[found]) return urlOf[found]
    if (building.has(found)) throw new Error(`Circular import at "${found}": the playground does not support circular imports.`)
    building.add(found)
    const rewritten = code[found]!
      // from "./x.js" · import "./x.js" · import("./x.js")
      .replace(/(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])([^"'\n]+)\2/g, (match, before: string, quote: string, spec: string) =>
        isRelative(spec) ? `${before}${quote}${build(resolveFrom(found, spec), found)}${quote}` : match)
      // import() with a computed path, e.g. import(`./lang/${code}.js`)
      .replace(/(^|[^.\w$])import\s*\((?!\s*["']blob:)/g, '$1__pg_import(')
    // kept on line 1 so error line numbers still match the file
    const shim = `const __pg_import = (s) => self.__pg_dynamicImport(s, ${JSON.stringify(found)});`
    const url = URL.createObjectURL(new Blob([shim + rewritten], { type: 'text/javascript' }))
    moduleUrls[url] = found
    urlOf[found] = url
    building.delete(found)
    return url
  }

  const entry = build(entryTab.value.path)
  for (const path of Object.keys(code)) build(path) // so import(`./${x}.js`) can reach every file

  return `${prelude}
const __pg_urls = ${JSON.stringify(urlOf)};
const __pg_norm = ${normalizePath.toString()};
const __pg_find = (p) => { const b = p.replace(/\\.(m?js|ts)$/, ''); return [p, b + '.js', b + '.ts', b + '.mjs', p + '/index.js', p + '/index.ts'].find(x => x in __pg_urls); };
self.__pg_dynamicImport = (spec, from) => {
  if (!/^\\.{0,2}\\//.test(spec)) return import(spec);
  const path = __pg_find(__pg_norm(spec.startsWith('/') ? spec : (from.includes('/') ? from.slice(0, from.lastIndexOf('/') + 1) : '') + spec));
  return path ? import(__pg_urls[path]) : Promise.reject(new Error('Cannot find module "' + spec + '" imported from ' + from));
};
import(${JSON.stringify(entry)}).then(
  () => { __pg_mainDone = true; __pg_check(); },
  (e) => { __pg_uncaught(e); self.postMessage({ __done: true }); }
);`
}

function stop() {
  flushStale()
  stopWorker()
  if (running.value) {
    running.value = false
    duration.value = Math.round(performance.now() - startedAt)
    push('system', 'Stopped by you')
  }
}

function clearConsole() {
  stale.value = false
  lines.value = []
  duration.value = null
}

function reset() {
  if (projectMode.value) for (const t of tabs.value) sources[t.id] = t.initial
  else sources[active.value] = tab.value.initial
  selectedExample.value = undefined
  clearConsole()
  if (!props.full) showOutput.value = false
}

onBeforeUnmount(stopWorker)

/* ---------- editor (Shiki-highlighted, same themes as content code blocks) ---------- */
const lineCount = computed(() => source.value.split('\n').length)
const changed = computed(() => projectMode.value
  ? tabs.value.some(t => codeOf(t) !== t.initial)
  : source.value !== tab.value.initial)

const escapeHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const highlighted = ref('')
let codeToHtml: ((code: string, opts: object) => Promise<string>) | null = null
let hlTimer: ReturnType<typeof setTimeout> | null = null

async function highlight() {
  const code = source.value
  try {
    codeToHtml ??= (await import('shiki')).codeToHtml
    const html = await codeToHtml(code, {
      lang: lang.value === 'ts' ? 'typescript' : 'javascript',
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false
    })
    // keep only the inner <code> content; the wrapper is styled with prose `pre` classes
    const inner = html.match(/<code>([\s\S]*)<\/code>/)?.[1] ?? escapeHtml(code)
    if (code === source.value) highlighted.value = inner
  } catch {
    highlighted.value = escapeHtml(code)
  }
}
// Registered after the first render so they don't read the slot during setup
onMounted(() => {
  watch([source, active], persist)
  watch([source, active], () => {
    highlighted.value = highlighted.value || escapeHtml(source.value)
    if (hlTimer) clearTimeout(hlTimer)
    hlTimer = setTimeout(highlight, 60)
  })
  highlight()
})

function onKeydown(e: KeyboardEvent) {
  const el = e.target as HTMLTextAreaElement
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    run()
    return
  }
  if (e.key === 'Tab') {
    e.preventDefault()
    const { selectionStart: st, selectionEnd: end } = el
    source.value = source.value.slice(0, st) + '  ' + source.value.slice(end)
    nextTick(() => el.setSelectionRange(st + 2, st + 2))
  }
}

const copied = ref(false)
async function copyCode() {
  await navigator.clipboard.writeText(source.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

/* ---------- console ---------- */
const output = ref<HTMLDivElement>()
watch(() => lines.value.length, () => nextTick(() => {
  output.value?.scrollTo({ top: output.value.scrollHeight })
}))

const levelUi: Record<Level, { icon?: string, cls: string }> = {
  log: { cls: 'text-default' },
  debug: { cls: 'text-muted' },
  info: { icon: 'i-lucide-info', cls: 'text-info' },
  warn: { icon: 'i-lucide-triangle-alert', cls: 'text-warning bg-warning/10' },
  error: { icon: 'i-lucide-circle-x', cls: 'text-error bg-error/10' },
  table: { icon: 'i-lucide-table', cls: 'text-default' },
  system: { icon: 'i-lucide-terminal', cls: 'text-dimmed italic' }
}

const isMac = ref(false)
onMounted(() => {
  isMac.value = /Mac|iPhone|iPad/.test(navigator.platform)
})
</script>

<template>
  <div class="not-prose group/pg my-5">
    <!-- tab bar: same look as ::code-group -->
    <div class="relative flex items-center gap-1 overflow-x-auto rounded-t-md border border-b-0 border-muted bg-default p-2">
      <!-- multi-file project: show the open file and which file runs -->
      <div v-if="projectMode" class="flex min-w-0 items-center gap-1.5 px-2 py-1.5 text-sm">
        <UIcon name="i-lucide-folder-tree" class="size-4 shrink-0 text-muted" />
        <span class="truncate font-mono text-highlighted">{{ tab.path }}</span>
        <UBadge
          v-if="tab.id === entryTab.id"
          label="runs first"
          color="primary"
          variant="subtle"
          size="sm"
          class="shrink-0"
        />
      </div>
      <button
        v-for="t in (projectMode ? [] : tabs)"
        :key="t.id"
        type="button"
        class="relative inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm outline-primary/25 transition-colors focus-visible:outline-3"
        :class="active === t.id ? 'bg-elevated text-highlighted shadow-xs' : 'text-default hover:bg-elevated/50'"
        @click="active = t.id"
      >
        <UIcon :name="langIcon[t.lang]" class="size-4 shrink-0" />
        <span class="truncate">{{ t.label }}</span>
      </button>

      <USelect
        v-if="full"
        v-model="selectedExample"
        :items="exampleItems"
        placeholder="Examples"
        icon="i-lucide-book-open"
        size="xs"
        variant="ghost"
        class="ml-1 w-36"
      />

      <div class="ml-auto flex shrink-0 items-center gap-0.5">
        <UTooltip v-if="changed" text="Reset code">
          <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="ghost" size="xs" aria-label="Reset code" @click="reset" />
        </UTooltip>
        <UTooltip v-if="full" text="Copy share link">
          <UButton icon="i-lucide-share-2" color="neutral" variant="ghost" size="xs" aria-label="Share" @click="share" />
        </UTooltip>
        <UTooltip :text="copied ? 'Copied!' : 'Copy code'">
          <UButton
            :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Copy code"
            @click="copyCode"
          />
        </UTooltip>
        <UButton
          v-if="running"
          label="Stop"
          icon="i-lucide-square"
          color="error"
          variant="soft"
          size="xs"
          @click="stop"
        />
        <UTooltip :text="`Run (${isMac ? '⌘' : 'Ctrl'} + Enter)`">
          <UButton label="Run" icon="i-lucide-play" size="xs" :loading="running" @click="run" />
        </UTooltip>
      </div>
    </div>

    <div
      class="overflow-hidden rounded-b-md border border-muted outline-primary/25 focus-within:outline-3"
      :class="full && 'lg:grid lg:grid-cols-2'"
    >
      <div
        :class="[
          projectMode && 'sm:grid sm:grid-cols-[minmax(9rem,13rem)_minmax(0,1fr)]',
          full && projectMode && 'lg:border-r lg:border-muted'
        ]"
      >
        <!-- file tree (multi-file projects) -->
        <nav
          v-if="projectMode"
          aria-label="Files"
          class="flex gap-0.5 overflow-x-auto border-b border-muted bg-default p-1.5 font-mono text-[13px] sm:flex-col sm:overflow-x-visible sm:border-r sm:border-b-0"
        >
          <template v-for="row in tree" :key="row.key">
            <div
              v-if="row.kind === 'folder'"
              class="hidden items-center gap-1.5 py-1 pr-2 text-muted sm:flex"
              :style="{ paddingLeft: `${0.5 + row.depth * 0.875}rem` }"
            >
              <UIcon name="i-lucide-folder-open" class="size-4 shrink-0" />
              <span class="truncate">{{ row.label }}</span>
            </div>
            <button
              v-else
              type="button"
              class="flex shrink-0 items-center gap-1.5 rounded-md py-1 pr-2 text-left outline-primary/25 transition-colors focus-visible:outline-3 max-sm:pl-2!"
              :class="active === row.tab.id ? 'bg-elevated text-highlighted shadow-xs' : 'text-default hover:bg-elevated/50'"
              :style="{ paddingLeft: `${0.5 + row.depth * 0.875}rem` }"
              :title="row.tab.path"
              @click="active = row.tab.id"
            >
              <UIcon :name="langIcon[row.tab.lang]" class="size-4 shrink-0" />
              <span class="truncate"><span class="text-muted sm:hidden">{{ row.tab.path.slice(0, -row.label.length) }}</span>{{ row.label }}</span>
              <UIcon
                v-if="row.tab.id === entryTab.id"
                name="i-lucide-play"
                class="ml-auto size-3 shrink-0 text-primary"
                aria-label="runs first"
              />
            </button>
          </template>
        </nav>

        <!-- editor: prose `pre` classes; highlighted code under a transparent textarea -->
        <div
          class="grid min-w-0 bg-muted font-mono text-sm/6 *:col-start-1 *:row-start-1"
          :class="full ? ['h-80 overflow-auto', !projectMode && 'lg:border-r lg:border-muted', heightClass] : ''"
        >
          <pre
            aria-hidden="true"
            class="pointer-events-none px-4 py-3 break-words whitespace-pre-wrap [&_span]:text-(--shiki-light) dark:[&_span]:text-(--shiki-dark)"
          ><code v-html="highlighted + '\n'" /></pre>
          <textarea
            v-model="source"
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            :aria-label="`${tab.label} code editor`"
            :rows="lineCount"
            class="h-full w-full resize-none overflow-hidden bg-transparent px-4 py-3 break-words whitespace-pre-wrap text-transparent caret-(--ui-text-highlighted) outline-none selection:bg-primary/25"
            @keydown="onKeydown"
          />
        </div>
      </div>

      <!-- output: slides open/closed by animating grid rows 0fr ↔ 1fr -->
      <div
        class="grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none"
        :class="showOutput ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
        :aria-hidden="!showOutput"
      >
        <div class="min-h-0 overflow-hidden">
          <div
            class="flex flex-col border-t border-muted bg-default"
            :class="full ? ['h-64 lg:border-t-0', heightClass] : 'max-h-72 min-h-24'"
          >
            <div class="flex items-center gap-2 border-b border-muted px-4 py-1.5 text-xs text-muted">
              <span class="relative flex size-2.5" role="status" :aria-label="statusText[status]" :title="statusText[status]">
                <span v-if="status === 'running'" class="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-60" />
                <span class="relative inline-flex size-2.5 rounded-full transition-colors duration-300" :class="statusDot[status]" />
              </span>
              <span class="font-medium">Output</span>
              <span v-if="status === 'running'" class="text-warning">running...</span>
              <span v-else-if="duration !== null" :class="status === 'error' ? 'text-error' : 'text-dimmed'">
                {{ status === 'error' ? 'failed' : 'done' }} · {{ duration }} ms
              </span>
              <div class="ml-auto flex items-center">
                <!-- <UButton icon="i-lucide-ban" color="neutral" variant="link" size="xs" aria-label="Clear output" @click="clearConsole" /> -->
                <UButton
                  v-if="!full"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="link"
                  size="xs"
                  aria-label="Hide output"
                  @click="showOutput = false"
                />
              </div>
            </div>
            <div
              ref="output"
              class="flex-1 overflow-auto py-1 font-mono text-[13px] transition-opacity duration-200"
              :class="stale && 'opacity-40'"
            >
              <p v-if="running && !lines.length" class="flex items-center gap-2 px-4 py-2 text-dimmed">
                <UIcon name="i-lucide-loader-circle" class="size-3.5 animate-spin" /> Running...
              </p>
              <p v-else-if="!lines.length" class="px-4 py-2 text-dimmed" />
              <div
                v-for="l in lines"
                :key="l.id"
                class="flex gap-2 px-4 py-0.5"
                :class="levelUi[l.level].cls"
              >
                <UIcon v-if="levelUi[l.level].icon" :name="levelUi[l.level].icon!" class="mt-1 size-3.5 shrink-0" />
                <pre class="min-w-0 flex-1 break-words whitespace-pre-wrap">{{ l.text }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
