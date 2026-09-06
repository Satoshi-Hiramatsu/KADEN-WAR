# 担当者の顔グラフィックス台帳

- 作成日: 2026-09-05
- 承認状態: ユーザー承認済み（「グラフィックスは OK です」）。以降の画風参照の正本。
- 制作方法: 内蔵 image_gen（CLI不使用）
- ファイル: [executives-roster-v1.png](./executives-roster-v1.png)
- 構成: 1536×1024、3列×2行。各セル512×512。背景あり。
- 上段左から: president（経営者）、design（設計）、sales（販売）
- 下段左から: finance（経理）、production（生産）、personnel（人事）
- 用途: 担当別専門画面・会議用の基本表情原画。
- 確認: 6人物、配置、服装、眼鏡、異なる髪型、文字・ロゴなしを目視確認。
- 残作業: 個別スプライト化、ゲーム論理解像度への調整、表情差分、実画面48〜96pxでの識別性検証。画像生成物をそのまま厳密な16bitピクセル素材の完成版とは扱わない。
- 独自の架空人物として生成。外部の人物写真・既存ゲーム画像は入力していない。

## 生成プロンプト（実際の入力）

```text
Use case: stylized-concept. Asset type: a single character portrait roster sheet for KADEN WAR, an original Japanese home-appliance business simulation game. Create exactly SIX square bust portraits in a perfectly aligned 3 columns by 2 rows grid, equal cells, no gutters, one character centered in each cell. 1536x1024 landscape canvas preferred. Original fictional Japanese adult executives, 1960s-1980s business atmosphere, polished 16-bit era strategy-game pixel art, crisp intentional pixel clusters, limited colors, expressive faces readable as small game avatars, no photorealism, no smooth anime painting. Each cell has the same flat warm ivory background. Top left: president, man around 50, swept-back salt-and-pepper hair, thick eyebrows, navy suit and burgundy tie, composed confident smile. Top middle: chief design engineer, woman around 35, short dark bob, round glasses, ivory engineering coat over blue shirt, thoughtful keen expression. Top right: sales director, man around 40, wavy brown hair, tan suit and orange tie, energetic friendly smile. Bottom left: finance director, woman around 45, neatly tied dark hair, rectangular glasses, dark green suit, calm analytical expression. Bottom middle: production director, man around 50, broad face, short gray hair, blue factory work jacket, dependable steady expression. Bottom right: personnel director, woman around 40, shoulder-length chestnut hair, plum jacket, warm attentive expression. Consistent head scale, fully visible hair with headroom, bust ends at cell bottom, all face slightly toward viewer. No text, no labels, no logos, no watermarks, no frame, no objects crossing cells, not based on any real person.
```

専用制作スキル: [kaden-war-graphics](../../.agents/skills/kaden-war-graphics/SKILL.md)  
別生成AI向け引き継ぎ仕様書: [画像アセット発注仕様書](../../docs/image-assets-specification.md)

## 役員表情差分・NPC追加分（2026-09-06生成）

executives-roster-v1.png（原画・上書き禁止）を画風・アイデンティティ参照として、ElevenLabs Creative（gpt-image-2、flow_id: BjS8GTrfihfxUaWE1Oeh）で個別生成。全24枚、状態: 承認済み（2026-09-06 ユーザー承認）。

### president（経営者）
- `president-normal-v1.png`: 平常表情。会議・通常画面用。
- `president-smile-v1.png`: 笑顔・満足表情。好調時イベント用。
- `president-crisis-v1.png`: 険しい・危機対応表情。危機イベント用。

### design（設計）
- `design-normal-v1.png`: 平常・知的表情。
- `design-eureka-v1.png`: ひらめき・興奮表情。開発成功イベント用。
- `design-trouble-v1.png`: 困惑・トラブル表情。開発難航イベント用。
- `design-pride-v1.png`: 満足・誇り表情。

### sales（販売）
- `sales-normal-v1.png`: 平常・親しみやすい表情。
- `sales-victory-v1.png`: 勝利・歓喜表情。大型受注イベント用。
- `sales-sweat-v1.png`: 焦り・冷や汗表情。営業苦戦イベント用。
- `sales-passion-v1.png`: 熱意・売り込み表情。

### finance（経理）
- `finance-normal-v1.png`: 平常・分析的表情。
- `finance-relief-v1.png`: 安堵・満足表情。決算好転イベント用。
- `finance-warning-v1.png`: 警告・鋭い表情。資金繰り警告イベント用。
- `finance-calculating-v1.png`: 集中・計算中表情。

### production（生産）
- `production-normal-v1.png`: 平常・実直な職人表情。
- `production-proud-v1.png`: 誇り・満足表情。品質達成イベント用。
- `production-angry-v1.png`: 怒り・不満表情。トラブルイベント用。
- `production-serious-v1.png`: 真剣・注視表情（タオル追加）。

### personnel（人事）
- `personnel-normal-v1.png`: 平常・温かい傾聴表情。
- `personnel-delighted-v1.png`: 感激・喜び表情。
- `personnel-worried-v1.png`: 心配・気遣い表情。
- `personnel-motivate-v1.png`: 激励・鼓舞表情。

### NPC
- `npc-shopkeeper-v1.png`: 新規NPC。街の電器店主、ねじり鉢巻き・法被、昭和期の人情味ある笑顔。roster画風のみ参照（人物参照なし）。

各ファイルとも目視確認済み（同一人物・画風一致・文字なし）。ゲームロジック解像度への調整・実画面での識別性検証は今後の課題。

## 開発会議メンバー追加分（2026-09-06生成）

研究所の「開発会議」演出のため、設計統括の部下2名を新規追加。executives-roster-v1.png と design-normal-v1.png を画風・部門アイデンティティ参照として、ElevenLabs Creative（gpt-image-2）で個別生成。生成は16:9キャンバスのため、中央の正方形（720×720）を切り出し1024×1024へ拡大して保存。状態: 作成済み・承認待ち。

### 設計課長・設計係長（開発会議専用の脇役）
- `design-chief-normal-v1.png`: 設計課長（本庄悠、45歳前後）。角眼鏡・白衣・青シャツ。設計統括より落ち着いた表情。
- `design-associate-normal-v1.png`: 設計係長（柚木蒼太、20代後半）。眼鏡なし・グレーカーディガン。快活だが大人びた表情（初回生成はアニメ寄りに画風がぶれたため、設計課長の生成結果を追加参照にして再生成）。

いずれも目視確認済み（画風一致・輪郭の密度・文字なし・トリミング後の頭部余白）。実画面での識別性検証は今後の課題。
