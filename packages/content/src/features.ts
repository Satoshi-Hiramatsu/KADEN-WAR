import type { CategoryId } from './categories';

/**
 * 中核機構（technology.ts の modules）とは別の「付加価値項目」。
 * 開発会議で選ぶ細かな機能で、性能・原価・開発期間だけでなく
 * 先進性・目新しさ・実用性という評価軸を動かす。
 */
export type FeatureOption = {
  id: string;
  /** 提案できる製品分類。'all' はすべての分類で選べる。 */
  categoryIds: readonly CategoryId[] | 'all';
  group: string;
  name: string;
  /** この年以降でなければ提案できない（時代背景の制約）。 */
  minYear: number;
  /** 必要な保有技術。null は時期さえ来ていれば使える。 */
  requiredTechId: string | null;
  performance: number;
  /** 製造原価への加算（円）。分類固有の項目で使う。 */
  unitCost: number;
  /** 製造原価への加算（分類の標準原価に対する万分率）。分類をまたぐ項目で使う。 */
  unitCostBasis: number;
  /** 開発期間への加算（週）。 */
  devWeeks: number;
  /** 開発費への加算（万円）。分類固有の項目で使う。 */
  devCost: number;
  /** 開発費への加算（分類の標準開発費に対する万分率）。分類をまたぐ項目で使う。 */
  devCostBasis: number;
  /** 消費電力指数への加算（プラスで悪化、マイナスで改善）。 */
  energy: number;
  /** 先進性：技術的な野心度。 */
  advancement: number;
  /** 目新しさ：市場での話題性。 */
  novelty: number;
  /** 実用性：日常使いでの価値。 */
  practicality: number;
  description: string;
};

/** 分類固有の項目。原価は円、開発費は万円の実額で持つ。 */
type FeatureRow = [
  id: string,
  name: string,
  group: string,
  minYear: number,
  requiredTechId: string | null,
  performance: number,
  unitCost: number,
  devWeeks: number,
  devCost: number,
  energy: number,
  advancement: number,
  novelty: number,
  practicality: number,
  description: string,
];

/**
 * 分類をまたぐ共通項目。乾電池（30円）とテレビ（175,000円）を
 * 同じ実額では扱えないため、原価と開発費は分類の標準値に対する万分率で持つ。
 */
type SharedFeatureRow = [
  id: string,
  name: string,
  group: string,
  minYear: number,
  requiredTechId: string | null,
  performance: number,
  unitCostBasis: number,
  devWeeks: number,
  devCostBasis: number,
  energy: number,
  advancement: number,
  novelty: number,
  practicality: number,
  description: string,
];

function toFeatureOption(categoryId: CategoryId) {
  return (row: FeatureRow): FeatureOption => ({
    categoryIds: [categoryId],
    id: row[0],
    name: row[1],
    group: row[2],
    minYear: row[3],
    requiredTechId: row[4],
    performance: row[5],
    unitCost: row[6],
    unitCostBasis: 0,
    devWeeks: row[7],
    devCost: row[8],
    devCostBasis: 0,
    energy: row[9],
    advancement: row[10],
    novelty: row[11],
    practicality: row[12],
    description: row[13],
  });
}

function toSharedFeature(categoryIds: readonly CategoryId[] | 'all') {
  return (row: SharedFeatureRow): FeatureOption => ({
    categoryIds,
    id: row[0],
    name: row[1],
    group: row[2],
    minYear: row[3],
    requiredTechId: row[4],
    performance: row[5],
    unitCost: 0,
    unitCostBasis: row[6],
    devWeeks: row[7],
    devCost: 0,
    devCostBasis: row[8],
    energy: row[9],
    advancement: row[10],
    novelty: row[11],
    practicality: row[12],
    description: row[13],
  });
}

