# 死に方図鑑｜体験データ API MVP

既存の `assets/data/experience_api_contract_v1.json` を、まずローカルで実際に動かすための最小バックエンドです。

## いま実装しているもの

- `POST /v1/responses`：回答保存。クライアントの `case_id` / `response_id` は信用せず、サーバー側でランダムIDを発行します。
- `POST /v1/withdrawals`：回答単位の撤回。成功時は回答本文と公開集計用の属性をDBから消去します。
- `GET /v1/public/stats`：匿名集計。既定では `n<10` を非表示にします。
- `POST /v1/contact-consents`：**意図的に未実装**。連絡先を症例DBと混ぜないため、このサービスは連絡先を受け取りません。
- AES-256-GCMによる回答本文のアプリケーション層暗号化。
- CORS許可リスト、リクエストサイズ上限、簡易レート制限。
- メールアドレス等の直接識別子らしき値を保存前に拒否する最低限のガード。

## 重要：本番収集はデフォルトでOFF

`ENABLE_WRITES=1` を明示しない限り、回答保存は `503 writes_disabled` になります。正式な同意文書、保持期間、撤回窓口、運用責任者、研究倫理・個人情報保護の確認が終わるまでは、このままOFFにしてください。

## ローカルで動かす

Node.js 22.5+ が必要です。外部npm依存はありません。

```bash
cd backend
ALLOW_INSECURE_LOCAL_STORAGE=1 ENABLE_WRITES=1 PUBLIC_MIN_CELL_SIZE=3 npm start
```

別ターミナルで静的サイトを配信します。

```bash
python3 -m http.server 8000
```

その後、以下を開きます。

- `http://127.0.0.1:8000/experience_case_connected.html?api=local`
- `http://127.0.0.1:8000/experience_read_connected.html?api=local`

`?api=local` は localhost / 127.0.0.1 のときだけ有効です。GitHub Pages上では、このクエリを付けても送信は有効になりません。

## 暗号化を有効にする

本番相当の検証では、32バイト鍵を指定します。

```bash
export DATA_ENCRYPTION_KEY=$(openssl rand -hex 32)
ENABLE_WRITES=1 npm start
```

`ALLOW_INSECURE_LOCAL_STORAGE=1` はローカル開発専用です。

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

## テスト

```bash
npm test
```
