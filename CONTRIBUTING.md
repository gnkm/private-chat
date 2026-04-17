# 開発ルール

## 変更の出し方（概要）

1. 本リポジトリをフォークするか、書き込み権限のある場合は直接クローンする。
2. 後述の[ブランチ命名規則](#ブランチ命名規則)に従い、作業用ブランチを `main`（または既定の既定ブランチ）から作成する。
3. [コミットメッセージ](#コミットメッセージ)の規約に従ってコミットする。
4. プルリクエスト（PR）を開き、変更内容と意図を説明する。

Issue を先に立ててから着手するかは任意ですが、大きな変更や仕様に触れる場合は、事前に議論できるとスムーズです。

## ブランチ命名規則

次の形式を推奨します。

```text
<type>/<short-description>
```

- **`type`**: 変更の種類。コミットで用いる型（[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/)）と揃えると履歴と対応しやすいです。例: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `ci`, `build`。
- **`short-description`**: 英小文字とハイフン（kebab-case）の短い説明。単語は 2〜5 語程度を目安にします。

例:

- `feat/message-pagination`
- `fix/websocket-reconnect`
- `docs/contributing-guide`
- `chore/biome-config`

Issue 番号と紐付ける場合は、次のようにしても構いません。

```text
<type>/<issue-number>-<short-description>
```

例: `fix/42-handle-empty-nickname`

次のような名前は避けてください。

- 意味のない名前（`tmp`, `wip`, `test` のみなど）
- スペースや日本語を含む名前（ツールや URL での扱いが不安定になりやすい）

## コミットメッセージ

コミットメッセージは **[Conventional Commits 1.0.0](https://www.conventionalcommits.org/ja/v1.0.0/)** に従ってください。

要点のみ抜粋します（詳細は上記仕様を参照してください）。

- 1 行目は次の形にします: `<型>[任意 スコープ]: <タイトル>`
- 新機能には `feat:`、バグ修正には `fix:` を使います。
- 必要に応じて `docs:`, `chore:`, `refactor:` など他の型も利用できます。
- 破壊的変更は、型の直後に `!` を付けるか、本文・フッターに `BREAKING CHANGE:` を記述します。
- タイトルのあとに本文を書く場合は、**1 行空けて**から本文を書きます。

例:

```text
feat(ws): add heartbeat to detect stale connections

fix: reject messages exceeding max length

docs: align CONTRIBUTING with Conventional Commits
```

1 つのコミットに複数の無関係な変更を詰め込まず、レビューしやすい単位に分割することを推奨します。

## プルリクエスト

- **説明**: 何を変えたか、なぜ変えたかを簡潔に書いてください。UI の変更は可能ならスクリーンショットや動画があると助かります。
- **要件との関係**: 挙動や制約に関わる変更は、[要件仕様書（SRS）](docs/requirements.md) や関連 Issue と矛盾がないか確認してください。
- **レビュー**: 指摘に対しては返信または追加コミットで対応してください。マージ方針（squash など）はリポジトリの運用に従います。

## コードと品質

技術選定とツールの前提は [技術スタック](docs/tech-stack.md) にまとめています。実装が入ったあとは、次を守ってください。

- **パッケージマネージャ**: **pnpm**（ワークスペース方針に従う）。
- **Lint / フォーマット**: **Biome** の設定に従う（プロジェクトに `biome.json` 等が追加されたら、提出前にチェックを通す）。
- **型**: TypeScript の厳格な設定に合わせ、可能な限り型安全に書く。

CI や `package.json` のスクリプトが追加されたら、PR 前に `lint` / `test` / `build` 等を実行することを求める場合があります。そのときは README または本書を更新します。

## ライセンス

本リポジトリは [MIT License](LICENSE) です。貢献物も同ライセンスの下で提供されるものとして取り扱われます。