const refrigeratorRows: FeatureRow[] = [
  // 冷却・鮮度
  ['feat-refr-quickfreeze', '急速冷凍機能', '冷却・鮮度', 1975, 'tech-cooling-advanced', 5, 3000, 1, 60, 2, 4, 3, 5, '食材の細胞破壊を抑えて急速に凍らせる。'],
  ['feat-refr-autodefrost', '自動霜取り機能', '冷却・鮮度', 1972, 'tech-cooling-advanced', 4, 4000, 1, 70, 3, 3, 2, 6, '手作業の霜取りから解放する定期自動運転。'],
  ['feat-refr-partial-thaw', 'パーシャル解凍室', '冷却・鮮度', 1978, null, 3, 2000, 0, 40, 1, 3, 3, 4, '半解凍状態で保存し、すぐ調理できる専用室。'],
  ['feat-refr-chilled-room', 'チルド室', '冷却・鮮度', 1985, null, 3, 2000, 0, 35, 1, 3, 3, 5, '肉・魚を凍らせずぎりぎりの低温で保つ。'],
  ['feat-refr-vacuum-store', '真空保存室', '冷却・鮮度', 1995, 'tech-material-1', 4, 5000, 1, 90, 2, 6, 6, 4, '真空に近い状態で酸化を防ぎ鮮度を保つ。'],
  ['feat-refr-icemaker', '自動製氷機', '冷却・鮮度', 1975, 'tech-cooling-advanced', 3, 6000, 1, 80, 3, 5, 5, 5, '給水タンクから自動で氷を作り続ける。'],
  ['feat-refr-temp-sensor', '温度センサー自動制御', '冷却・鮮度', 1988, 'tech-efficiency-1', 5, 4000, 1, 70, -2, 6, 4, 6, '庫内温度を細かく検知し無駄なく冷やす。'],
  ['feat-refr-multi-airflow', 'マルチ冷却ファン方式', '冷却・鮮度', 1990, null, 6, 5000, 1, 85, -1, 5, 4, 5, '複数の送風経路で庫内温度のムラをなくす。'],
  ['feat-refr-icetemp-store', '氷温貯蔵技術', '冷却・鮮度', 2000, 'tech-cooling-advanced', 5, 6000, 1, 100, 1, 7, 6, 4, '凍結直前の氷温帯で旨味を保ちながら保存する。'],
  // 収納・仕切り
  ['feat-refr-veggie-large', '野菜室大型化', '収納・仕切り', 1960, null, 2, 2000, 0, 25, 0, 1, 2, 7, '野菜室を拡大し買い置きをまとめて収納できる。'],
  ['feat-refr-door-pocket', 'ドアポケット増設', '収納・仕切り', 1960, null, 1, 1000, 0, 15, 0, 1, 1, 6, 'ドア側の収納段を増やし小物を整理しやすくする。'],
  ['feat-refr-egg-tray', '卵ケース内蔵', '収納・仕切り', 1960, null, 1, 1000, 0, 10, 0, 0, 1, 5, '専用の卵ケースで割れを防ぐ。'],
  ['feat-refr-adjust-shelf', '可動式棚板', '収納・仕切り', 1960, null, 2, 1000, 0, 20, 0, 1, 1, 7, '棚の高さを調整でき背の高い物も収納できる。'],
  ['feat-refr-pullout-freezer', '引き出し式冷凍庫', '収納・仕切り', 1985, null, 3, 3000, 1, 50, 0, 3, 3, 6, '奥の物まで見渡せる引き出し構造の冷凍室。'],
  ['feat-refr-winerack', 'ワインラック', '収納・仕切り', 1990, null, 1, 2000, 0, 30, 0, 2, 4, 2, '瓶を横置きできる専用ラックを備える。'],
  ['feat-refr-door-in-door', 'ドアインドア構造', '収納・仕切り', 2005, 'tech-material-1', 3, 5000, 1, 90, 0, 6, 6, 4, '小窓ドアだけ開けてよく使う物を取り出せる。'],
  ['feat-refr-french-door', 'フレンチドア開閉', '収納・仕切り', 2000, 'tech-material-1', 2, 4000, 1, 70, 0, 5, 5, 4, '観音開きで省スペースかつ庫内全体を見渡せる。'],
  ['feat-refr-large-interior', '観音開き大容量庫内', '収納・仕切り', 1978, null, 3, 3000, 1, 55, 1, 2, 2, 6, '扉を広く開けられる構造で大容量化する。'],
  // 省エネ
  ['feat-refr-vacuum-panel', '真空断熱材採用', '省エネ', 1998, 'tech-efficiency-2', 2, 5000, 1, 90, -6, 6, 4, 5, '薄くても高断熱の真空パネルで庫内を保温する。'],
  ['feat-refr-led-light', 'LED庫内灯', '省エネ', 1995, null, 1, 1000, 0, 15, -1, 3, 3, 5, '発熱の少ないLEDで庫内灯の負荷を下げる。'],
  ['feat-refr-power-sensor', '節電センサー', '省エネ', 1992, 'tech-efficiency-1', 2, 3000, 0, 40, -4, 4, 3, 6, '使用状況を検知し無駄な冷却を抑える。'],
  ['feat-refr-door-alarm', '開閉検知アラーム', '省エネ', 1980, null, 1, 1000, 0, 20, -1, 2, 3, 6, '扉の閉め忘れを音で知らせる。'],
  ['feat-refr-hi-compressor', '高効率コンプレッサー', '省エネ', 1993, 'tech-efficiency-1', 4, 5000, 1, 80, -5, 5, 3, 5, '同じ冷却力をより少ない電力で実現する。'],
  ['feat-refr-eco-mode', '省エネ運転モード', '省エネ', 1996, null, 1, 1000, 0, 25, -3, 3, 3, 6, 'ボタン一つで節電優先の運転に切り替える。'],
  ['feat-refr-solar-ready', '太陽光補助対応', '省エネ', 2008, 'tech-efficiency-2', 1, 6000, 1, 110, -3, 7, 7, 2, '太陽光発電システムとの連携を想定した設計。'],
  ['feat-refr-standby-cut', '待機電力カット回路', '省エネ', 1999, null, 1, 2000, 0, 30, -2, 3, 2, 6, '待機時のわずかな消費電力まで削り込む。'],
  // 操作・表示
  ['feat-refr-digital-panel', 'デジタル温度表示パネル', '操作・表示', 1985, null, 2, 2000, 0, 40, 0, 4, 4, 5, '設定温度と庫内温度を数字で表示する。'],
  ['feat-refr-touch-panel', 'タッチパネル操作', '操作・表示', 2000, 'tech-material-1', 2, 5000, 1, 90, 0, 6, 6, 3, '物理ボタンを廃した滑らかな操作面。'],
  ['feat-refr-voice-notice', '音声お知らせ機能', '操作・表示', 1998, null, 1, 3000, 1, 60, 0, 5, 6, 2, '扉の開閉や異常を音声で知らせる。'],
  ['feat-refr-app-link', 'スマホ連携機能', '操作・表示', 2008, 'tech-efficiency-2', 1, 7000, 2, 150, 1, 8, 8, 2, '外出先から庫内状況を確認できる。'],
  ['feat-refr-power-meter', '節電量メーター表示', '操作・表示', 2003, null, 1, 2000, 0, 35, -1, 4, 4, 5, '日々の消費電力を数値で見える化する。'],
  ['feat-refr-child-lock', 'チャイルドロック', '操作・表示', 1990, null, 0, 1000, 0, 15, 0, 1, 2, 6, '子どもによる誤操作を防ぐ操作ロック。'],
  // 衛生・安全
  ['feat-refr-antibac-wall', '抗菌加工内壁', '衛生・安全', 1996, null, 1, 2000, 0, 35, 0, 3, 4, 6, '庫内の壁面に抗菌コーティングを施す。'],
  ['feat-refr-deodorize', '脱臭機能', '衛生・安全', 1994, null, 2, 3000, 1, 50, 0, 3, 4, 6, '庫内のにおい移りを抑える脱臭ユニット。'],
  ['feat-refr-uv-lamp', '紫外線除菌ランプ', '衛生・安全', 2002, 'tech-efficiency-1', 2, 4000, 1, 65, 0, 5, 5, 4, '紫外線で庫内を定期的に除菌する。'],
  ['feat-refr-anti-tip', '転倒防止設計', '衛生・安全', 1960, null, 0, 2000, 0, 25, 0, 1, 1, 7, '重心を下げ地震や衝突での転倒を防ぐ。'],
  ['feat-refr-outage-mode', '停電時保冷モード', '衛生・安全', 1999, null, 2, 3000, 1, 55, 0, 4, 3, 6, '停電中も断熱性を高め食材の傷みを遅らせる。'],
  ['feat-refr-quake-fix', '耐震固定金具', '衛生・安全', 1985, null, 0, 2000, 0, 20, 0, 1, 1, 6, '床や壁に固定し地震時の転倒を防ぐ金具を同梱。'],
  // 外装・仕上げ
  ['feat-refr-color-variant', 'カラーバリエーション展開', '外装・仕上げ', 1960, null, 0, 2000, 0, 30, 0, 1, 4, 3, '複数の色から選べるようにする。'],
  ['feat-refr-fingerprint', '指紋防止パネル', '外装・仕上げ', 2004, null, 0, 2000, 0, 30, 0, 3, 4, 4, '表面加工で指紋や手垢を目立たなくする。'],
  ['feat-refr-slim-body', 'スリム設計筐体', '外装・仕上げ', 1988, 'tech-material-1', 1, 3000, 1, 55, 0, 4, 4, 5, '奥行きを抑え狭い台所にも置きやすくする。'],
  ['feat-refr-quiet-body', '静音設計ボディ', '外装・仕上げ', 1993, null, 2, 3000, 1, 60, -1, 4, 3, 6, '振動を吸収する構造で運転音を抑える。'],
  ['feat-refr-wood-panel', '木目調パネル仕上げ', '外装・仕上げ', 1960, null, 0, 2000, 0, 25, 0, 1, 3, 2, '茶の間になじむ木目調の化粧パネル。'],
  ['feat-refr-stainless-premium', 'ステンレス高級仕上げ', '外装・仕上げ', 1998, null, 0, 4000, 0, 50, 0, 3, 5, 2, '高級感のあるステンレス外装に仕上げる。'],
  ['feat-refr-reversible-door', '左右開き対応ドア', '外装・仕上げ', 1980, null, 0, 2000, 0, 30, 0, 2, 2, 6, '設置場所に合わせて扉の開き方向を変えられる。'],
  ['feat-refr-builtin-ready', '埋め込み型ビルトイン対応', '外装・仕上げ', 1995, 'tech-material-1', 1, 5000, 1, 80, 0, 5, 5, 3, 'キッチン家具に埋め込んで設置できる。'],
  // 追加
  ['feat-refr-rapid-ice', '急速製氷モード', '冷却・鮮度', 1998, 'tech-cooling-advanced', 2, 3000, 0, 45, 2, 4, 4, 4, '来客前などに素早く氷を作る特別運転。'],
  ['feat-refr-camera-check', '庫内カメラ確認機能', '操作・表示', 2009, 'tech-efficiency-2', 0, 6000, 2, 120, 1, 7, 7, 3, '外出先から庫内の様子をカメラで確認できる。'],
  ['feat-refr-swing-sensor', '開閉方向自動検知センサー', '外装・仕上げ', 2006, null, 1, 3000, 1, 50, 0, 5, 5, 3, '設置場所に応じて開閉方向を自動で最適化する。'],
  ['feat-refr-humidity-veggie', '湿度コントロール野菜室', '収納・仕切り', 1992, null, 2, 2000, 0, 35, 0, 3, 3, 6, '野菜室内の湿度を保ち鮮度の持ちをよくする。'],
];

