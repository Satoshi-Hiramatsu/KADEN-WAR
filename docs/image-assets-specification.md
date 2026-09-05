# 家電戦争（KADEN WAR）画像アセット発注・生成仕様書

本書は、ゲーム『家電戦争』に必要な画像アセットを**別の画像生成AI（Midjourney、Stable Diffusion、DALL-E 3、FLUX、ChatGPT等）で作成する際にそのまま引き継ぎ・入力できるよう、画風、寸法、アスペクト比、プロンプト、必要画像一覧をまとめた仕様書**です。

---

## 1. アートディレクション（共通画風ガイド）

### 1-1. 正本・画風の基準
- **基準画像**: [`assets/portraits/executives-roster-v1.png`](../assets/portraits/executives-roster-v1.png)
  - 承認済みの顔原画（1536×1024、3列×2行）。
  - 別の生成AIで生成する際、**可能であればこの画像を画風参照（Image Prompt / ControlNet / Style Reference / 参考画像）として入力**してください。

### 1-2. 画風の核心（スタイル）
- **1980〜90年代の日本の名作経営シミュレーション（光栄『トップマネジメント』『エアーマネジメント』『リーディングカンパニー』やPC-9801黄金期）の風格**。
- **密度のある16bitドット絵調（ピクセルアート・スタイル）**：
  - 輪郭は**濃い焦げ茶〜墨色のくっきりしたライン**。
  - 陰影やハイライトは階調のあるドット・色面のまとまりで表現。
  - 顔立ちや製品のディテールが**48×48px〜96×96pxの小サイズに縮小されても一目で識別できる**視認性の高さ。
- **落ち着いたレトロ配色（パレット傾向）**：
  - 暖かみのあるアイボリー（#EFE9DB / #FFFDF5）、黄土色、温かい肌色、紺、深緑、えんじ・小豆色など、昭和の日本のオフィスや家電カタログを思わせるクラシックで上質なトーン。
  - 背景は原則として「**フラットな温かいアイボリー色（単色）**」または「**透過（アルファ）**」。
- **照明・構図**：
  - 正面〜斜め前からの穏やかな自然光。適度な陰影と立体感。
  - 強い逆光、サイバーパンク風のネオン発光、激しいエフェクトは避ける。

### 1-3. やってはいけないこと（禁止事項 / ネガティブプロンプト対象）
- ❌ **フォトリアル・実写写真風**
- ❌ **現代的なアニメ塗り・萌え絵・大きな目のちびキャラ（デフォルメ）**
- ❌ **滑らかな3D CGI / プラモデル風のCG質感**
- ❌ **画像内への不要な文字・アルファベット・枠線・UIの焼き込み**（ゲーム側で描画するため）
- ❌ **ネオンカラー、SF調、極端な魚眼レンズ**

---

## 2. 規格一覧（アスペクト比・解像度・出力形式）

| 用途カテゴリ | アスペクト比 | 生成推奨サイズ | 実装表示サイズ | 背景 | 出力形式 |
|---|---|---|---|---|---|
| **人物ポートレート**（役員・ライバル） | `1:1`（正方形） | 512×512 または 1024×1024 | 72×72px 〜 96×96px | 単色アイボリー（#EFE9DB） | PNG |
| **家電製品スプライト**（冷蔵庫・TV等） | `1:1`（正方形） | 512×512 または 1024×1024 | 48×48px 〜 128×128px | 透過（透過困難ならアイボリー） | PNG |
| **シーン・イベント背景**（会議・発表会） | `16:9` または `4:3` | 1024×576 または 1024×768 | 画面幅に応じて可変 | 情景背景 | PNG |

---

## 3. 必要な画像アセット一覧（発注チェックリスト）

### カテゴリA: 自社役員（6名）の表情差分
自社役員6名の基本デザインは `assets/portraits/executives-roster-v1.png` で確定済みです。  
ゲーム内での会話や会議、業績報告に合わせて**表情差分**を作成します。
（※服装・髪型・眼鏡・顔の骨格は完全に維持し、目・眉・口元の表情のみを変化させます）

