# S0 開発・検証手順

## 起動

Node.js 24系とnpmを使用。依存はルートのpackage.jsonとpackage-lock.jsonに集約。appsとpackagesは責務別ソースディレクトリで、独立配布するnpmパッケージではない。

```sh
npm ci
npm run api:types
npm run db:migrate
npm run api:dev
```

別ターミナルで `npm run dev` を実行し、`http://127.0.0.1:5173` を開く。暦の1週・4週送りと初期化、接続確認を操作できる。Viteの `/api` プロキシからポート8787のローカルAPIへ接続する。API未起動でも暦は動く。終了は各ターミナルでCtrl+C。

`GET /api/health` はD1の `poc_schema` を読み、初期化済みの場合のみ200。未初期化・DB障害は503、別パスは404、GET以外は405。内部エラー詳細は返さない。認証・ゲーム保存APIは未実装。

## 検証

```sh
npm run check
```

型検査、Lint、Vitest、Webビルド、Workerのdry-runを実行。成果物は `dist/web` と `dist/api`。`npm run preview` はWeb成果物のみの確認用で、開発用APIプロキシは含まない。GitHub Actionsも同じ検証とローカルDBマイグレーションを実行する。CI設定追加とGitHub上での成功は区別する。

Workers型は `npm run api:types` で生成。DB設定変更後は再生成する。ローカルD1は `.wrangler/` 以下に保存しGit管理対象外。ゼロUUIDはローカル専用プレースホルダーで実在DBのIDではない。

## 配信の残作業

現在はローカルPoC専用。Cloudflare検証環境の対象確定後、別の環境設定へ実際のDB IDを指定する。Pagesの出力は `dist/web`、ビルドは `npm ci && npm run build`。同一配信元の `/api/*` をWorkerにつなぐルートまたはPages Functionsを用意する必要がある。Viteプロキシは公開先へ配信されない。

実環境でマイグレーション、Pages表示、APIの200/404/405/503、再配信後の接続を確認しURL・日時・環境を記録する。現在はリモートDB作成・公開・認証設定を未実施。自動デプロイも設定していない。

## 公式参照

- [Vite](https://vite.dev/guide/)
- [Vitest](https://vitest.dev/guide/)
- [Workers推奨実装](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [D1ローカル開発](https://developers.cloudflare.com/d1/best-practices/local-development/)

依存の正確な版はロックファイルが正本。取得時のNode互換条件を確認して固定する。
## ブラウザのスモーク検証

WebとAPIを起動した状態で `node scripts/smoke.mjs` を実行する。初回は `npx playwright install chromium` で検証ブラウザを用意する。Windowsで既存Edgeを使う場合はPowerShellで `$env:PLAYWRIGHT_CHANNEL='msedge'` を設定する。

暦・初期化・API成功／503時の表示・360px幅・Enter操作・再読み込みを検証する。APIの失敗表示のみブラウザ内で503応答を模擬する。DB未初期化時の実際の503はVitest統合テストで確認する。スクリーンショットはGit対象外の `tmp/` に出力する。CIの必須検証にはこのブラウザスモークをまだ含めていない。

2026-09-05: Windows、Node 24.14.1、npm 11.11.0、Edge 152.0.4191.62（ヘッドレス）で1280×900と360×800の操作を確認。360pxスクリーンショットを目視確認。モバイル実機・Safari/Firefox・性能測定・公開先の動作は未確認。