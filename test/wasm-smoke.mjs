import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/feed.wasm", import.meta.url)));
const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
const enc = new TextEncoder();
const parseSeq = (id) => { const b = enc.encode(id); const p = ex.id_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b); return ex.parse_seq(); };
let ok = true; const ck = (g, w, m) => { if (g !== w) { console.error(`FAIL ${m}: ${g}!=${w}`); ok = false; } };
ck(ex.next_seq(41), 42, "next_seq"); ck(ex.template_index(7, 3), 1, "tmpl cycle");
ck(ex.is_newer(5, 3), 1, "newer"); ck(ex.is_newer(3, 5), 0, "not newer"); ck(ex.is_newer(1, -1), 1, "since unset");
ck(parseSeq("dum-00000042"), 42, "parse 42"); ck(parseSeq("xxx"), -1, "parse bad");
console.log(ok ? "wasm OK — dummy feed logic matches native" : "FAIL"); if (!ok) process.exit(1);