| 担当 | 氏名 | 外見特徴 | 必要な表情差分 |
|---|---|---|---|
| **経営者（社長）** | 高峰 誠 | 50歳前後、ロマンスグレーのオールバック、太い眉、紺スーツ、えんじネクタイ | ① 通常・冷静<br>② 笑顔・満足（好決算・ヒット時）<br>③ 険しい・決断（危機・資金難時） |
| **設計統括** | 三枝 凛 | 35歳前後、黒髪ショートボブ、丸眼鏡、白衣、青シャツ | ① 通常・知的<br>② 閃き・熱意（新技術発見時）<br>③ 苦悩・難航（開発遅延・失敗時） |
| **販売統括** | 鳴海 達也 | 40歳前後、ウェーブがかった茶髪、ベージュスーツ、橙ネクタイ、快活 | ① 通常・快活<br>② 満面の笑み（大ヒット・シェア首位）<br>③ 焦り・汗（売上不振・在庫山積） |
| **経理統括** | 水野 智子 | 45歳前後、黒髪まとめ髪、スクエア型眼鏡、深緑スーツ、理知的 | ① 通常・冷静<br>② 微笑み・安心（黒字決算・余裕）<br>③ 厳しい警告（赤字・資金ショート警告） |
| **生産統括** | 岩瀬 修 | 50歳前後、短い白髪交じり髪、角ばった顔、青い作業着、頑固 | ① 通常・実直<br>② 誇らしげ（高品質・フル稼働達成）<br>③ 渋面・怒り（不良品続発・設備トラブル） |
| **人事統括** | 春野 佳代 | 40歳前後、肩までの栗色髪、落ち着いた紫系ジャケット、温和 | ① 通常・温和<br>② 晴れやか（社員士気最高潮・優秀採用）<br>③ 心配・気遣い（士気低下・サボタージュ危機） |

---

### カテゴリB: ライバル企業（競合他社）の社長肖像（新規3名）
光栄SLG『エアーマネジメント』や『トップマネジメント』のように、プレイヤーと熾烈なシェア争いを繰り広げるライバル企業のトップ3名です。正方形（1:1）のバストアップ。

| 会社名 | 社長名 | 経営方針 | 外観・キャラクターイメージ |
|---|---|---|---|
| **光和電機** | 大迫 宗助（おおさこ そうすけ） | **量産型・安売り攻勢**<br>「安さこそ正義！数を売って市場を制する！」 | 55歳、浅黒い肌、がっしりした体格、オールバック、派手なストライプスーツ、金ボタン。野心的で押し出しが強く、ニヤリとした不敵な笑み。叩き上げのワンマン経営者。 |
| **日之出工業** | 神崎 隆一郎（かんざき りゅういちろう） | **革新型・高級ブランド**<br>「世界最高峰の技術とデザインしか作らん」 | 52歳、細面の知性派、白髪混じりの七三分け、銀縁眼鏡、仕立ての良い高級スリーピーススーツ。職人気質で冷徹な自信を湛えた眼差し。 |
| **三嶺電器** | 島村 忠道（しまむら ただみち） | **ニッチ型・手堅い中堅**<br>「我が社は実直さと信頼で勝負する」 | 58歳、小柄で丸顔、白髪の短髪、茶色系の落ち着いたスーツ。番頭上がりのような温厚で誠実そうな風貌だが、目の奥にはしたたかさがある。 |

---

### カテゴリC: 家電製品のビジュアルスプライト
製品設計画面、カタログ、歴代名機図鑑、新製品発表会で表示する家電製品のピクセルイラスト。  
斜め前からのクォータービュー（アイソメトリック風または正面やや斜め）、1:1正方形。

| 家電カテゴリ | 時代 / モチーフ | ビジュアル特徴 |
|---|---|---|
| **冷蔵庫（1号機・初期）** | 1960年代（昭和レトロ） | 角が丸い白またはミントグリーンの単身・小型冷蔵庫。金属の大きな取っ手、上部に丸みのあるレトロデザイン。 |
| **冷蔵庫（普及型2ドア）** | 1970〜80年代 | 直線的な2ドア（上が冷凍室、下が冷蔵室）。アイボリーまたは木目調シート、マグネットドア。 |
| **洗濯機（噴流式・初期）** | 1960年代 | 丸っこい円筒形の白い洗濯槽。上部に手回し式のローラー絞り機が付いた昭和レトロ洗濯機。 |
| **洗濯機（2槽式）** | 1970年代 | 左が洗濯槽、右が脱水槽に分かれた横長の角型2槽式洗濯機。透明なプラスチック蓋、回転ダイヤル。 |
| **白黒テレビ（真空管）** | 1960年代 | 重厚な木製キャビネット（脚付き家具調）。丸みを帯びた小さなブラウン管画面、チャンネル切替ダイヤル。 |
| **カラーテレビ（家具調）** | 1970年代 | 画面が大型化した木目調家具風カラーテレビ。観音開きの扉やスピーカーグリル、押しボタン式。 |
| **小型トランジスタラジオ** | 1960〜70年代 | 革ケース付きの携帯用小型ラジオ。アナログ選局スケール、ロッドアンテナ、金属パンチングのスピーカー部。 |
| **電子レンジ（黎明期）** | 1970年代 | 電子レンジ初期の重厚な箱型。横開きの分厚い扉、大型のタイマーダイヤル、前面に注意ランプ。 |

