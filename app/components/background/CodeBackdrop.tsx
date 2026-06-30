// A faint, slowly-scrolling wall of code — a subtle software-engineering
// texture for dark sections. Pure CSS animation (see `.code-wall` in
// globals.css); decorative, so it's aria-hidden and click-through.
// Lines are intentionally long so they wrap and fill the full width.
const SNIPPET = `import { createServer, type Request, type Response } from "@core/http";
import { compile, BuildError } from "@core/build";
import { edge, store, router } from "@core/runtime";

export async function deploy(app: App, opts: DeployOptions = {}): Promise<Result<Deployment>> {
  const build = await compile(app.entry, { mode: "production", sourcemaps: true, minify: true });
  if (!build.ok) throw new BuildError(build.errors, { phase: "compile", at: Date.now() });
  await Promise.all(app.functions.map((fn) => edge.publish(fn, { region: "auto", retries: 3 })));
  return { ok: true, value: { url: app.domain, sha: build.sha, size: build.bytes } };
}

const router = createRouter().use(cors()).use(auth()).get("/health", () => Response.json({ ok: true }));
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
const pipe = (...fns: Array<(x: unknown) => unknown>) => (input: unknown) => fns.reduce((value, fn) => fn(value), input);
const debounce = (fn, ms) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }; };
const memoize = (fn) => { const cache = new Map(); return (key) => cache.has(key) ? cache.get(key) : (cache.set(key, fn(key)), cache.get(key)); };

async function handler(req: Request): Promise<Response> {
  const key = req.method + " " + new URL(req.url).pathname;
  if (cache.has(key)) return cache.get(key)!.clone();
  const res = await router.dispatch(req).catch((err) => Response.json({ error: err.message }, { status: 500 }));
  cache.set(key, res.clone());
  return res;
}

export function useProjects(query: string) {
  const [state, setState] = useState<Result<Project[]>>({ ok: false, error: new Error("idle") });
  useEffect(() => { const off = store.subscribe(() => setState(store.select(filterBy(query)))); return off; }, [query]);
  return useMemo(() => state.ok ? state.value.sort((a, b) => b.weight - a.weight) : [], [state]);
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);
const groupBy = (items, key) => items.reduce((acc, it) => ((acc[key(it)] ??= []).push(it), acc), {});
const retry = async (fn, n = 3, delay = 250) => { for (let i = 0; ; i++) { try { return await fn(); } catch (e) { if (i >= n) throw e; await sleep(delay * 2 ** i); } } };
`;

export default function CodeBackdrop({
    className = "",
}: {
    className?: string;
}) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        >
            <pre className="code-wall absolute inset-x-0 top-0 whitespace-pre-wrap break-words px-6 font-mono text-sm leading-7 text-accent-blue/30 md:text-base md:leading-8">
                {SNIPPET + "\n" + SNIPPET}
            </pre>
            {/* light fade at top & bottom into the surface */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-transparent to-surface/60" />
        </div>
    );
}