const washerRows: FeatureRow[] = [
  // 洗浄・脱水
  ['feat-wash-highspin', '高速脱水機構', '洗浄・脱水', 1970, null, 4, 3000, 1, 50, 2, 3, 2, 6, '回転数を高め脱水後の乾きを早める。'],
  ['feat-wash-stainless-drum', 'ステンレス洗濯槽', '洗浄・脱水', 1985, 'tech-material-1', 3, 4000, 1, 60, 0, 3, 3, 6, 'サビに強く長く清潔に使える洗濯槽。'],
  ['feat-wash-kneading', 'もみ洗い機構', '洗浄・脱水', 1978, null, 4, 3000, 1, 55, 1, 4, 3, 5, '衣類同士をもみ合わせるように洗う機構。'],
  ['feat-wash-warm-water', '温水洗浄機能', '洗浄・脱水', 1990, null, 4, 4000, 1, 70, 4, 4, 4, 5, '皮脂汚れに強い温水での洗浄コース。'],
  ['feat-wash-bubble', '泡洗浄システム', '洗浄・脱水', 1998, null, 3, 4000, 1, 65, 1, 5, 6, 3, '洗剤を泡立てて繊維の奥まで浸透させる。'],
  ['feat-wash-inverter', 'インバーターモーター駆動', '洗浄・脱水', 1995, 'tech-efficiency-2', 5, 6000, 2, 110, -4, 7, 5, 5, '回転数をきめ細かく制御し静かで省電力。'],
  ['feat-wash-direct-drive', 'ダイレクトドライブ方式', '洗浄・脱水', 2000, 'tech-efficiency-2', 4, 5000, 1, 90, -2, 6, 5, 5, 'ベルトを介さずモーターで直接槽を回す。'],
  ['feat-wash-auto-detergent', '高濃度洗剤自動投入', '洗浄・脱水', 2005, null, 3, 4000, 1, 70, 0, 5, 5, 4, '洗剤量を自動計量して無駄なく投入する。'],
  ['feat-wash-small-load', '少量洗いモード', '洗浄・脱水', 1988, null, 1, 2000, 0, 30, -1, 2, 2, 6, '少ない衣類でも水と電気を節約して洗える。'],
  // コース・自動化
  ['feat-wash-auto-waterlevel', '自動計量給水', 'コース・自動化', 1980, null, 2, 3000, 1, 45, -1, 3, 2, 6, '衣類量に応じて給水量を自動で決める。'],
  ['feat-wash-full-auto', '全自動コース設定', 'コース・自動化', 1982, 'tech-washing-advanced', 3, 5000, 1, 80, 0, 4, 3, 6, '洗い〜脱水までボタン一つで完了する。'],
  ['feat-wash-delay-timer', '予約タイマー機能', 'コース・自動化', 1985, null, 1, 2000, 0, 35, 0, 2, 3, 6, '深夜電力帯などに合わせて開始時刻を予約する。'],
  ['feat-wash-fuzzy', 'ファジィ制御洗濯', 'コース・自動化', 1990, 'tech-efficiency-1', 3, 4000, 1, 75, -1, 6, 6, 4, '汚れ具合をセンサーで判断し自動調整する。'],
  ['feat-wash-builtin-dry', '乾燥機能内蔵', 'コース・自動化', 1998, 'tech-efficiency-2', 5, 8000, 2, 160, 5, 6, 6, 5, '洗濯から乾燥まで一台で完結させる。'],
  ['feat-wash-delicate', 'おしゃれ着コース', 'コース・自動化', 1988, null, 1, 2000, 0, 30, 0, 2, 3, 5, '型崩れしやすい衣類向けの優しい洗いコース。'],
  ['feat-wash-futon', '布団洗いコース', 'コース・自動化', 2002, null, 2, 3000, 1, 50, 1, 3, 4, 4, '大物寝具を洗える専用コースを設ける。'],
  ['feat-wash-ai-course', 'AI自動判定コース', 'コース・自動化', 2010, 'tech-efficiency-2', 2, 7000, 2, 140, 0, 8, 8, 3, '衣類の種類や汚れをAIが判定して最適化する。'],
  ['feat-wash-twin-tub', '二槽独立洗濯脱水', 'コース・自動化', 1960, null, 2, 2000, 0, 40, 1, 1, 1, 6, '洗いと脱水の槽を分け同時並行で作業できる。'],
  // 省エネ・節水
  ['feat-wash-water-rinse', '節水すすぎモード', '省エネ・節水', 1990, 'tech-efficiency-1', 1, 2000, 0, 35, -2, 3, 3, 6, 'すすぎの水量を最適化し節水する。'],
  ['feat-wash-bathwater-pump', '残り湯利用ポンプ', '省エネ・節水', 1992, null, 1, 3000, 1, 45, -1, 3, 4, 5, '風呂の残り湯を洗濯に使えるポンプを備える。'],
  ['feat-wash-low-water', '低水位洗浄技術', '省エネ・節水', 2000, 'tech-efficiency-2', 2, 3000, 1, 55, -3, 5, 4, 5, '少ない水量でも十分な洗浄力を保つ。'],
  ['feat-wash-eco-mode', 'エコ運転モード', '省エネ・節水', 1996, null, 0, 1000, 0, 25, -3, 3, 3, 6, '時間はかかるが水と電力を節約する運転。'],
  ['feat-wash-standby-cut', '待機電力カット', '省エネ・節水', 1999, null, 0, 2000, 0, 25, -2, 2, 2, 6, '待機時の消費電力を最小限に抑える。'],
  ['feat-wash-water-meter', '節水率表示メーター', '省エネ・節水', 2004, null, 0, 2000, 0, 30, 0, 3, 3, 4, '使用水量を表示し節水意識を高める。'],
  ['feat-wash-solar-ready', '太陽光補助対応', '省エネ・節水', 2008, 'tech-efficiency-2', 1, 5000, 1, 90, -2, 6, 6, 2, '太陽光発電との連携を想定した設計。'],
  ['feat-wash-hi-valve', '高効率給水バルブ', '省エネ・節水', 1993, null, 1, 2000, 0, 35, -2, 3, 2, 6, '無駄な給水を減らす精密バルブを採用する。'],
  // 操作・表示
  ['feat-wash-lcd-panel', 'デジタル液晶表示パネル', '操作・表示', 1988, null, 1, 2000, 0, 40, 0, 4, 4, 5, '残り時間やコースを液晶で表示する。'],
  ['feat-wash-voice-guide', '音声ガイダンス機能', '操作・表示', 2000, null, 0, 3000, 1, 55, 0, 5, 6, 2, '操作方法や終了を音声で案内する。'],
  ['feat-wash-touch-button', 'タッチボタン操作', '操作・表示', 2003, 'tech-material-1', 1, 4000, 1, 70, 0, 5, 5, 3, '凹凸のないタッチ式ボタンで操作する。'],
  ['feat-wash-app-watch', 'スマホ連携見守り機能', '操作・表示', 2009, 'tech-efficiency-2', 1, 7000, 2, 150, 0, 8, 8, 2, '外出先から洗濯の進捗を確認できる。'],
  ['feat-wash-auto-load', '洗濯物量自動検知', '操作・表示', 1996, null, 2, 3000, 1, 50, -1, 4, 4, 6, '投入された衣類量をセンサーで自動検知する。'],
  ['feat-wash-child-lock', 'チャイルドロック', '操作・表示', 1990, null, 0, 1000, 0, 15, 0, 1, 2, 6, '子どもによる誤操作や事故を防ぐ。'],
  // 安全・衛生
  ['feat-wash-tub-clean', '槽洗浄コース', '安全・衛生', 1998, null, 1, 2000, 0, 35, 0, 3, 4, 6, '槽の裏側に潜むカビや汚れを洗浄する。'],
  ['feat-wash-antibac-gasket', '抗菌パッキン', '安全・衛生', 2000, null, 0, 2000, 0, 30, 0, 2, 3, 6, 'ドアパッキンに抗菌加工を施す。'],
  ['feat-wash-auto-lidlock', '自動フタロック', '安全・衛生', 1994, null, 0, 2000, 0, 25, 0, 2, 2, 6, '運転中は自動でフタをロックし安全を確保する。'],
  ['feat-wash-vibration-sensor', '脱水時異常振動検知', '安全・衛生', 1997, null, 1, 3000, 1, 45, 0, 4, 3, 6, '偏った衣類の片寄りを検知し脱水を止める。'],
  ['feat-wash-lint-clean', '糸くずフィルター自動掃除', '安全・衛生', 2003, null, 1, 3000, 1, 55, 0, 4, 4, 6, 'フィルターの目詰まりを自動で解消する。'],
  ['feat-wash-quake-feet', '転倒防止耐震脚', '安全・衛生', 1960, null, 0, 1000, 0, 20, 0, 1, 1, 6, '脱水時の振動や地震での転倒を防ぐ脚部。'],
  // 設置・収納
  ['feat-wash-pan-ready', '防水パン対応設計', '設置・収納', 1960, null, 0, 1000, 0, 15, 0, 1, 1, 6, '防水パンにぴったり収まる脚部設計。'],
  ['feat-wash-slim-width', 'スリム幅設計', '設置・収納', 1990, 'tech-material-1', 1, 3000, 1, 55, 0, 4, 4, 5, '狭い脱衣所にも設置しやすい幅に抑える。'],
  ['feat-wash-top-front', '上開き・前開き選択式', '設置・収納', 1960, null, 1, 2000, 0, 35, 0, 2, 3, 5, '設置場所に合わせて開閉方式を選べる。'],
  ['feat-wash-stackable', '積み上げ設置対応', '設置・収納', 2000, 'tech-material-1', 0, 4000, 1, 60, 0, 4, 4, 4, '乾燥機を上に積み重ねて設置できる。'],
  ['feat-wash-caster', 'キャスター付き移動対応', '設置・収納', 1960, null, 0, 2000, 0, 25, 0, 1, 2, 4, '掃除の際などに動かしやすいキャスターを付ける。'],
  ['feat-wash-color-variant', 'カラーバリエーション展開', '設置・収納', 1960, null, 0, 2000, 0, 30, 0, 1, 4, 3, '複数の色から選べるようにする。'],
  ['feat-wash-quiet-body', '静音防振設計', '設置・収納', 1995, null, 2, 3000, 1, 55, 0, 4, 3, 6, '振動を吸収する構造で運転音を抑える。'],
  ['feat-wash-stainless-body', 'ステンレス外装仕上げ', '設置・収納', 1999, null, 0, 3000, 0, 40, 0, 2, 4, 2, '高級感のあるステンレス外装に仕上げる。'],
  // 追加
  ['feat-wash-detergent-tank', '洗剤自動投入タンク', '洗浄・脱水', 2006, null, 1, 4000, 1, 65, 0, 5, 5, 4, 'タンクに補充しておけば毎回の計量が要らない。'],
  ['feat-wash-hot-rinse', '除菌温水すすぎ', '安全・衛生', 2004, 'tech-efficiency-1', 2, 4000, 1, 60, 2, 4, 4, 5, '温水ですすぎ雑菌の繁殖を抑える。'],
  ['feat-wash-ai-diagnosis', 'AI診断メンテナンス通知', '操作・表示', 2010, 'tech-efficiency-2', 1, 6000, 2, 130, 0, 7, 7, 4, '不具合の兆候を検知し交換時期を知らせる。'],
  ['feat-wash-pethair', 'ペット毛取りコース', 'コース・自動化', 2008, null, 1, 3000, 1, 50, 0, 4, 5, 4, 'ペットの毛を効果的に取り除く専用コース。'],
];