---

### カテゴリD: シーン・イベント用イラスト（16:9 または 4:3）
ゲームの節目や重要イベントで表示し、臨場感を高めるカットシーンイラスト。

| シーン名 | 画面用途 | 情景・構図のイメージ |
|---|---|---|
| **定例役員会議室** | 毎月の会議画面の背景・ヘッダー | 昭和の重厚な本社会議室。大きな木製テーブル、革張り椅子、壁には黒板や業績グラフ、窓からは発展する日本の街並みが見える。 |
| **新製品発表会** | 新製品発売イベント時 | ホテルの宴会場のような特設会場。スポットライトが当たり、ベールを剥がされた新家電。無数の報道カメラのフラッシュが光る。 |
| **活気あふれる家電量販店 / 直営店** | 販売画面・販路拡大時 | 昭和の活気ある電気街の店頭。店頭にずらりと並ぶテレビや洗濯機、旗やポップ、買い物客で賑わう街並み。 |
| **町工場から近代コンビナート工場** | 工場画面・設備投資時 | 精密な機械が並び、青い作業着の工員たちが熱心に組み立てを行う活気ある工場の内部。 |
| **業界ニュース・新聞号外** | 突発イベント（ブーム・不況等） | セピア調の昭和の新聞紙面。太い活字の見出し、レトロな写真枠。 |

---

## 4. プロンプト具体例（別AIへのそのまま入力用）

各生成AI（Midjourney、DALL-E 3、Stable Diffusion WebUI、ChatGPT/FLUX等）にコピペして使えるプロンプトテンプレートです。

### 4-1. 共通スタイルヘッダー（プロンプトの冒頭に配置）
```text
retro 16-bit pixel art style, classic Japanese 1980s business simulation game art style, Koei retro simulation aesthetic, crisp intentional pixel clusters, limited warm retro color palette, dark brown clear outlines, stepped shading, warm ivory background, high readability as a game asset, no photorealism, no modern smooth anime shading, no 3D render, no text, no watermark
```

---

### 4-2. ライバル社長のプロンプト例

#### ① 光和電機：大迫 宗助（量産・ワンマン社長）
```text
Bust portrait of an ambitious Japanese male CEO, around 55 years old, tanned skin, stocky build, slicked-back dark hair, thick eyebrows, wearing a flashy pinstripe navy suit with gold buttons and bright orange patterned tie, bold confident smirking expression. Square 1:1 composition, chest-up view, head centered with headroom, facing slightly toward viewer, solid flat warm ivory background. Retro 16-bit strategy game pixel art style, PC-9801 aesthetic, crisp pixel clusters, defined dark outlines, no text. --ar 1:1
```

#### ② 日之出工業：神崎 隆一郎（技術至上・エリート社長）
```text
Bust portrait of an intellectual Japanese male CEO, around 52 years old, slim face, neat graying-parted hair, elegant silver-rimmed glasses, wearing a tailored charcoal three-piece suit with deep blue silk tie, sharp analytical confident expression. Square 1:1 composition, chest-up view, head centered with headroom, facing slightly toward viewer, solid flat warm ivory background. Retro 16-bit strategy game pixel art style, PC-9801 aesthetic, crisp pixel clusters, defined dark outlines, no text. --ar 1:1
```

#### ③ 三嶺電器：島村 忠道（堅実・番頭社長）
```text
Bust portrait of a prudent Japanese male CEO, around 58 years old, round gentle face, short neat silver hair, modest wrinkles around eyes, wearing a classic brown tailored suit with modest patterned tie, warm calm composed smile. Square 1:1 composition, chest-up view, head centered with headroom, facing slightly toward viewer, solid flat warm ivory background. Retro 16-bit strategy game pixel art style, PC-9801 aesthetic, crisp pixel clusters, defined dark outlines, no text. --ar 1:1
```

---

### 4-3. 家電製品のプロンプト例

