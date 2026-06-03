# Private Chat

Slack ライクな簡易チャットアプリケーション（閉じたネットワーク向け）。

## 前提

- [Podman](https://podman.io/)

## 開発

Vite（ホットリロード）と API サーバをコンテナ内で起動します。ブラウザは http://127.0.0.1:5173 を開いてください。

初回、依存関係（`package.json` 等）を更新したあと:

```bash
podman compose -f compose.dev.yaml up --build -d
```

起動:

```bash
podman compose -f compose.dev.yaml up -d
```

停止: `podman compose -f compose.dev.yaml down`

## 本番

ビルド済みフロントと API・WebSocket を単一プロセスで配信します。ブラウザは http://127.0.0.1:3000

初回、またはソースを更新したあと:

```bash
podman compose up --build -d
```

起動:

```bash
podman compose up -d
```

停止: `podman compose down`

## ポート番号

### 開発（`compose.dev.yaml`）

| ホスト | 用途 |
|--------|------|
| 5173 | ブラウザで開く URL（Vite。`/ws` はコンテナ内で API へプロキシ） |

ホスト側だけ変える例:

```yaml
ports:
  - "8080:5173"
```

→ http://127.0.0.1:8080。変更後は `podman compose -f compose.dev.yaml up -d` を再実行。

### 本番（`compose.yaml`）

既定はホスト **3000**（`ports: "3000:3000"`）。

ホスト側だけ変える例:

```yaml
ports:
  - "8080:3000"
```

→ http://127.0.0.1:8080。変更後は `podman compose up -d` を再実行。

コンテナ内の待ち受けポートも変える場合は、`environment.PORT`・`ports` の右側・`healthcheck` の URL を同じ番号に揃えます。

## ドキュメント

- [要件仕様書](./docs/requirements.md)
- [実装タスク](./docs/implementation-tasks.md)
- [アーキテクチャ](./docs/architecture.md)
