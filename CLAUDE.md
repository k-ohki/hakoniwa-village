# 箱庭の村 開発ルール

## 絶対禁止
- **Google Fonts は絶対禁止。**（`fonts.googleapis.com` / `fonts.gstatic.com`、`<link>`・`@import`・preconnect を含む）Web フォント全般も使わず、システムフォントのスタックだけを使う。
- 外部 CDN・外部ライブラリを入れない（three.js 等も不可。WebGL は自作）。外部への通信は Claude API（`https://api.anthropic.com`）だけで、利用者が自分のキーを入れた時に限る。
- **API キー・トークンなどの秘密情報をリポジトリに入れない（コード・テスト・ドキュメント・コミットメッセージすべて）。** キーは利用者のブラウザ（localStorage `hakoniwa-api-key`）にだけ保存する。テストには実在しないダミー値を使う。
- `npm run check` が上記（Google Fonts・外部URL・秘密情報。秘密情報は git の全履歴も）を自動検出して失敗させる。
- 万一キーをコミットしたら、まず Anthropic Console でキーを無効化する。履歴から消すだけでは不十分（公開リポジトリでは既に複製されている前提で扱う）。

## 構成
- 編集するのは `src/` のみ。`index.html` は生成物なので直接編集しない。
  - `src/index.template.html` マークアップ
  - `src/styles.css` スタイル
  - `src/js/NN-*.js` ロジック。番号順に連結され、1つの IIFE 内で共通スコープを持つ（順序に意味があるので番号は実行順）
  - `scripts/` ビルド・検査・テストツール（アプリは依存パッケージなし。ブラウザのテストだけ Playwright を使う）
- `npm run build` で `index.html` を生成、`npm run check` で静的検査、`npm run verify` で build + check、`npm test` で検査とブラウザのテスト一式。
- `index.html` は Artifact と GitHub Pages で公開するためコミットする。変更時は必ず build 後の結果を含める。

## 町と建物のしくみ
- 町は「箱（描画）」と「タイル（歩ける1マス）」でできている（`06-world.js`）。描画・経路探索・一人称はそれを読むだけ。
- **町の地図はデータ**（`11-town.js` の `TOWN`）。道・広場・畑・池・木・建物の配置・単語をここに書く。
- **建物はすべて設計図（spec）から作る**（`09-builder.js` の `buildBuilding`）。町の建物（`10-blueprints.js`）も、神の声で Claude が作る建物も同じ形式。
  - 入れる建物（`enterable`）は階数・部屋・仕切り壁・家具・階段・ドアを持つ。壁・窓・床・屋根は自動で作る。
  - 家具は `08-furniture.js` のカタログから選ぶ。家具は「その場所でできる行動」を登録する（ベッド→寝る、など）。
  - 行動（`ACTS`）は場所（`SPOTS`）と結びつく。家の中の行動は自分の家の家具だけを使う（`bld.spots`）。
- 新しい建物の種類を足す時は、まず `10-blueprints.js` に設計図を書く。足りない家具だけ `08-furniture.js` に足す。描画コードは原則さわらない。
- 住人の仕事・学校は `PEOPLE` の `job`（行動ID・時間帯・平日だけか）で書く。建物の行動は `hours`（営業時間）・`who`（kid/adult）・`staff`（働く人だけ）・`days` を持てる。
- Claude が返す設計図は信用しない。必ず `sanitizeSpec`（`26-god-build.js`）を通す。
- 描画を変えたら `npm run visual -- index.html <出力先> <比較元>` で、決まった視点の見た目を前後で比べる。

## 作業の流れ
1. `src/` を編集
2. `npm run build` のあと `npm test`
3. 日本語でコミットメッセージを書き、PR を作る

## 方針
- UI の文言は日本語（英語学習モードの英文を除く）。
- 保存キー（`hakoniwa-save-v1` など）を変える時は移行処理を入れ、既存の町を壊さない。
- Claude の呼び出しは `sample.json(prompt, {modelTier})` の形にそろえる。Artifact では host の `sample`、それ以外では `src/js/20-claude-api.js` の API キー版が入る。どちらも無い時のためにオフライン経路を必ず残す。
