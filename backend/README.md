# 死に方図鑑｜体験データ API MVP

既存の `assets/data/experience_api_contract_v1.json` を、まずローカルで実際に動かすための最小バックエンドです。

## いま実装しているもの

- `POST /v1/responses`：回答保存。クライアントの `case_id` / `response_id` は信用せず、サーバー側でランダムIDを発行します。
- `POST /v1/withdrawals`：回答単位の撤回。成功時は回答本文と公開集計用の属性をDBから消去します。
- `GET /v1/public/stats`：匿名集計。既定では `n<10` を非表示にします。
- `POST /v1/questionnaire-evaluations`：専門家によるアンケート設計評価を、症例・体験回答とは別テーブルへ保存します。
- `POST /v1/questionnaire-evaluation-withdrawals`：専門家評価の撤回。評価本文を消去します。
- `POST /v1/contact-consents`：**意図的に未実装**。連絡先を症例DBと混ぜないため、このサービスは連絡先を受け取りません。
- AES-256-GCMによる回答本文・専門家評価本文のアプリケーション層暗号化。
- CORS許可リスト、リクエストサイズ上限、簡易レート制限。
- メールアドレス等の直接識別子らしき値を保存前に拒否する最低限のガード。

## 重要：本番収集はデフォルトでOFF

一般の体験回答は `ENABLE_WRITES=1` を明示しない限り `503 writes_disabled` になります。専門家レビューは別スイッチの `ENABLE_REVIEW_WRITES=1` でのみ有効になります。

このため、ACP等の専門家テストでは **一般ユーザーの体験投稿をOFFのまま、質問票への評価だけ受け付ける** 運用ができます。正式な同意文書、保持期間、撤回窓口、運用責任者、研究倫理・個人情報保護の確認が終わるまでは、一般回答の `ENABLE_WRITES` はOFFにしてください。

## 専門家レビュー版

`questionnaire_review.html` は、既存の統合体験フォームにアンケート設計評価UIを重ねる専用ページです。

各設問について、0〜3で以下を評価できます。

- 回答者の精神的負担になりえるか
- 倫理上不適切である可能性があるか
- 個人が特定される恐れがあるか
- 任意のコメント・改善案

最後に、アンケート全体の1〜5総合評価、問題点チェック、自由記載を入力できます。レビュー送信には**フォームへ仮入力した症例・体験の回答内容を含めず、設問への評価だけ**を送ります。

## ローカルで動かす

Node.js 22.5+ が必要です。外部npm依存はありません。

一般回答APIも含めて確認する場合：

```bash
cd backend
ALLOW_INSECURE_LOCAL_STORAGE=1 ENABLE_WRITES=1 ENABLE_REVIEW_WRITES=1 PUBLIC_MIN_CELL_SIZE=3 npm start
```

専門家レビューだけ受け付ける場合：

```bash
cd backend
ALLOW_INSECURE_LOCAL_STORAGE=1 ENABLE_WRITES=0 ENABLE_REVIEW_WRITES=1 npm start
```

別ターミナルで静的サイトを配信します。

```bash
python3 -m http.server 8000
```

その後、以下を開きます。

- `http://127.0.0.1:8000/experience_case_connected.html?api=local`
- `http://127.0.0.1:8000/experience_read_connected.html?api=local`
- `http://127.0.0.1:8000/questionnaire_review.html?api=local`

`?api=local` は localhost / 127.0.0.1 のときだけ有効です。現時点のGitHub Pages上では、このクエリを付けても送信は有効になりません。ACP等の外部テストで実際に送信を受け付けるには、APIホストを決めてHTTPSで配置し、フロント側のAPI接続先を固定する作業が必要です。

## 専門家レビュー結果を書き出す

レビュー自由記述を無認証の管理HTTP APIで公開しないため、初期運用ではサーバー上のコマンドで書き出します。

```bash
npm run export:reviews > questionnaire-reviews.json
```

暗号化を使っている場合は、API起動時と同じ `DATA_ENCRYPTION_KEY` が必要です。撤回済み評価は書き出し対象から除外されます。

## 暗号化を有効にする

本番相当の検証では、32バイト鍵を指定します。

```bash
export DATA_ENCRYPTION_KEY=$(openssl rand -hex 32)
ENABLE_REVIEW_WRITES=1 npm start
```

一般回答も有効にする場合だけ `ENABLE_WRITES=1` を追加してください。`ALLOW_INSECURE_LOCAL_STORAGE=1` はローカル開発専用です。

## 公開集計

例：

```text
GET /v1/public/stats?condition=dementia&role_group=family
```

現在の主要集計候補：

- `total_suffering_overall`
- `physical_suffering_overall`
- `caregiver_burden_overall`
- `financial_burden`
- `overall_acceptance`

各指標も、その指標に回答した件数が公開最小セルサイズ未満なら個別に抑制します。

## 次に必要な本番作業

1. DB/ホスティング先の決定（暗号化・バックアップ・アクセス制御・リージョン含む）。
2. 正式な同意文書と `consent_version` の確定。
3. データ保持期間、撤回・削除SLA、担当者、インシデント対応の確定。
4. 連絡先を扱う場合は**別サービス・別DB・別権限**で `contact-consents` を実装。
5. 自由記述の再特定リスクレビューと、公開引用の人手審査フロー。
6. 研究利用の範囲、倫理審査の要否、法令・倫理指針のローンチ時点での再確認。
7. 外部専門家レビューをオンラインで受け付ける場合は、レビューAPIのHTTPSホスト、CORS許可元、暗号鍵管理、バックアップ、閲覧権限を確定。

## テスト

```bash
npm test
```