const televisionRows: FeatureRow[] = [
  // 映像
  ['feat-tv-wired-remote', 'リモコン受光部内蔵（有線）', '映像', 1960, null, 1, 1000, 0, 20, 0, 1, 2, 5, '有線リモコンで座ったまま操作できる。'],
  ['feat-tv-wireless-remote', 'ワイヤレスリモコン対応', '映像', 1975, 'tech-imaging-advanced', 1, 3000, 1, 50, 0, 4, 5, 5, '赤外線でどこからでも操作できるようにする。'],
  ['feat-tv-hq-processing', '高画質画像処理回路', '映像', 1985, 'tech-imaging-advanced', 6, 6000, 1, 100, 2, 5, 4, 5, '色再現とノイズ低減を専用回路で処理する。'],
  ['feat-tv-flat-screen', 'フラットスクリーン化', '映像', 1995, 'tech-material-1', 5, 8000, 2, 150, 1, 6, 6, 4, '画面の歪みを抑えたフラットブラウン管・パネル。'],
  ['feat-tv-hd-tuner', 'ハイビジョン対応チューナー', '映像', 1998, 'tech-imaging-advanced', 6, 7000, 2, 140, 2, 7, 6, 4, '高精細放送を受信できるチューナーを搭載する。'],
  ['feat-tv-caption', '文字多重放送(字幕)対応', '映像', 1985, null, 1, 3000, 1, 45, 0, 4, 4, 5, '副音声・字幕放送に対応する。'],
  ['feat-tv-large-screen', '画面サイズ大型化', '映像', 1978, null, 3, 5000, 1, 80, 3, 2, 3, 5, '一回り大きな画面で迫力ある映像を届ける。'],
  ['feat-tv-lcd-panel', '液晶パネル採用', '映像', 1996, 'tech-material-1', 5, 7000, 2, 130, -2, 6, 6, 4, 'ブラウン管に代わる薄型の液晶パネルを採用。'],
  ['feat-tv-digital-tuner', 'デジタル放送対応チューナー', '映像', 2003, 'tech-imaging-advanced', 5, 6000, 2, 120, 1, 6, 5, 5, '地上デジタル放送を受信できるようにする。'],
  // 音声
  ['feat-tv-stereo', 'ステレオ音声回路', '音声', 1978, null, 3, 3000, 1, 50, 1, 3, 3, 5, '左右独立した音声で臨場感を高める。'],
  ['feat-tv-speaker-up', '内蔵スピーカー増強', '音声', 1982, null, 2, 3000, 0, 40, 1, 2, 2, 5, 'より大きく迫力ある内蔵スピーカーに変更する。'],
  ['feat-tv-multiplex', '音声多重放送対応', '音声', 1983, null, 1, 3000, 1, 45, 0, 4, 4, 4, '二カ国語放送などの副音声に対応する。'],
  ['feat-tv-surround', 'サラウンド音響機能', '音声', 1995, null, 2, 5000, 1, 80, 1, 5, 5, 3, '疑似サラウンドで映画館のような音場を作る。'],
  ['feat-tv-ext-speaker', '外部スピーカー出力端子', '音声', 1990, null, 0, 2000, 0, 25, 0, 2, 2, 5, '別売スピーカーへ音声を出力できる。'],
  ['feat-tv-optical-audio', '光デジタル音声出力', '音声', 2002, null, 0, 3000, 0, 40, 0, 4, 4, 4, 'デジタル音響機器へ高音質な音声を出力する。'],
  ['feat-tv-auto-volume', '音量自動調整機能', '音声', 2005, null, 1, 2000, 0, 35, 0, 4, 4, 5, 'CMと番組の音量差を自動で均す。'],
  ['feat-tv-bass-boost', '低音強調モード', '音声', 1998, null, 1, 2000, 0, 25, 0, 2, 3, 3, '内蔵スピーカーでも重低音を感じられるようにする。'],
  // 操作性
  ['feat-tv-preset', 'チャンネルプリセット機能', '操作性', 1960, null, 1, 2000, 0, 30, 0, 2, 2, 6, 'よく見る局をボタン一つで呼び出せる。'],
  ['feat-tv-timer-rec', 'タイマー録画予約対応', '操作性', 1980, null, 0, 2000, 0, 35, 0, 3, 3, 5, 'VTRと連動した録画予約に対応する。'],
  ['feat-tv-osd-menu', '画面表示メニューOSD', '操作性', 1988, null, 1, 2000, 0, 35, 0, 4, 3, 5, '設定項目を画面上のメニューで操作できる。'],
  ['feat-tv-auto-off', '省エネ自動オフタイマー', '操作性', 1993, null, 0, 1000, 0, 20, -1, 2, 2, 6, '見ないまま放置すると自動で電源を切る。'],
  ['feat-tv-voice-remote', '音声操作リモコン', '操作性', 2008, 'tech-efficiency-2', 1, 6000, 2, 120, 0, 7, 7, 3, '声でチャンネルや音量を操作できる。'],
  ['feat-tv-app-remote', 'スマホ連携操作', '操作性', 2009, 'tech-efficiency-2', 0, 6000, 2, 130, 0, 7, 7, 3, 'スマートフォンをリモコン代わりに使える。'],
  ['feat-tv-parental-lock', '子供向けチャンネルロック', '操作性', 1992, null, 0, 1000, 0, 20, 0, 1, 2, 6, '特定チャンネルを子どもが見られないようにする。'],
  ['feat-tv-pinp', 'ピクチャーインピクチャー機能', '操作性', 1990, 'tech-imaging-advanced', 1, 4000, 1, 70, 1, 5, 5, 3, '画面の中に別のチャンネル映像を表示する。'],
  // 省エネ
  ['feat-tv-power-save-circuit', '省電力回路設計', '省エネ', 1988, 'tech-efficiency-1', 1, 3000, 1, 45, -4, 4, 3, 6, '待機・動作時の消費電力を抑えた回路設計。'],
  ['feat-tv-auto-brightness', '自動輝度調整センサー', '省エネ', 2000, 'tech-efficiency-1', 1, 3000, 1, 50, -3, 5, 4, 5, '周囲の明るさに応じて画面の輝度を調整する。'],
  ['feat-tv-standby-cut', '待機電力カット回路', '省エネ', 1999, null, 0, 1000, 0, 20, -2, 3, 2, 6, '主電源を切った状態の消費電力を極小化する。'],
  ['feat-tv-led-backlight', 'LEDバックライト', '省エネ', 2007, 'tech-efficiency-2', 2, 5000, 1, 90, -5, 6, 5, 5, '蛍光管に代わる省電力なLED光源を採用する。'],
  ['feat-tv-motion-sensor', '人感センサー節電', '省エネ', 2006, null, 0, 3000, 1, 55, -3, 5, 5, 4, '人がいない部屋を検知し自動で節電する。'],
  ['feat-tv-eco-indicator', 'エコモード表示', '省エネ', 2004, null, 0, 1000, 0, 20, -1, 3, 3, 5, '節電の度合いを画面表示で分かりやすく伝える。'],
  ['feat-tv-solar-ready', '太陽光補助対応', '省エネ', 2009, 'tech-efficiency-2', 0, 5000, 1, 90, -2, 7, 7, 2, '太陽光発電システムとの連携を想定した設計。'],
  // 接続・付加機能
  ['feat-tv-ext-input', '外部入力端子増設', '接続・付加機能', 1985, null, 0, 2000, 0, 30, 0, 2, 3, 6, '複数の外部機器を同時につないでおける。'],
  ['feat-tv-vtr-ready', 'ビデオデッキ接続対応', '接続・付加機能', 1978, null, 0, 2000, 0, 30, 0, 2, 3, 6, 'VTRとの連動録画・再生に対応する。'],
  ['feat-tv-pc-input', 'パソコン入力端子', '接続・付加機能', 1993, null, 0, 3000, 1, 45, 0, 4, 4, 4, 'パソコンの画面をテレビに表示できる。'],
  ['feat-tv-s-d-terminal', 'S端子・D端子対応', '接続・付加機能', 1995, null, 1, 3000, 1, 50, 0, 4, 4, 4, 'より高画質な映像入力規格に対応する。'],
  ['feat-tv-hdmi', 'HDMI入力端子', '接続・付加機能', 2004, 'tech-imaging-advanced', 2, 5000, 1, 80, 0, 6, 5, 5, 'デジタル映像・音声を一本で伝送する端子。'],
  ['feat-tv-internet', 'インターネット接続機能', '接続・付加機能', 2008, 'tech-efficiency-2', 1, 7000, 2, 140, 1, 8, 8, 2, 'ネット動画やニュースをテレビで楽しめる。'],
  ['feat-tv-usb-media', 'USBメディア再生対応', '接続・付加機能', 2006, null, 1, 4000, 1, 60, 0, 5, 5, 4, 'USBメモリの写真や動画をそのまま再生できる。'],
  ['feat-tv-data-broadcast', '双方向データ放送対応', '接続・付加機能', 2003, 'tech-imaging-advanced', 1, 5000, 1, 90, 0, 6, 6, 3, '天気やクイズなど双方向のデータ放送に対応する。'],
  ['feat-tv-multi-tuner', '複数チューナー同時視聴', '接続・付加機能', 2005, 'tech-imaging-advanced', 2, 6000, 2, 110, 1, 6, 6, 3, '2つの番組を同時に受信し裏番組を録りながら見る。'],
  // 筐体・仕上げ
  ['feat-tv-wood-cabinet', '木目調キャビネット仕上げ', '筐体・仕上げ', 1960, null, 0, 2000, 0, 25, 0, 1, 3, 2, '茶の間になじむ木目調の化粧キャビネット。'],
  ['feat-tv-slim-design', 'スリム薄型設計', '筐体・仕上げ', 1997, 'tech-material-1', 1, 5000, 1, 90, 0, 6, 6, 4, '奥行きを大きく削った薄型ボディに仕上げる。'],
  ['feat-tv-wall-mount', '壁掛け設置対応金具', '筐体・仕上げ', 1999, 'tech-material-1', 0, 3000, 1, 55, 0, 4, 4, 4, '壁に取り付けて設置面積を減らせる。'],
  ['feat-tv-color-variant', 'カラーバリエーション展開', '筐体・仕上げ', 1960, null, 0, 2000, 0, 30, 0, 1, 4, 3, '複数の色から選べるようにする。'],
  ['feat-tv-caster-stand', 'キャスター付き台座', '筐体・仕上げ', 1960, null, 0, 2000, 0, 25, 0, 1, 2, 4, '部屋の模様替えに合わせて動かしやすくする。'],
  ['feat-tv-antiglare', '指紋防止・反射防止パネル', '筐体・仕上げ', 2005, null, 1, 3000, 0, 50, 0, 4, 4, 4, '映り込みや指紋を抑えた表面加工パネル。'],
  ['feat-tv-carry-handle', '折りたたみ持ち運びハンドル', '筐体・仕上げ', 1980, null, 0, 1000, 0, 15, 0, 1, 2, 4, '部屋間の移動をしやすくする持ち手を付ける。'],
  ['feat-tv-premium-frame', '高級素材フレーム仕上げ', '筐体・仕上げ', 2000, null, 0, 4000, 0, 60, 0, 3, 5, 2, '額縁のような高級感あるフレームに仕上げる。'],
  ['feat-tv-curved-screen', '曲面（カーブド）スクリーン', '筐体・仕上げ', 2010, 'tech-material-1', 2, 8000, 2, 150, 0, 8, 8, 2, '湾曲した画面で没入感のある視聴体験を作る。'],
];

