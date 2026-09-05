# 生成プロンプト例

以下はテンプレート。角括弧の部分を実際の依頼内容に置き換え、不要な部分は削除する。参照画像をツールへ渡すことが前提で、文章だけで画風の一致を保証しない。

## 共通部

```text
Use case: stylized-concept.
Asset type: [portrait / product sprite source / facility artwork] for KADEN WAR, an original Japanese home-appliance business simulation.
Input image 1: approved art-direction reference. Match its pixel-cluster density, stepped shading, dark warm outlines, restrained warm palette, and readable retro business-strategy-game illustration style.
Keep the visual finish close to the reference, not photorealistic, not 3D, not smooth anime painting, not chibi. No extra text, logos, watermark, or decorative UI frame.
```

## 新しい人物

```text
Create one original fictional [role, adult age range, appearance and outfit].
The reference is for STYLE, not the identity of the new character.
Square chest-up portrait, full hair visible with headroom, face scale and eye level matching a single cell of the reference, warm ivory background.
Expression: [expression]. Keep natural adult proportions and distinguishable facial features.
Output one portrait, not a contact sheet.
```

## 既存人物の表情差分

```text
Input image 1: approved roster, both style reference and identity source.
Target: [ID], located at [row and column] of the 3-column by 2-row sheet.
Create one square portrait of this SAME person with only the expression changed to [expression].
Preserve the face shape, age, hair silhouette and color, glasses if present, outfit and accessories, framing, head scale, background, and rendering style.
Change only the eyebrows, eyes and mouth as needed. Do not include the other characters or regenerate the whole roster.
```

個別の承認済み肖像が存在する場合は、その肖像を編集対象、一覧を画風参照として渡すよう入力説明を書き換える。

## 家電・施設

```text
Create one fictional [appliance / facility] appropriate for [game era].
Input image 1 is a reference for rendering style and palette ONLY; do not include its people or clothing.
View and composition: [front / three-quarter / game-required view], [required framing].
Recognizable features: [essential silhouette, components and materials].
Background: [warm ivory / genuinely transparent, as required by the game].
Keep the object readable at [intended display size] while matching the reference's clustered pixels, warm dark outlines and stepped shading.
```

視点・表示サイズ・透過は用途に合わせて選ぶ。生成原画の指定寸法と実際の出力寸法は別途確認する。
