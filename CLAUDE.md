# 箱庭の村 開発ルール

## 絶対禁止
- **Google Fonts は絶対禁止。**（`fonts.googleapis.com` / `fonts.gstatic.com`、`<link>`・`@import`・preconnect を含む）Web フォント全般も使わず、システムフォントのスタックだけを使う。
- 外部 CDN・外部ライブラリ・外部への通信を入れない（three.js 等も不可。WebGL は自作）。
- `npm run check` が上記を自動検出して失敗させる。

## 構成
- 編集するのは `src/` のみ。`index.html` は生成物なので直接編集しない。
  - `src/index.template.html` マークアップ
  - `src/styles.css` スタイル
  - `src/js/NN-*.js` ロジック。番号順に連結され、1つの IIFE 内で共通スコープを持つ（順序に意味があるので番号は実行順）
  - `scripts/` ビルド・検査ツール（依存パッケージなし）
- `npm run build` で `index.html` を生成、`npm run check` で静的検査、`npm run smoke` でヘッドレス実行確認、`npm run verify` で build + check。
- `index.html` は Artifact として公開するためコミットする。変更時は必ず build 後の結果を含める。

## 作業の流れ
1. `src/` を編集
2. `npm run verify`（描画に関わる変更は `npm run smoke` も）
3. 日本語でコミットメッセージを書き、PR を作る

## 方針
- UI の文言は日本語（英語学習モードの英文を除く）。
- 保存キー（`hakoniwa-save-v1` など）を変える時は移行処理を入れ、既存の町を壊さない。
- Artifact の `sample` 機能は使えない環境があるため、必ずオフライン経路を残す。