// ── 全分類共通：作りの良さと売り方 ────────────────────────────
const universalRows: SharedFeatureRow[] = [
  ['feat-com-inspect', '全数通電検査', '品質・信頼性', 1950, null, 4, 500, 1, 1200, 0, 1, 0, 5, '出荷前に一台ずつ火を入れて確かめ、初期不良を減らす。'],
  ['feat-com-safety', '漏電・感電対策の強化', '品質・信頼性', 1950, null, 3, 700, 1, 1500, 0, 2, 1, 6, '絶縁とアース周りを作り込み、事故の芽を摘む。'],
  ['feat-com-durable', '耐久試験の追加', '品質・信頼性', 1951, null, 5, 600, 2, 2000, 0, 2, 0, 5, '連続運転と落下の試験を重ね、壊れにくさを確かめる。'],
  ['feat-com-jis', 'JIS規格への適合', '品質・信頼性', 1953, null, 3, 600, 1, 1400, 0, 2, 1, 5, '国の規格に合わせ、官公庁や問屋に売り込みやすくする。'],
  ['feat-com-parts-common', '部品の共通化', '品質・信頼性', 1954, null, 0, -600, 1, 1200, 0, 1, 0, 3, '他機種と部品をそろえ、原価と修理の手間を下げる。'],
  ['feat-com-quiet', '静音・低振動設計', '品質・信頼性', 1955, null, 4, 900, 2, 2200, -2, 3, 2, 5, '振動源を抑え、音の静かさを売り文句にする。'],
  ['feat-com-design', '意匠登録デザイン', '意匠・仕上げ', 1952, null, 0, 800, 1, 1800, 0, 1, 5, 1, '外形を専門家に描かせ、意匠登録まで取る。'],
  ['feat-com-color', '色展開の追加', '意匠・仕上げ', 1953, null, 0, 400, 1, 1000, 0, 0, 4, 2, '同じ中身で色を変え、店頭で選ぶ楽しさを作る。'],
  ['feat-com-light', '軽量化設計', '意匠・仕上げ', 1955, 'tech-material-1', 3, 500, 1, 1500, 0, 2, 2, 4, '板厚と骨組みを見直し、持ち運びやすくする。'],
  ['feat-com-warranty', '一年間保証書', '販売・サービス', 1950, null, 0, 300, 0, 800, 0, 0, 1, 6, '保証書を付け、買った後の不安を減らす。'],
  ['feat-com-manual', '分かりやすい取扱説明書', '販売・サービス', 1950, null, 0, 150, 0, 400, 0, 0, 1, 4, '図解入りの説明書を同梱し、返品と苦情を減らす。'],
  ['feat-com-package', '化粧箱・輸送梱包の改良', '販売・サービス', 1950, null, 0, 400, 0, 600, 0, 0, 2, 3, '店頭で映える箱にし、輸送中の破損も減らす。'],
  ['feat-com-export', '輸出仕様（海外電圧対応）', '販売・サービス', 1954, null, 2, 700, 2, 2000, 0, 3, 3, 2, '海外の電圧・周波数に合わせ、輸出商社に売り込む。'],
  ['feat-com-service', '全国修理網の整備', '販売・サービス', 1956, null, 0, 500, 1, 1600, 0, 0, 1, 7, '特約店に部品と治具を配り、直せる体制を作る。'],
];

