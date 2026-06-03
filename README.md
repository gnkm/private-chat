# Private Chat

Slack ライクな簡易チャットアプリケーション（閉じたネットワーク向け）。

## 前提

- [Node.js](https://nodejs.org/)（LTS 推奨）
- [pnpm](https://pnpm.io/) 9.x（`packageManager` フィールドに合わせる）

```bash
pnpm install
```

## 開発

サーバ（API + WebSocket、ポート **3000**）と Vite 開発サーバ（ポート **5173**）を同時に起動します。ブラウザは **http://127.0.0.1:5173** を開いてください。Vite が `/ws` と `/health` をバックエンドへプロキシするため、フロントは同一オリジンから WebSocket に接続します。

```bash
pnpm dev
```

サーバのポートを変える場合は `PORT` を指定し、`apps/web/.env` に `VITE_DEV_API_TARGET`（例: `http://127.0.0.1:3001`）を設定してプロキシ先を合わせてください。

## ビルドと本番起動

フロントをビルドしたうえで、単一プロセスが静的ファイルと WebSocket を配信します。

```bash
pnpm start
```

- デフォルト: http://127.0.0.1:3000
- 静的ファイル: `apps/web/dist`（`index.html` がある場合のみ配信）
- 環境変数:
  - `PORT` — 待ち受けポート（既定 `3000`）
  - `STATIC_DIR` — 静的配信ディレクトリ（既定 `apps/web/dist`）

## テスト・Lint

```bash
pnpm test
pnpm lint
```

## ドキュメント

- [要件仕様書](./docs/requirements.md)
- [実装タスク](./docs/implementation-tasks.md)
- [アーキテクチャ](./docs/architecture.md)
