# Private Chat

[![CI](https://github.com/gnkm/private-chat/actions/workflows/ci.yml/badge.svg)](https://github.com/gnkm/private-chat/actions/workflows/ci.yml)

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

## 設定（`config.jsonc`）

次を Git 管理外の `config.jsonc` で変更できます。

- **Shiki**: 投稿内コードブロックのシンタックスハイライトテーマ
- **reactions**: メッセージに付けられるリアクション絵文字の一覧

### 初回セットアップ

```bash
cp apps/web/public/config.example.jsonc apps/web/public/config.jsonc
```

`config.jsonc` は `.gitignore` 対象です。リポジトリにはテンプレートの `config.example.jsonc` のみ含まれます。

### 設定例

JSONC 形式（`//` コメント可）で、ライト／ダークそれぞれの Shiki テーマ名を指定します。

```jsonc
{
	"shiki": {
		"light": "github-light",
		"dark": "github-dark"
	},
	"reactions": {
		"emojis": ["👍", "🙏", "👀", "✨", "🔥"]
	}
}
```

- Shiki のテーマ一覧: [Shiki Themes](https://shiki.style/themes)
- `reactions.emojis` は **1 Unicode コードポイント** の絵文字のみ（`👍🏽`・国旗・ZWJ 連結など複数コードポイントは無視）。重複は除かれ、最大 32 個まで

### 反映方法

| 環境 | 手順 |
|------|------|
| 開発 | `apps/web/public/config.jsonc` を編集。Shiki はブラウザ再読み込みで反映。**リアクション絵文字を変えたら API サーバも再起動**（`pnpm dev` を止めて再実行） |
| 本番 | ビルド前に `apps/web/public/config.jsonc` を用意（`dist` に同梱される）。変更後は `podman compose up --build -d` で再ビルド |

ファイルが存在しない、または形式が不正な場合は Shiki が `github-light` / `github-dark`、リアクションが 👍 🙏 👀 ✨ の 4 種になります。

環境変数 `APP_CONFIG_PATH` で設定ファイルのパスを明示できます（サーバ起動時の読み込み用）。

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