// ── 電池・電気部材 ──────────────────────────────────────────
const partsCategories: CategoryId[] = ['battery-dry', 'wiring-device', 'transformer', 'flashlight'];
const partsRows: SharedFeatureRow[] = [
  ['feat-pt-size-variant', '各種サイズ展開', '部材の作り込み', 1950, null, 2, 600, 1, 1200, 0, 1, 3, 5, '単一形・単二形など、用途に合わせた寸法をそろえる。'],
  ['feat-pt-label', '意匠を凝らしたラベル', '部材の作り込み', 1950, null, 0, 300, 0, 700, 0, 0, 4, 1, '店先で目を引く配色と商標に刷り直す。'],
  ['feat-pt-standard', '規格互換の徹底', '部材の作り込み', 1951, null, 3, 400, 1, 1000, 0, 1, 0, 6, '他社製品と互換の寸法にし、置き換え需要を取る。'],
  ['feat-pt-leakproof', '液漏れ防止構造', '部材の作り込み', 1951, null, 6, 1200, 1, 2000, 0, 3, 2, 7, '封口を二重にし、機器を傷める液漏れを防ぐ。'],
  ['feat-pt-precision', '寸法精度の作り込み', '部材の作り込み', 1952, null, 5, 900, 1, 1600, 0, 3, 0, 4, '治具を作り替え、ばらつきの少ない部材に仕上げる。'],
  ['feat-pt-longlife', '長寿命化（保存性向上）', '部材の作り込み', 1952, null, 7, 1500, 2, 2500, -3, 3, 3, 6, '劣化を抑え、棚に置いても性能が落ちにくくする。'],
  ['feat-pt-heatproof', '耐熱・耐寒仕様', '部材の作り込み', 1953, null, 5, 1100, 1, 1800, 0, 3, 1, 5, '寒冷地や工場の熱でも性能が落ちない仕様にする。'],
  ['feat-pt-bulk', '徳用パック（まとめ売り）', '部材の作り込み', 1955, null, 0, -400, 1, 900, 0, 0, 3, 5, 'まとめ買い向けの包装を用意し、回転を上げる。'],
];

// ── 照明 ────────────────────────────────────────────────────
const lightingCategories: CategoryId[] = ['bulb-incandescent', 'lamp-fluorescent', 'desk-lamp'];
const lightingRows: SharedFeatureRow[] = [
  ['feat-lt-frosted', '内面つや消し加工', '照明の質', 1951, null, 5, 800, 1, 1500, 0, 2, 2, 5, 'まぶしさを和らげ、やわらかい光にする。'],
  ['feat-lt-longlife', '長寿命化', '照明の質', 1952, null, 7, 1400, 2, 2400, -4, 4, 2, 6, 'フィラメントや電極を改良し、寿命を大きく伸ばす。'],
  ['feat-lt-glare', 'まぶしさを抑える笠', '照明の質', 1953, null, 3, 900, 1, 1300, 0, 1, 2, 6, '手元だけを照らし、目が疲れにくい配光にする。'],
  ['feat-lt-daylight', '昼光色の追加', '照明の質', 1954, null, 4, 700, 1, 1400, 0, 2, 4, 4, '色温度の違う品種をそろえ、用途で選べるようにする。'],
  ['feat-lt-shock', '耐振形（工場・車両向け）', '照明の質', 1955, null, 5, 1200, 1, 1900, 0, 3, 1, 4, '振動で切れない構造にし、産業用途を開拓する。'],
  ['feat-lt-instant', '即時点灯化', '照明の質', 1956, null, 6, 1600, 2, 2600, -2, 4, 4, 6, 'ちらつかずすぐ点く。事務所での評価が高い。'],
  ['feat-lt-slim', '細管化・小型化', '照明の質', 1957, null, 5, 1500, 2, 2400, -3, 4, 4, 3, '器具を小さくでき、住宅の天井にも収まる。'],
];

