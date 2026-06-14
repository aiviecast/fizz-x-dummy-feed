// dummy-feed-driver.js — X dummy client のグルー例。シミュロジック=Almide(wasm)、
// 配列/タイマー/id 文字列組立=Node。id は seq から組む(文字列を wasm 越しに返さない)。
export async function loadDummyFeed(wasmUrl) {
  const bytes = await (await fetch(wasmUrl)).arrayBuffer();
  const mod = await WebAssembly.compile(bytes);
  const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
  const enc = new TextEncoder();
  let seq = 0;
  const formatId = (s) => "dum-" + String(s).padStart(8, "0");
  return {
    newId() { seq = ex.next_seq(seq); return formatId(seq); },
    templateIndex(injectIdx, count) { return ex.template_index(injectIdx, count); },
    parseSeq(id) { const b = enc.encode(id); const p = ex.id_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b); return ex.parse_seq(); },
    // sinceId より新しい mention だけ返す
    since(mentions, sinceId) {
      const s = sinceId ? this.parseSeq(sinceId) : -1;
      return mentions.filter((m) => ex.is_newer(this.parseSeq(m.id), s) === 1);
    },
  };
}
