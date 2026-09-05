# 家電戦争（KADEN WAR）画像生成指示書（包括発注シート）

本書は、ゲーム『家電戦争』に登場する全グラフィックス素材を**別の画像生成AI（Midjourney、Stable Diffusion、DALL-E 3、FLUX、ChatGPT等）で一括制作・調達するための完全指示書**です。

---

## 目次
1. [全体レギュレーション（共通画風仕様）](#1-全体レギュレーション共通画風仕様)
2. [【カテゴリ1】背景・ロケーション・シーン画像（16:9）](#2-カテゴリ1背景ロケーションシーン画像169)
3. [【カテゴリ2】人物ポートレート・キャラクター（1:1）](#3-カテゴリ2人物ポートレートキャラクター11)
4. [【カテゴリ3】家電・製品スプライト（1:1）](#4-カテゴリ3家電製品スプライト11)
5. [画像保存先のディレクトリ構造一覧](#5-画像保存先のディレクトリ構造一覧)

---

## 1. 全体レギュレーション（共通画風仕様）

- **スタイル正本**: [`assets/portraits/executives-roster-v1.png`](../assets/portraits/executives-roster-v1.png)
  - 承認済みの顔原画の描画密度、色面構成、陰影表現を基準とします。
- **作風テイスト**:
  - 1980〜1990年代の日本の名作経営シミュレーション（光栄『トップマネジメント』『エアーマネジメント』『リーディングカンパニー』やPC-9801黄金期）の重厚で洗練された16bitピクセルアート調。
  - 輪郭線は**濃い焦げ茶〜墨色のくっきりしたライン**。
  - 色彩は**昭和のオフィスやカタログを思わせる温かみのある落ち着いたトーン**（アイボリー、黄土、紺、深緑、エンジ、茶）。
  - 人物や製品の背景は基本的に**単色アイボリー（#EFE9DB）または透過**。
- **全AI共通スタイルプロンプト（プロンプト冒頭または末尾に付加）**:
  ```text
  retro 16-bit pixel art style, classic Japanese 1980s business simulation game art style, PC-9801 aesthetic, crisp intentional pixel clusters, limited warm retro color palette, dark brown clear outlines, stepped shading, high readability as a game asset, no photorealism, no modern smooth anime shading, no 3D render, no text, no watermark
  ```

---

## 2. 【カテゴリ1】背景・ロケーション・シーン画像（16:9）

ゲームのメイン画面背景、モーダル、イベント演出、月次会議などで使用する情景イラストです。
**推奨アスペクト比: `16:9`（1024×576 または 1280×720）**

---

### SCENE-01: 社長室・経営司令室
- **保存場所**: `assets/scenes/`
- **ファイル名**: `scene-office-day-v1.png`（昼・通常）、`scene-office-night-v1.png`（夜・残業）、`scene-office-crisis-v1.png`（危機）
- **用途**: 社長室画面のメインヘッダー・背景、年度方針発表、経営状況の象徴。
- **詳細内容**:
  - 昭和の日本の重役室。重厚な黒革の役員椅子、木目が美しいマホガニーの大型デスク。机上には黒電話、万年筆、決裁書類の山。
  - 壁には日本地図、全社スローガンの額縁（文字は抽象化）、金庫。大きな窓からは昭和のビル群と東京タワー（または工場地帯）が見える。
- **複数パターン指示**:
  - **パターンA（昼・通常）**: 窓から爽やかな陽光が差し込み、活気ある日本の成長を感じさせる雰囲気。
  - **パターンB（夜・残業）**: デスクライトだけが灯り、窓の外にはビルの夜景。孤独なトップの決断を演出。
  - **パターンC（資金難・危機）**: 曇天・雨の窓の外。書類が散らかり、重苦しい緊迫感のあるセピア調のトーン。
- **生成用プロンプト案（パターンA）**:
  ```text
  Interior of a prestigious Japanese CEO executive office in the 1960s-1970s. Heavy mahogany executive desk, vintage black rotary telephone, leather armchair, brass desk lamp, vintage safe in the corner, framed map on wood-paneled wall. Large sunny office window with sunlight streaming in, showing distant retro cityscape skyline. Landscape 16:9 composition, retro 16-bit strategy game pixel art style, warm nostalgic atmosphere, no people, no text. --ar 16:9
  ```

---

### SCENE-02: 定例役員会議室
- **保存場所**: `assets/scenes/`
- **ファイル名**: `scene-boardroom-normal-v1.png`（通常）、`scene-boardroom-heated-v1.png`（激論/危機）、`scene-boardroom-victory-v1.png`（好決算）
- **用途**: 月初の「定例役員会議」画面のメイン背景。
- **詳細内容**:
  - 各部門統括が一堂に会する重厚な会議室。楕円形の長い大会議テーブル、マイク、灰皿、メモ帳、冷茶の湯呑み。
  - 正面壁面には黒板（売上棒グラフや目標がチョークで書かれている風）、横には製品性能比較表。
- **複数パターン指示**:
  - **パターンA（通常会議）**: 整然とした落ち着いた会議室。自然光が入り、定例報告に適した雰囲気。
  - **パターンB（激論・危機）**: 煙草の煙が漂うような緊張感ある照明。夕暮れ時。業績悪化やライバル攻勢に対抗する緊迫感。
  - **パターンC（好決算・祝勝）**: 明るく晴れやか。黒板のグラフが右肩上がりで、全員が達成感を味わう雰囲気。
- **生成用プロンプト案（パターンA）**:
  ```text
  Interior of a classic Japanese corporate boardroom meeting room in the 1970s. Long oval wooden conference table with leather chairs, green chalkboard on the wood-paneled wall with chalk business charts, retro tea cups and notepads on the table. Wide shot, landscape 16:9 composition. Retro 16-bit PC-9801 strategy game pixel art style, stepped dithering, rich retro colors, nostalgic business atmosphere, no people, no text. --ar 16:9
  ```

---

### SCENE-03: 研究所・開発室（R&D現場）
- **保存場所**: `assets/scenes/`
- **ファイル名**: `scene-lab-workshop-v1.png`（初期町工場開発）、`scene-lab-modern-v1.png`（近代的R&D）、`scene-lab-breakthrough-v1.png`（技術革新・閃き）
- **用途**: 研究所画面のメイン背景、新技術開発完了演出。
- **詳細内容**:
  - **パターンA（初期・町工場研究所 / 1960s）**:
    - 木製の作業台の上に所狭しと並ぶオシロスコープ、真空管、半田ごて、散らばった回路図面、分解されたモーターやトランス。職人技と工夫の現場。
  - **パターンB（近代R&Dセンター / 1980s以降）**:
    - クリーンルーム風の白い部屋。大型計測器、初期のCRTモニター付きコンピューター（CAD/解析機）、整然と並ぶ電子基板。
  - **パターンC（技術突破・閃き）**:
    - 暗い実験室で試作機の真空管や電子回路が青白く光り、技術者が大発見をした瞬間のような劇的なライティング。
- **生成用プロンプト案（パターンA）**:
  ```text
  Interior of an early Japanese electronics research laboratory and workshop in the 1960s. Wooden workbenches cluttered with vintage cathode-ray oscilloscopes, vacuum tubes, soldering irons, copper coils, mechanical blueprints spread out, tools hanging on pegboard wall. Cozy warm ambient lighting, landscape 16:9 composition. Retro 16-bit pixel art style, detailed pixel clusters, nostalgic Showa engineering spirit, no people, no text. --ar 16:9
  ```

---

### SCENE-04: 工場・製造ライン（生産現場）
- **保存場所**: `assets/scenes/`
- **ファイル名**: `scene-factory-early-v1.png`（手作業ライン）、`scene-factory-modern-v1.png`（オートメーション）、`scene-factory-night-v1.png`（夜間フル稼働）、`scene-factory-trouble-v1.png`（ライン停止/不良）
- **用途**: 工場画面のメイン背景、設備投資完了時、生産トラブル発生時。
- **詳細内容**:
  - **パターンA（1960s 手作業組立ライン）**:
    - ベルトコンベアに沿って木製作業台が並び、冷蔵庫や洗濯機のスチールキャビネットが組み立てられていく活気ある工場風景。天井にはクレーンと蛍光灯。
  - **パターンB（1980s 自動化大型工場）**:
    - 近代的なプレス機械、溶接ロボットアーム、整然と流れるプリント基板。大量生産と品質管理の迫力。
  - **パターンC（夜間フル稼働）**:
    - 増産体制で夜通し稼働する工場。窓から漏れるオレンジの光、蒸気や火花が舞う活気ある夜景。
  - **パターンD（ライン停止・トラブル）**:
    - 赤い警告ランプが回転灯として点滅し、コンベアが止まった静寂とトラブルの緊迫感。
- **生成用プロンプト案（パターンA）**:
  ```text
  Interior of a bustling Japanese home appliance manufacturing factory floor in the 1960s. Conveyor belt assembly line with vintage washing machine steel bodies and refrigerator cabinets in progress, industrial overhead crane, hanging fluorescent lights, factory windows with daylight. Landscape 16:9 composition, retro 16-bit strategy game pixel art style, industrial color palette, no people, no text. --ar 16:9
  ```

---

### SCENE-05: 販売店・市場チャネル（街の風景）
- **保存場所**: `assets/scenes/`
- **ファイル名**: `scene-market-shop-v1.png`（街の系列電器店）、`scene-market-akiba-v1.png`（電気街・秋葉原風）、`scene-market-mass-v1.png`（大型量販店）
- **用途**: 販売本部画面背景、販路開設・契約時、市場動向イベント。
- **詳細内容**:
  - **パターンA（昭和の系列電器店・直営店 / 1960s）**:
    - 商店街の一角にある町の電器店。店頭には看板、日除けテント、誇らしげに並べられた白黒テレビと丸型洗濯機。買い物かごを持った主婦たちが行き交う昭和の下町。
  - **パターンB（電気街・秋葉原風 / 1970〜80s）**:
    - ネオンと看板がひしめく電気街の雑踏。オーディオやテレビのスピーカーから音が響き、新製品を求める若者や客で溢れかえる熱気。
  - **パターンC（大型家電量販店 / 1990s以降）**:
    - 広大なフロアにテレビやパソコンが壁一面に並ぶメガストア。派手なプライスカードと積み上げられた在庫カートン。
- **生成用プロンプト案（パターンA）**:
  ```text
  Street view of a nostalgic Japanese town electronics retail store (machidenki) in the 1960s. Showa-era shopping street storefront with canvas awning, vintage display window showcasing a CRT television set and rounded refrigerator, paper promotional banners, bicycles parked. Warm sunny afternoon atmosphere, landscape 16:9 composition. Retro 16-bit pixel art style, charming retro Japanese town aesthetic, no text, no recognizable real logos. --ar 16:9
  ```

---

### SCENE-06: 新製品記者発表会・見本市
- **保存場所**: `assets/scenes/`
- **ファイル名**: `scene-event-launch-v1.png`（新製品発表会）、`scene-event-expo-v1.png`（家電エキスポ・展示会）
- **用途**: 自社が新製品を発売した瞬間のカットイン演出、年間ヒット商品発表。
- **詳細内容**:
  - **パターンA（新製品発表会）**:
    - 高級ホテルの宴会場ステージ。中央の演台にスポットライトが当たり、真新しい新製品（ベールが剥がされた瞬間）。手前には記者たちのシルエットと無数のカメラフラッシュ。
  - **パターンB（家電見本市・エキスポ）**:
    - 巨大展示ホールの自社ブース。先進的なデザインのブース装飾、コンパニオン、製品のデモを見つめる黒山の人だかり。
- **生成用プロンプト案（パターンA）**:
  ```text
  Dramatic stage scene of a major Japanese consumer electronics product launch press conference in the 1970s. Hotel ballroom stage with red carpet, bright spotlights illuminating a newly unveiled appliance on a central pedestal, silhouettes of press reporters and vintage news cameras with flashing light effects in the foreground. Landscape 16:9 composition. Retro 16-bit pixel art style, high contrast, dramatic excitement, no text. --ar 16:9
  ```

---

### SCENE-07: 時代イベント・業界ニュース速報（号外背景）
- **保存場所**: `assets/scenes/`
- **ファイル名**: `scene-news-paper-v1.png`（新聞号外・速報枠）、`scene-event-boom-v1.png`（好況・三種の神器）、`scene-event-recession-v1.png`（オイルショック・不況）
- **用途**: 突発イベント発生時（オイルショック、バブル、特需など）の号外ポップアップ背景。
- **詳細内容**:
  - **パターンA（新聞号外枠）**:
    - セピア色に日焼けした昭和の新聞紙面風フレーム。上部に「号外」「電化時報」風のレトロ飾り枠、中央にニュース挿絵スペース。
  - **パターンB（高度成長・三種の神器ブーム）**:
    - 新しい団地に引っ越し、テレビや冷蔵庫が運び込まれて歓喜する日本の一般家庭の情景。希望に満ちた明るい色彩。
  - **パターンC（不況・オイルショック・原料高）**:
    - 灯りが消えた夜の街並み、トイレットペーパーを求めて並ぶ人波や、工場の煙突から煙が途絶えた静けさ。寒色系のシリアスなトーン。
- **生成用プロンプト案（パターンA）**:
  ```text
  Vintage Showa Japanese newspaper extra (gogai) broadsheet background frame. Aged sepia parchment paper texture, retro ornate woodblock-style header border, empty central illustrated column area for news pictures, subtle halftone dot printing effect. 16:9 landscape aspect ratio, retro 16-bit pixel art aesthetic, no readable English or real letters. --ar 16:9
  ```

---

## 3. 【カテゴリ2】人物ポートレート・キャラクター（1:1）

ゲーム内で対話・報告・会議を行うキャラクターの肖像画です。
**推奨アスペクト比: `1:1` 正方形（512×512 または 1024×1024）**
**構図: 胸上（バストアップ）、頭上に適度な余白、背景は単色アイボリー（#EFE9DB）**

---

### CHAR-01: 自社経営者（社長） 高峰 誠
- **保存場所**: `assets/portraits/`
- **基準画像**: `assets/portraits/executives-roster-v1.png` の上段左 (0, 0)
- **特徴**: 50歳前後、後ろに流したロマンスグレーの白髪交じり髪、太い眉、紺のスーツ、えんじ色のネクタイ。
- **表情差分ファイル名と用途**:
  1. `president-normal-v1.png`: 【通常】冷静で頼もしい眼差し。社長室の通常表示。
  2. `president-smile-v1.png`: 【笑顔・満足】目を細めて笑みを浮かべる。好決算、新製品ヒット、シェア首位時。
  3. `president-crisis-v1.png`: 【険しい・危機】眉間に皺を寄せ、口元を引き締めた決断の表情。赤字、資金ショート警告時。
  4. `president-speaking-v1.png`: 【発言・演説】口を開き、前を見据えて指示を出す。役員会議での決断時。
- **生成用プロンプト案（笑顔差分）**:
  ```text
  Input image 1: approved roster reference. Bust portrait of the president (top-left character: Japanese man around 50, swept-back salt-and-pepper hair, thick eyebrows, navy suit, burgundy tie). Create the SAME person with a warm delighted smiling expression, eyes curved with gentle pride, confident friendly CEO smile. Square 1:1 bust portrait, head centered, flat warm ivory background. Retro 16-bit strategy game pixel art style, PC-9801 aesthetic, dark brown outlines, no text. --ar 1:1
  ```

---

### CHAR-02: 設計統括 三枝 凛
- **保存場所**: `assets/portraits/`
- **基準画像**: `assets/portraits/executives-roster-v1.png` の上段中央 (512, 0)
- **特徴**: 35歳前後、黒髪ショートボブ、丸眼鏡、白衣の下に青いシャツ、理知的。
- **表情差分ファイル名と用途**:
  1. `design-normal-v1.png`: 【通常】冷静で知的な観察眼。研究所の通常表示。
  2. `design-eureka-v1.png`: 【閃き・熱意】眼鏡の奥の目が輝き、新しい回路やアイデアを閃いた高揚感。研究完了、新仕様提案時。
  3. `design-trouble-v1.png`: 【苦悩・困惑】眼鏡に手をやり、眉をひそめて考え込む。開発遅延、性能目標未達時。
  4. `design-pride-v1.png`: 【誇り・達成】胸を張り、満足げに微笑む。新製品の設計完了時。
- **生成用プロンプト案（閃き差分）**:
  ```text
  Input image 1: approved roster reference. Bust portrait of the chief design engineer (top-middle character: Japanese woman around 35, short dark bob hair, round glasses, white engineering lab coat over blue shirt). Create the SAME person with an excited inspired Eureka expression, bright wide intelligent eyes behind glasses, passionate confident smile as if discovering a breakthrough. Square 1:1 bust portrait, head centered, flat warm ivory background. Retro 16-bit pixel art style, no text. --ar 1:1
  ```

---

### CHAR-03: 販売統括 鳴海 達也
- **保存場所**: `assets/portraits/`
- **基準画像**: `assets/portraits/executives-roster-v1.png` の上段右 (1024, 0)
- **特徴**: 40歳前後、少しウェーブした茶髪、明るいベージュのスーツ、橙色のネクタイ、快活な営業マン。
- **表情差分ファイル名と用途**:
  1. `sales-normal-v1.png`: 【通常】人懐っこい爽やかな笑顔。販売本部の通常表示。
  2. `sales-victory-v1.png`: 【ガッツポーズ・大喜び】歯を見せて快活に笑う。週間販売目標達成、シェア1位獲得時。
  3. `sales-sweat-v1.png`: 【焦り・冷や汗】眉を八の字にして額に汗を浮かべる。競合の値下げ攻勢、売れ残り在庫山積時。
  4. `sales-passion-v1.png`: 【熱血・提案】前傾姿勢で身を乗り出し熱弁を振るう。大規模広告キャンペーンや新規出店提案時。
- **生成用プロンプト案（焦り差分）**:
  ```text
  Input image 1: approved roster reference. Bust portrait of the sales director (top-right character: Japanese man around 40, wavy brown hair, tan beige suit, orange tie). Create the SAME person with an anxious troubled flustered expression, sweat drop on temple, furrowed eyebrows, worried tense smile. Square 1:1 bust portrait, head centered, flat warm ivory background. Retro 16-bit pixel art style, no text. --ar 1:1
  ```

---

### CHAR-04: 経理統括 水野 智子
- **保存場所**: `assets/portraits/`
- **基準画像**: `assets/portraits/executives-roster-v1.png` の下段左 (0, 512)
- **特徴**: 45歳前後、きっちりまとめた黒髪、角型眼鏡、深緑のスーツ、厳格で正確無比。
- **表情差分ファイル名と用途**:
  1. `finance-normal-v1.png`: 【通常】冷徹で正確な分析眼。経理部の通常表示。
  2. `finance-relief-v1.png`: 【安堵・微小】口元にわずかな優しい微笑み。黒字決算達成、借入金完済時。
  3. `finance-warning-v1.png`: 【厳しい警告・怒り】眼鏡を指で押し上げ、鋭い視線で睨む。赤字転落、資金ショート目前の警告時。
  4. `finance-calculating-v1.png`: 【計算・思案】帳簿や電卓を見下ろすような伏し目がちの集中した顔。資金計画立案時。
- **生成用プロンプト案（警告差分）**:
  ```text
  Input image 1: approved roster reference. Bust portrait of the finance director (bottom-left character: Japanese woman around 45, neatly tied dark hair, rectangular glasses, dark green suit). Create the SAME person with a stern sharp alarming warning expression, pushing up glasses, piercing analytical glare, strict tightened lips. Square 1:1 bust portrait, head centered, flat warm ivory background. Retro 16-bit pixel art style, no text. --ar 1:1
  ```

---

### CHAR-05: 生産統括 岩瀬 修
- **保存場所**: `assets/portraits/`
- **基準画像**: `assets/portraits/executives-roster-v1.png` の下段中央 (512, 512)
- **特徴**: 50歳前後、短い白髪交じりの髪、角ばった頑固な顔立ち、青い工場の作業着、現場叩き上げ。
- **表情差分ファイル名と用途**:
  1. `production-normal-v1.png`: 【通常】実直で頼もしい職人の顔。工場の通常表示。
  2. `production-proud-v1.png`: 【誇り・満足】腕組みをして豪快に笑う。不良率ゼロ達成、新設備フル稼働時。
  3. `production-angry-v1.png`: 【苦渋・怒り】眉を逆立てて渋面を作る。不良品多発、設備故障、無理な増産命令時。
  4. `production-serious-v1.png`: 【真剣・現場気質】タオルを首に巻き、真剣な眼差しでラインを見つめる。合理化・歩留まり改善時。
- **生成用プロンプト案（誇り差分）**:
  ```text
  Input image 1: approved roster reference. Bust portrait of the production director (bottom-middle character: Japanese man around 50, broad rugged face, short gray hair, blue factory work jacket). Create the SAME person with a proud dependable hearty smile, satisfied rugged expression of a veteran factory master. Square 1:1 bust portrait, head centered, flat warm ivory background. Retro 16-bit pixel art style, no text. --ar 1:1
  ```

---

### CHAR-06: 人事統括 春野 佳代
- **保存場所**: `assets/portraits/`
- **基準画像**: `assets/portraits/executives-roster-v1.png` の下段右 (1024, 512)
- **特徴**: 40歳前後、肩までの栗色の髪、紫系の落ち着いたジャケット、包容力と芯の強さ。
- **表情差分ファイル名と用途**:
  1. `personnel-normal-v1.png`: 【通常】温和で話を聞く姿勢の優しい顔。人事部の通常表示。
  2. `personnel-delighted-v1.png`: 【晴れやか・感動】両手を胸元に添えるように喜ぶ。優秀な新卒採用、社員士気100点達成時。
  3. `personnel-worried-v1.png`: 【心配・憂慮】眉を寄せて心配そうに見つめる。社員士気の低下、離職増加、ストライキ予告時。
  4. `personnel-motivate-v1.png`: 【激励・芯の強さ】力強く微笑み、社員を励ます。研修実施、特別賞与支給時。
- **生成用プロンプト案（心配差分）**:
  ```text
  Input image 1: approved roster reference. Bust portrait of the personnel director (bottom-right character: Japanese woman around 40, shoulder-length chestnut hair, plum purple jacket). Create the SAME person with a compassionate worried concerned expression, softly troubled eyes, gently furrowed brows, caring empathetic look. Square 1:1 bust portrait, head centered, flat warm ivory background. Retro 16-bit pixel art style, no text. --ar 1:1
  ```

---

### CHAR-07: ライバル企業3社の社長（新規作成）
- **保存場所**: `assets/rivals/`
- **用途**: ライバル企業の動向速報、新製品発表ニュース、決算時の他社比較。

#### 1. 光和電機：大迫 宗助（おおさこ そうすけ）
- **ファイル名**: `rival-kowa-normal-v1.png`（通常）、`rival-kowa-smug-v1.png`（不敵・攻勢）、`rival-kowa-defeated-v1.png`（苦渋・敗北）
- **キャラクター詳細**:
  - 55歳、浅黒い肌、がっしりした体格、オールバックの黒髪、派手なストライプのネイビースーツに金ボタン、オレンジのネクタイ。
  - 「薄利多売・量産至上主義」。叩き上げのワンマン経営者で、ニヤリとした不敵な笑みがトレードマーク。
- **生成用プロンプト案**:
  ```text
  Bust portrait of an ambitious rival Japanese CEO, man around 55 years old, tanned skin, stocky build, slicked-back dark hair, thick eyebrows, wearing a flashy pinstripe navy suit with gold buttons and bright orange patterned tie, bold confident smirking expression. Square 1:1 composition, chest-up view, head centered with headroom, facing slightly toward viewer, solid flat warm ivory background. Retro 16-bit strategy game pixel art style, PC-9801 aesthetic, crisp pixel clusters, defined dark outlines, no text. --ar 1:1
  ```

#### 2. 日之出工業：神崎 隆一郎（かんざき りゅういちろう）
- **ファイル名**: `rival-hinode-normal-v1.png`（通常）、`rival-hinode-smug-v1.png`（冷徹な勝利）、`rival-hinode-defeated-v1.png`（屈辱・動揺）
- **キャラクター詳細**:
  - 52歳、細面の知性派、白髪交じりの七三分け、銀縁の丸眼鏡またはスクエア眼鏡、仕立ての良いチャコールグレーのスリーピース高級スーツに濃紺のシルクタイ。
  - 「技術至上主義・高級ブランド志向」。職人気質とエリートの誇りを持つ冷徹な完璧主義者。
- **生成用プロンプト案**:
  ```text
  Bust portrait of an intellectual rival Japanese CEO, man around 52 years old, slim refined face, neat graying-parted hair, elegant silver-rimmed glasses, wearing a tailored charcoal three-piece suit with deep blue silk tie, sharp analytical confident expression. Square 1:1 composition, chest-up view, head centered with headroom, facing slightly toward viewer, solid flat warm ivory background. Retro 16-bit strategy game pixel art style, PC-9801 aesthetic, crisp pixel clusters, defined dark outlines, no text. --ar 1:1
  ```

#### 3. 三嶺電器：島村 忠道（しまむら ただみち）
- **ファイル名**: `rival-mine-normal-v1.png`（通常）、`rival-mine-smile-v1.png`（手堅い笑顔）、`rival-mine-troubled-v1.png`（困惑）
- **キャラクター詳細**:
  - 58歳、丸顔で小柄、白髪の短い頭、目尻の笑い皺、地味だが上質な茶色やグレーのツイードスーツ、落ち着いた小紋タイ。
  - 「堅実経営・地域密着」。番頭上がりのような腰の低い温厚な笑顔の持ち主だが、無駄な投資をしない老獪な経営者。
- **生成用プロンプト案**:
  ```text
  Bust portrait of a prudent rival Japanese CEO, man around 58 years old, round gentle face, short neat silver hair, modest wrinkles around eyes, wearing a classic brown tailored suit with modest patterned tie, warm calm composed smile. Square 1:1 composition, chest-up view, head centered with headroom, facing slightly toward viewer, solid flat warm ivory background. Retro 16-bit strategy game pixel art style, PC-9801 aesthetic, crisp pixel clusters, defined dark outlines, no text. --ar 1:1
  ```

---

### CHAR-08: サブキャラクター・NPC（イベント用）
- **保存場所**: `assets/portraits/`
- **用途**: 銀行借入交渉、取材イベント、販売店交渉時。
  1. `npc-banker-v1.png`: 【メインバンク支店長】50歳、七三分け、黒縁眼鏡、ダークスーツ、電卓や契約書を持つ堅物銀行マン。
  2. `npc-journalist-v1.png`: 【家電業界記者】30代、腕まくりしたワイシャツ、メモ帳とペン、カメラを首から下げた熱血記者。
  3. `npc-shopkeeper-v1.png`: 【町の電器店店主】55歳、ねじり鉢巻きまたは店の法被（はっぴ）、人の良さそうな昭和の親父。

---

## 4. 【カテゴリ3】家電・製品スプライト（1:1）

新製品設計画面、自社カタログ、市場比較、歴代名機図鑑で表示する家電製品のピクセルアートです。
**推奨アスペクト比: `1:1` 正方形（512×512 または 1024×1024）**
**構図: クォータービュー（斜め前からの見下ろしアイソメトリック風、または正面やや斜め）**
**背景: 単色アイボリー（#EFE9DB）または透過（アルファ）**

---

### PROD-01: 冷蔵庫（Refrigerators）
- **保存場所**: `assets/products/`
- **バリエーション一覧**:
  1. `refr-1960-1door-v1.png`: 【1960年代 昭和レトロ 1ドア丸型】
     - 丸みを帯びた小型の単身・家族用冷蔵庫。ミントグリーンまたは純白のホーロー塗装。金属製の頑丈なラッチハンドル、上部に小さな氷室。
  2. `refr-1970-2door-v1.png`: 【1970年代 普及型 2ドア角型】
     - 上が冷凍室、下が冷蔵室に分かれた直線的デザイン。アイボリーまたは落ち着いた木目調の化粧板。マグネット式ドア。
  3. `refr-1980-3door-v1.png`: 【1980年代 大型ファン式 3ドア野菜室付き】
     - 自動製氷や野菜室を備えた大型ファミリー冷蔵庫。シックなダークブラウンやワインレッド、大容量。
  4. `refr-2000-french-v1.png`: 【2000年代 フレンチドア（観音開き）高級機】
     - ステンレススチールまたはガラストップの現代的な両開き冷蔵庫。液晶操作パネル付き。
- **生成用プロンプト案（1960年代 1ドア）**:
  ```text
  Pixel art sprite of a vintage 1960s Japanese single-door refrigerator, rounded soft corners, retro mint green enameled steel body, classic chrome latch handle, vintage temperature badge on door. Isometric three-quarter view, isolated on solid flat warm ivory background, clean recognizable silhouette. Retro 16-bit pixel art style, stepped shading, dark warm outlines, no text, no brand logo. --ar 1:1
  ```

---

### PROD-02: 洗濯機（Washing Machines）
- **保存場所**: `assets/products/`
- **バリエーション一覧**:
  1. `wash-1960-wringer-v1.png`: 【1960年代 噴流式 手回し絞り機付き】
     - 円筒形の白い洗濯槽に4本の短いスチール脚。上部に手動で洗濯物を挟んで回すゴムローラー絞り機が載った昭和の象徴。
  2. `wash-1970-twintub-v1.png`: 【1970年代 二槽式洗濯機（洗濯・脱水独立）】
     - 横長の角型ボディ。左に透明なプラスチック蓋の洗濯槽、右に高速回転する脱水槽。青や緑のレトロな操作ダイヤル。
  3. `wash-1980-automatic-v1.png`: 【1980年代 全自動洗濯機】
     - 1つの槽で洗い・すすぎ・脱水まで全自動で行う縦型洗濯機。プッシュボタン式の電子制御パネル。
  4. `wash-2000-drum-v1.png`: 【2000年代 ドラム式洗濯乾燥機】
     - 斜めドラムの丸いガラス窓が前面に配置されたスタイリッシュな洗濯乾燥機。メタリックシルバー。
- **生成用プロンプト案（1970年代 二槽式）**:
  ```text
  Pixel art sprite of a vintage 1970s Japanese twin-tub washing machine, rectangular body with two separate tubs (wash tub on left with translucent green lid, spin-dry tub on right), mechanical rotary timer knobs and drain switches. Isometric three-quarter view, isolated on solid flat warm ivory background. Retro 16-bit pixel art style, stepped shading, dark outlines, no text. --ar 1:1
  ```

---

### PROD-03: テレビ・映像機器（Televisions & VTR）
- **保存場所**: `assets/products/`
- **バリエーション一覧**:
  1. `tv-1960-blackwhite-v1.png`: 【1960年代 真空管 白黒テレビ（三種の神器）】
     - 4本脚付きの木製家具調キャビネット。小さな丸みを帯びたブラウン管画面、右側にチャンネル切替の「ガチャガチャ」回転ダイヤル。
  2. `tv-1970-color-console-v1.png`: 【1970年代 家具調カラーテレビ】
     - 観音開きの木製扉や豪華なスピーカーグリルが付いた重厚なカラーテレビ。お茶の間の王様。
  3. `tv-1980-crt-hifi-v1.png`: 【1980年代 フラットスクエアCRT 高画質テレビ】
     - 黒またはダークグレーのAV指向テレビ。平面ブラウン管、ステレオスピーカー内蔵、リモコン受光部。
  4. `tv-2000-flat-lcd-v1.png`: 【2000年代 薄型液晶テレビ】
     - ワイド画面の薄型フラットパネルテレビ。シルバーまたはピアノブラックのベゼル、薄型スタンド。
  5. `vtr-1970-topload-v1.png`: 【1970年代 初期型据え置き家庭用ビデオデッキ】
     - カセットが上から飛び出すトップローディング式。機械式のピアノキー型ボタン、アナログ時計タイマー。
  6. `vtr-1980-hifi-deck-v1.png`: 【1980年代 フロントローディング Hi-Fiビデオデッキ】
     - カセットが前面スロットに吸い込まれる現代型。デジタル蛍光表示管、ジョグダイヤル。
- **生成用プロンプト案（1960年代 白黒テレビ）**:
  ```text
  Pixel art sprite of a vintage 1960s Japanese black-and-white television set, wooden console cabinet standing on four slender tapered legs, curved cathode-ray tube screen, large rotary channel knob and volume dials on the right panel, fabric speaker grille. Isometric three-quarter view, isolated on solid flat warm ivory background. Retro 16-bit pixel art style, warm nostalgic Showa feel, no text. --ar 1:1
  ```

---

### PROD-04: 音響・オーディオ機器（Audio Devices）
- **保存場所**: `assets/products/`
- **バリエーション一覧**:
  1. `audio-1960-transistor-radio-v1.png`: 【1960年代 ポータブル・トランジスタラジオ】
     - 本革ケースとストラップが付いた手のひらサイズのラジオ。金属メッシュのスピーカー、アナログチューニング盤。
  2. `audio-1970-boombox-v1.png`: 【1970年代 大型ステレオラジカセ】
     - ツインスピーカー、カセットデッキ、伸縮式ロッドアンテナ、VUメーター、武骨な持ち手ハンドル。
  3. `audio-1980-walkman-v1.png`: 【1980年代 ポータブルカセットプレーヤー（ウォークマン風）】
     - 青とシルバーのツートンカラーの超小型アルミボディ。オレンジのスポンジ付き軽量ヘッドホン、操作ボタン。
  4. `audio-1980-minicompo-v1.png`: 【1980年代 システム・ミニコンポ】
     - アンプ、グラフィックイコライザー、ダブルカセットデッキ、レコードプレーヤーが積み重なった黒いステレオシステム。
  5. `audio-1990-portable-cd-v1.png`: 【1990年代 ポータブルCDプレーヤー】
     - 丸型ディスク形状の薄型CDプレーヤー。液晶リモコン付きイヤホン。
- **生成用プロンプト案（1980年代 ポータブルカセット）**:
  ```text
  Pixel art sprite of a vintage 1980s Japanese portable personal cassette player, compact rectangular metallic blue and silver aluminum body, cassette tape window, play and stop push buttons, connected with retro lightweight headphones with orange foam earpads. Isometric three-quarter view, isolated on solid flat warm ivory background. Retro 16-bit pixel art style, no brand name. --ar 1:1
  ```

---

### PROD-05: 調理・生活家電（Home & Kitchen）
- **保存場所**: `assets/products/`
- **バリエーション一覧**:
  1. `cook-1970-microwave-v1.png`: 【1970年代 初期型電子レンジ】
     - 分厚い扉、丸窓、大型のベル付きタイマーダイヤル、前面の大きな取っ手。
  2. `cook-1980-ricecooker-v1.png`: 【1980年代 マイコンジャー炊飯器】
     - 花柄プリントのスチールボディ、押しボタン式レバー、保温ランプ。
  3. `clean-1970-vacuum-v1.png`: 【1970年代 キャニスター型電気掃除機】
     - ロケットのような丸い横型ボディ、蛇腹ホース、金属パイプ、大きなキャスター輪。
  4. `air-1970-window-ac-v1.png`: 【1970年代 窓用ルームエアコン（ウインドファン）】
     - 窓枠にはめ込む角型の武骨なエアコン。プラスチック製ルーバー、ダイヤルスイッチ。
  5. `clean-2010-robot-v1.png`: 【2010年代 ロボット掃除機】
     - 円盤型の自走式ロボット掃除機。バンパーセンサー、充電ドック。
- **生成用プロンプト案（1970年代 電子レンジ）**:
  ```text
  Pixel art sprite of a vintage 1970s Japanese countertop microwave oven, heavy cream-colored metal cabinet, front-opening door with circular glass viewing window, mechanical rotary timer knob, retro indicator lights. Isometric three-quarter view, isolated on solid flat warm ivory background. Retro 16-bit pixel art style, stepped shading, dark outlines, no text. --ar 1:1
  ```

---

### PROD-06: パソコン・情報・通信（Computers & Mobile）
- **保存場所**: `assets/products/`
- **バリエーション一覧**:
  1. `pc-1980-8bit-hobby-v1.png`: 【1980年代 8bitホビーパソコン】
     - キーボード一体型の本体、データレコーダー（カセット）、小型カラーCRTディスプレイ。
  2. `pc-1990-16bit-desktop-v1.png`: 【1990年代 16bit国民機デスクトップ（PC-98風）】
     - 横置きのアイボリー色デスクトップ本体、デュアル5.25インチ/3.5インチFDDスロット、セパレート型キーボード、14インチCRTモニター。
  3. `pc-1990-laptop-v1.png`: 【1990年代 初期ノートパソコン】
     - 分厚いクラムシェル型ノートPC。モノクロまたは初期DSTN液晶画面、トラックボール内蔵。
  4. `mob-1990-cellular-v1.png`: 【1990年代 初期携帯電話】
     - アンテナが伸びる縦長の黒い携帯電話（ストレート型）、1行液晶画面、テンキー。
  5. `mob-2000-flip-phone-v1.png`: 【2000年代 ガラケー（折りたたみ式）】
     - カラフルな二つ折り携帯電話。サブディスプレイ、カメラレンズ、アンテナ。
  6. `mob-2010-smartphone-v1.png`: 【2010年代 スマートフォン】
     - 全面タッチスクリーンのスレート型スマートフォン。丸みを帯びた薄型デザイン。
- **生成用プロンプト案（1990年代 16bitデスクトップ）**:
  ```text
  Pixel art sprite of a classic 1990s Japanese 16-bit desktop personal computer, beige desktop tower unit with dual 3.5-inch floppy disk drives, separate keyboard, boxy CRT color computer monitor displaying green prompt text. Isometric three-quarter view, isolated on solid flat warm ivory background. Retro 16-bit pixel art style, PC-9801 aesthetic, no real logo. --ar 1:1
  ```

---

## 5. 画像保存先のディレクトリ構造一覧

生成完了後は、リポジトリ内の以下のパスにファイルを格納してください。

```text
c:\Users\s-hir\AntiGravity\家電戦争\assets\
├── portraits/                  # 自社役員（表情差分）およびNPC
│   ├── executives-roster-v1.png (正本原画)
│   ├── president-normal-v1.png
│   ├── president-smile-v1.png
│   ├── president-crisis-v1.png
│   ├── design-eureka-v1.png
│   ├── sales-sweat-v1.png
│   ├── finance-warning-v1.png
│   ├── production-proud-v1.png
│   ├── personnel-worried-v1.png
│   ├── npc-banker-v1.png
│   └── ...
├── rivals/                     # ライバル企業社長肖像
│   ├── rival-kowa-normal-v1.png
│   ├── rival-kowa-smug-v1.png
│   ├── rival-hinode-normal-v1.png
│   ├── rival-hinode-smug-v1.png
│   ├── rival-mine-normal-v1.png
│   └── ...
├── products/                   # 家電製品スプライト（各時代・カテゴリ）
│   ├── refr-1960-1door-v1.png
│   ├── refr-1970-2door-v1.png
│   ├── wash-1960-wringer-v1.png
│   ├── wash-1970-twintub-v1.png
│   ├── tv-1960-blackwhite-v1.png
│   ├── tv-1970-color-console-v1.png
│   ├── audio-1980-walkman-v1.png
│   ├── cook-1970-microwave-v1.png
│   ├── pc-1990-16bit-desktop-v1.png
│   └── ...
└── scenes/                     # 背景・ロケーション・イベント
    ├── scene-office-day-v1.png
    ├── scene-boardroom-normal-v1.png
    ├── scene-lab-workshop-v1.png
    ├── scene-factory-early-v1.png
    ├── scene-market-shop-v1.png
    ├── scene-event-launch-v1.png
    ├── scene-news-paper-v1.png
    └── ...
```