// ── 音響 ────────────────────────────────────────────────────
const audioCategories: CategoryId[] = ['radio-tube', 'radio-transistor', 'record-player', 'tape-recorder'];
const audioRows: SharedFeatureRow[] = [
  ['feat-au-bigspeaker', '大型スピーカー', '音の作り込み', 1950, null, 6, 1300, 1, 1800, 2, 2, 2, 6, '口径を大きくし、茶の間に響く豊かな音にする。'],
  ['feat-au-cabinet', '木製キャビネット仕上げ', '音の作り込み', 1950, null, 3, 1500, 1, 1600, 0, 1, 4, 3, '木目の美しい箱に収め、家具として置けるようにする。'],
  ['feat-au-tone', '高低音調整つまみ', '音の作り込み', 1951, null, 5, 900, 1, 1500, 0, 2, 3, 5, '好みに合わせて音の調子を変えられるようにする。'],
  ['feat-au-dial', '見やすい大型ダイヤル', '音の作り込み', 1951, null, 3, 700, 1, 1200, 0, 1, 3, 6, '目盛りを大きくし、局合わせをしやすくする。'],
  ['feat-au-earphone', 'イヤホン端子', '音の作り込み', 1955, null, 2, 400, 1, 900, 0, 1, 3, 6, '深夜でも家族に遠慮なく聴けるようにする。'],
  ['feat-au-portable', '電池・電源両用', '音の作り込み', 1955, null, 5, 1400, 2, 2400, 0, 4, 5, 6, '屋外へ持ち出せるようにし、使う場面を広げる。'],
  ['feat-au-stereo', 'ステレオ再生対応', '音の作り込み', 1958, null, 9, 2200, 3, 3500, 4, 6, 7, 4, '左右二系統で鳴らし、演奏の広がりを再現する。'],
];

const radioOnlyRows: SharedFeatureRow[] = [
  ['feat-ra-shortwave', '短波受信（海外放送）', '受信の工夫', 1952, null, 7, 1800, 2, 2800, 2, 5, 5, 4, '短波帯を足し、海外放送や漁業無線まで受ける。'],
  ['feat-ra-antenna', '内蔵アンテナ', '受信の工夫', 1953, null, 5, 1000, 1, 1700, 0, 3, 3, 6, '外部アンテナなしでも実用になる感度を作り込む。'],
  ['feat-ra-magic-eye', 'マジックアイ（同調表示）', '受信の工夫', 1951, null, 4, 1100, 1, 1600, 3, 3, 5, 4, '光る同調表示管で、誰でも正確に局を合わせられる。'],
];

const recorderRows: SharedFeatureRow[] = [
  ['feat-rc-auto-stop', '自動停止機構', '駆動の工夫', 1956, null, 4, 1200, 2, 2200, 0, 3, 3, 6, '終わりまで来ると自動で止まり、盤とテープを守る。'],
  ['feat-rc-mic', '高感度マイク付属', '駆動の工夫', 1955, null, 5, 1300, 1, 1800, 0, 3, 4, 5, '録音用のマイクを同梱し、買ってすぐ使えるようにする。'],
  ['feat-rc-speed', '回転数の切替', '駆動の工夫', 1954, null, 5, 1100, 1, 1900, 0, 3, 3, 6, '複数の速度に対応し、手持ちの盤やテープを活かす。'],
];

// ── 映像（テレビ黎明期） ────────────────────────────────────
const videoCategories: CategoryId[] = ['television', 'television-color'];
const videoEarlyRows: SharedFeatureRow[] = [
  ['feat-tv-antenna-set', '屋外アンテナ一式付属', '受像機の作り込み', 1953, null, 4, 1200, 1, 1500, 0, 2, 3, 7, '取り付け金具まで同梱し、買ったその日に映るようにする。'],
  ['feat-tv-uhf-tuner', '多局対応チューナー', '受像機の作り込み', 1953, null, 5, 900, 1, 1600, 0, 3, 3, 6, '増えていく放送局に合わせ、選局範囲を広げる。'],
  ['feat-tv-bigscreen', '大型ブラウン管', '受像機の作り込み', 1955, null, 8, 2400, 2, 3000, 5, 4, 6, 5, '画面を大きくし、家族そろって見られるようにする。'],
  ['feat-tv-cabinet-leg', '脚付き家具調キャビネット', '受像機の作り込み', 1955, null, 2, 1500, 1, 1800, 0, 1, 5, 3, '座敷に置いても様になる、脚付きの箱に仕立てる。'],
  ['feat-tv-doors', '開き扉付きキャビネット', '受像機の作り込み', 1956, null, 1, 900, 1, 1300, 0, 0, 4, 4, '見ないときは扉を閉め、画面を埃と日光から守る。'],
  ['feat-tv-auto-contrast', '明るさ自動調整', '受像機の作り込み', 1957, null, 6, 1300, 2, 2400, 0, 4, 3, 6, '部屋の明るさに合わせ、見やすい画面を保つ。'],
  ['feat-tv-portable-set', '卓上・小型化設計', '受像機の作り込み', 1958, null, 5, 1600, 2, 2600, -3, 5, 6, 5, '一人でも運べる大きさにし、二台目需要を狙う。'],
];

// ── 熱器具・厨房 ────────────────────────────────────────────
const heatCategories: CategoryId[] = ['iron', 'hotplate', 'toaster', 'kotatsu', 'blanket', 'rice-cooker'];
const heatRows: SharedFeatureRow[] = [
  ['feat-ht-handle', '握りやすい把手', '熱と安全', 1950, null, 2, 300, 0, 700, 0, 0, 1, 6, '熱くならない材質にし、扱いやすい形に整える。'],
  ['feat-ht-pilot', '通電表示ランプ', '熱と安全', 1951, null, 2, 400, 0, 800, 1, 1, 2, 6, '切り忘れが一目で分かる小さな灯りを付ける。'],
  ['feat-ht-thermo', '温度調節ダイヤル', '熱と安全', 1952, null, 6, 1200, 1, 2000, -2, 3, 3, 7, '用途ごとに温度を選べるようにする。'],
  ['feat-ht-cord', 'コード脱着式', '熱と安全', 1953, null, 3, 600, 1, 1200, 0, 2, 3, 6, 'コードを外して仕舞える。断線も減る。'],
  ['feat-ht-overheat', '過熱防止装置', '熱と安全', 1954, null, 5, 1300, 2, 2200, 0, 3, 1, 7, '異常な温度になると自動で切れ、火事を防ぐ。'],
  ['feat-ht-keepwarm', '保温機能', '熱と安全', 1956, null, 6, 1600, 2, 2600, 4, 4, 4, 7, '調理の後もほどよい温度を保ち続ける。'],
  ['feat-ht-timer', '切タイマー', '熱と安全', 1957, null, 5, 1400, 2, 2400, 0, 4, 4, 6, '決めた時間で自動的に切れるようにする。'],
  ['feat-ht-coating', 'ホーロー・フッ素加工', '熱と安全', 1958, null, 5, 1500, 2, 2400, 0, 4, 4, 6, '焦げ付きにくく、汚れが落ちやすい表面に仕上げる。'],
];

// ── モーター応用 ────────────────────────────────────────────
const motorCategories: CategoryId[] = ['fan', 'mixer', 'sewing-machine', 'vacuum', 'clock-electric'];
const motorRows: SharedFeatureRow[] = [
  ['feat-mt-speed', '多段速度切替', 'モーターと操作', 1952, null, 5, 1000, 1, 1800, 0, 3, 3, 6, '用途に合わせて回転を選べるようにする。'],
  ['feat-mt-safety', '指はさみ防止ガード', 'モーターと操作', 1953, null, 3, 600, 1, 1200, 0, 1, 1, 7, '子どもの手が入らない目の細かい保護をつける。'],
  ['feat-mt-quiet', '防振ゴム・静音化', 'モーターと操作', 1953, null, 4, 800, 1, 1500, 0, 2, 2, 6, '振動を受け止め、夜でも気にならない音にする。'],
  ['feat-mt-oil', '給油不要の軸受', 'モーターと操作', 1954, null, 5, 1100, 2, 2000, -2, 4, 2, 6, '含油軸受にし、手入れなしで長く回るようにする。'],
  ['feat-mt-timer', 'タイマー運転', 'モーターと操作', 1955, null, 5, 1300, 2, 2200, 0, 3, 4, 6, '決めた時間で止まる仕掛けを組み込む。'],
  ['feat-mt-light', '照明ランプ付き', 'モーターと操作', 1956, null, 2, 700, 1, 1200, 3, 1, 3, 5, '手元を照らす灯りを付け、夜の作業を助ける。'],
  ['feat-mt-cordreel', 'コード巻取り装置', 'モーターと操作', 1958, null, 3, 1000, 1, 1700, 0, 3, 4, 6, 'コードが勝手に収まり、片付けが楽になる。'],
];