#### ① 昭和レトロ 1ドア冷蔵庫（1960年代）
```text
Pixel art sprite of a vintage 1960s Japanese single-door refrigerator, rounded soft corners, retro mint green enameled steel body, classic chrome latch handle, slightly visible small freezer compartment line. Isometric three-quarter view, isolated on solid flat warm ivory background, readable silhouette. Retro 16-bit pixel art, stepped shading, dark warm outlines, no text, no logo, no surrounding scene. --ar 1:1
```

#### ② 昭和レトロ 絞り機付き丸型洗濯機（1960年代）
```text
Pixel art sprite of a vintage 1960s Japanese washing machine, rounded cylindrical white enamel tub body with four short steel legs, mechanical hand-crank wringer roller mounted on top, vintage control knob on side. Isometric three-quarter view, isolated on solid flat warm ivory background. Retro 16-bit pixel art, stepped shading, dark warm outlines, no text, no logo. --ar 1:1
```

#### ③ 家具調カラーテレビ（1970年代）
```text
Pixel art sprite of a 1970s Japanese color television set, heavy wooden console cabinet with woodgrain finish, four small tapered legs, curved CRT cathode ray tube screen showing soft gray reflection, rotary channel dial knob and speaker grille on right. Isometric three-quarter view, isolated on solid flat warm ivory background. Retro 16-bit pixel art, stepped shading, dark warm outlines, no text, no logo. --ar 1:1
```

---

### 4-4. シーン・背景のプロンプト例

#### ① 重厚な定例役員会議室（16:9）
```text
Atmospheric interior of a prestigious Japanese corporation executive boardroom in the 1970s. Heavy mahogany conference table, leather executive armchairs, chalkboard and statistical wall charts on the wood-paneled wall, large sunlit office windows overlooking a growing Showa-era Tokyo skyline. Wide shot, landscape 16:9 composition, cinematic lighting. Retro 16-bit PC-9801 strategy game pixel art style, stepped dithering, rich retro colors, nostalgic Showa business atmosphere, no people, no text. --ar 16:9
```

#### ② 新製品発表会（16:9）
```text
Dramatic stage scene of a major Japanese consumer electronics product launch event in the 1970s. Elegant hotel auditorium stage, red carpet, spotlight shining down on a pedestal where a new home appliance has just been unveiled from under a cloth, silhouettes of news reporters and press cameras with bright camera flashes in the foreground. Landscape 16:9 composition. Retro 16-bit strategy game pixel art style, dynamic lighting, no readable text. --ar 16:9
```

---

## 5. ファイル命名規則と保存先

生成した画像は、リポジトリ内の以下のディレクトリに保存してください。

```text
assets/
├── portraits/               # 自社役員（既存原画および表情差分）
│   ├── executives-roster-v1.png          (既存・正本原画)
│   ├── president-smile-v1.png            (社長：笑顔)
│   ├── president-crisis-v1.png           (社長：危機)
│   ├── design-eureka-v1.png              (設計：閃き)
│   └── ...
├── rivals/                  # ライバル企業の社長肖像
│   ├── rival-kowa-osako-v1.png           (光和電機：大迫社長)
│   ├── rival-hinode-kanzaki-v1.png       (日之出工業：神崎社長)
│   └── rival-mine-shimamura-v1.png       (三嶺電器：島村社長)
├── products/                # 家電製品スプライト
│   ├── refr-retro-1door-v1.png           (レトロ1ドア冷蔵庫)
│   ├── refr-standard-2door-v1.png        (普及型2ドア冷蔵庫)
│   ├── wash-wringer-round-v1.png         (絞り機付き洗濯機)
│   ├── wash-twin-tub-v1.png              (2槽式洗濯機)
│   ├── tv-vacuum-tube-v1.png             (真空管白黒TV)
│   ├── tv-furniture-color-v1.png         (家具調カラーTV)
│   └── ...
└── scenes/                  # シーン・背景イラスト
    ├── scene-boardroom-v1.png            (役員会議室)
    ├── scene-product-launch-v1.png       (新製品発表会)
    ├── scene-factory-floor-v1.png        (工場ライン)
    └── scene-news-headline-v1.png        (ニュース号外枠)
```

---

## 6. ゲームへの組み込み手順

1. 別の生成AIで画像を生成したら、上記命名規則に従って `assets/` 配下の該当フォルダに保存してください。
2. 保存後、チャットで「○○の画像を assets/ に追加しました」とお伝えいただければ、ゲーム画面（役員会議、製品図鑑、ライバル対決画面等）に自動的・最適にマウント・表示するコードを実装します。

