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