// ── 白物家電の黎明期 ────────────────────────────────────────
const washerEarlyRows: SharedFeatureRow[] = [
  ['feat-wash-wringer', '手回し絞りローラー', '洗濯の工夫', 1953, null, 4, 1200, 1, 1800, 0, 2, 3, 7, '洗った物をローラーで絞り、干す手間を減らす。'],
  ['feat-wash-timer-early', '洗濯タイマー', '洗濯の工夫', 1954, null, 5, 1000, 1, 1800, 0, 3, 3, 6, '時間を決めて回し、つきっきりをやめられる。'],
  ['feat-wash-castor', '移動用キャスター', '洗濯の工夫', 1955, null, 2, 500, 1, 1000, 0, 1, 2, 6, '井戸端と土間の間を女手一つで動かせるようにする。'],
  ['feat-wash-drain-pump', '排水ポンプ内蔵', '洗濯の工夫', 1956, null, 5, 1400, 2, 2200, 3, 3, 3, 7, '高い流しへも排水でき、置き場所を選ばなくなる。'],
];

const refrigeratorEarlyRows: SharedFeatureRow[] = [
  ['feat-refr-icetray', '製氷皿・冷凍室', '冷蔵の工夫', 1953, null, 5, 900, 1, 1600, 2, 2, 4, 7, '氷が作れる小室を設け、夏の需要を取り込む。'],
  ['feat-refr-thermo-dial', '温度調節つまみ', '冷蔵の工夫', 1953, null, 5, 1000, 1, 1700, -2, 3, 2, 7, '季節と中身に合わせて冷やし方を変えられる。'],
  ['feat-refr-inner-lamp', '庫内灯', '冷蔵の工夫', 1954, null, 2, 400, 0, 900, 1, 1, 3, 5, '扉を開けると点く灯りで、夜も中が見える。'],
  ['feat-refr-lowbuzz', '低騒音コンプレッサー', '冷蔵の工夫', 1957, null, 6, 1600, 2, 2600, -3, 4, 2, 6, '夜通し動いても気にならない静かさに仕上げる。'],
];

// ── 玩具 ────────────────────────────────────────────────────
const toyCategories: CategoryId[] = ['toy-tin', 'toy-motor', 'toy-plastic-model', 'toy-model-railway'];
const toyRows: SharedFeatureRow[] = [
  ['feat-toy-litho', '多色リトグラフ印刷', '玩具の仕掛け', 1950, null, 3, 700, 1, 1200, 0, 1, 5, 2, '鮮やかな多色刷りで、店頭でひときわ目立たせる。'],
  ['feat-toy-export-mark', '輸出向け英文表記', '玩具の仕掛け', 1951, null, 0, 200, 1, 800, 0, 1, 2, 3, '英文の商標と表示を入れ、商社経由の輸出に載せる。'],
  ['feat-toy-friction', 'フリクション走行', '玩具の仕掛け', 1951, null, 4, 900, 1, 1500, 0, 2, 4, 4, '押して離すと走り出す。電池がいらず壊れにくい。'],
  ['feat-toy-sound', '音の出る仕掛け', '玩具の仕掛け', 1952, null, 4, 1000, 1, 1600, 0, 2, 5, 3, '走行に合わせて音が鳴り、遊びに物語が生まれる。'],
  ['feat-toy-light', '点灯するライト', '玩具の仕掛け', 1953, null, 3, 800, 1, 1400, 4, 2, 5, 3, '前照灯が光り、薄暗い部屋でも遊べる。'],
  ['feat-toy-box', '飾れる化粧箱', '玩具の仕掛け', 1954, null, 0, 500, 0, 900, 0, 0, 4, 2, '中身が見える箱にし、贈り物としても選ばれる。'],
  ['feat-toy-series', 'シリーズ展開（続き物）', '玩具の仕掛け', 1955, null, 0, 300, 1, 1000, 0, 0, 6, 2, '揃える楽しさを作り、次の一つを買わせる。'],
  ['feat-toy-safe', '安全な塗料・角の処理', '玩具の仕掛け', 1956, null, 2, 600, 1, 1200, 0, 1, 1, 7, '口に入れても害のない塗料にし、角を丸く仕上げる。'],
  ['feat-toy-remote', '有線リモコン操作', '玩具の仕掛け', 1957, null, 6, 1800, 2, 2800, 5, 5, 7, 3, '手元の箱で前進・後退を操れる、いちばんの売り物。'],
];

export const refrigeratorFeatures: readonly FeatureOption[] = refrigeratorRows.map(toFeatureOption('refrigerator'));
export const washerFeatures: readonly FeatureOption[] = washerRows.map(toFeatureOption('washer'));
export const televisionFeatures: readonly FeatureOption[] = televisionRows.map(toFeatureOption('television'));

export const allFeatures: readonly FeatureOption[] = [
  ...refrigeratorFeatures,
  ...washerFeatures,
  ...televisionFeatures,
  ...universalRows.map(toSharedFeature('all')),
  ...partsRows.map(toSharedFeature(partsCategories)),
  ...lightingRows.map(toSharedFeature(lightingCategories)),
  ...audioRows.map(toSharedFeature(audioCategories)),
  ...radioOnlyRows.map(toSharedFeature(['radio-tube', 'radio-transistor'])),
  ...recorderRows.map(toSharedFeature(['record-player', 'tape-recorder'])),
  ...videoEarlyRows.map(toSharedFeature(videoCategories)),
  ...heatRows.map(toSharedFeature(heatCategories)),
  ...motorRows.map(toSharedFeature(motorCategories)),
  ...washerEarlyRows.map(toSharedFeature(['washer'])),
  ...refrigeratorEarlyRows.map(toSharedFeature(['refrigerator'])),
  ...toyRows.map(toSharedFeature(toyCategories)),
];

export function findFeature(id: string): FeatureOption | undefined {
  return allFeatures.find(feature => feature.id === id);
}

export function featureAllowsCategory(feature: FeatureOption, categoryId: CategoryId): boolean {
  return feature.categoryIds === 'all' || feature.categoryIds.includes(categoryId);
}

export function allFeaturesFor(categoryId: CategoryId): readonly FeatureOption[] {
  return allFeatures.filter(feature => featureAllowsCategory(feature, categoryId));
}

/** 現在の年・保有技術で提案可能な項目だけを返す。 */
export function unlockedFeaturesFor(
  categoryId: CategoryId,
  year: number,
  ownedTechIds: readonly string[],
): readonly FeatureOption[] {
  return allFeaturesFor(categoryId).filter(feature => {
    if (feature.minYear > year) return false;
    if (feature.requiredTechId && !ownedTechIds.includes(feature.requiredTechId)) return false;
    return true;
  });
}

/** 開発会議で同時に選べる付加価値項目の上限。欲張るほど開発が長引く歯止め。 */
export const maxSelectableFeatures = 8;

/** この件数までは開発期間への追加なし。以降は1件ごとに逓増するペナルティ週数。 */
export function extraDevWeeksForFeatureCount(count: number): number {
  const freeCount = 3;
  if (count <= freeCount) return 0;
  let extra = 0;
  for (let index = freeCount + 1; index <= count; index += 1) {
    extra += index - freeCount;
  }
  return extra;
}
