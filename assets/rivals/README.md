# ライバル企業社長 肖像画像

ライバル企業3社の社長の肖像画像（PNG形式、正方形 1:1）を配置するフォルダです。
仕様詳細は [docs/image-assets-specification.md](../../docs/image-assets-specification.md) を参照してください。

## 命名規則
- 光和電機（大迫社長）：`rival-kowa-osako-v1.png`
- 日之出工業（神崎社長）：`rival-hinode-kanzaki-v1.png`
- 三嶺電器（島村社長）：`rival-mine-shimamura-v1.png`

## 生成記録（2026-09-06、承認済み）

役員原画（executives-roster-v1.png）を画風参照として、まず各社長の基準ポートレート（normal相当）をElevenLabs Creative（gpt-image-2、flow_id: BjS8GTrfihfxUaWE1Oeh）で生成し、その生成結果を身元参照として表情差分2枚を直列生成。全9枚、状態: 承認済み。

### 光和電機 大迫宗助
- `rival-kowa-normal-v1.png`: 基準・不敵な自信の笑み。
- `rival-kowa-smug-v1.png`: 不敵・攻勢の笑み。
- `rival-kowa-defeated-v1.png`: 苦渋・敗北の表情。

### 日之出工業 神崎隆一郎
- `rival-hinode-normal-v1.png`: 基準・冷徹な分析眼。
- `rival-hinode-smug-v1.png`: 冷徹な勝利の笑み。
- `rival-hinode-defeated-v1.png`: 屈辱・動揺の表情。

### 三嶺電器 島村忠道
- `rival-mine-normal-v1.png`: 基準・温厚な笑み。
- `rival-mine-smile-v1.png`: 手堅い満足の笑み。
- `rival-mine-troubled-v1.png`: 困惑の表情。

