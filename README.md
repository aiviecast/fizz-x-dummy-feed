# fizz-x-dummy-feed

Fizz の **X dummy client(擬似 mention フィード)の純ロジック**(§9 X連携)。実 X API
無しで配信運用を確認する擬似フィードのうち、計算で表せる部分を担う。

タイマー注入や in-memory 配列・push は Node の I/O、以下は Almide:
- **id 採番**: `dum-` + seq の **8 桁ゼロ詰め**(zero-pad で辞書順 = 時系列順になる肝)
- **テンプレ巡回**: `injectIdx % テンプレ数`
- **since 判定**: `sinceId` より新しい(= seq が大きい)ものだけ返す

比較やテンプレ選択は **seq(Int)** で行い、id 文字列を wasm 越しに返さない。移植元:
openaituber `server/x/dummyClient.ts`。

## API

`format_id(seq)`(native)/ `parse_seq(id)` / `next_seq(cur)` /
`template_index(inject_idx, count)` / `is_newer(seq, since_seq)`。

## native

```sh
almide build src/main.almd -o build/fizz-x-dummy-feed
./build/fizz-x-dummy-feed
# {"id1":"dum-00000001","parse":42,"tmpl":1,"newer":true,...}
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/feed.wasm
```

`next_seq` / `template_index` / `is_newer`(Int/Bool)+ `id_alloc`+`parse_seq`(id 文字列→seq)。
id 文字列の組み立ては seq から JS 側(`"dum-"+String(seq).padStart(8,"0")`)。グルー例
[`browser/dummy-feed-driver.js`](./browser/dummy-feed-driver.js)。CI で wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
