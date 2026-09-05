import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { calendarAt } from '../../../packages/simulation/src/calendar';
import { isHealthResponse } from '../../../packages/contracts/src/health';
import './style.css';

function App() {
  const [elapsedWeeks, setElapsedWeeks] = useState(0);
  const [connection, setConnection] = useState('未確認');
  const [checking, setChecking] = useState(false);
  const date = calendarAt(elapsedWeeks);

  async function checkConnection() {
    setChecking(true);
    setConnection('確認中…');
    try {
      const response = await fetch('/api/health', { signal: AbortSignal.timeout(5000) });
      const data: unknown = await response.json();
      if (!response.ok || !isHealthResponse(data)) throw new Error('Invalid health response');
      setConnection('接続成功：APIとデータベースが応答しました。');
    } catch {
      setConnection('接続できません。APIの起動とデータベースの初期化を確認してください。');
    } finally {
      setChecking(false);
    }
  }

  return <main>
    <header><span>KADEN WAR</span><p>開発基盤 / S0</p></header>
    <h1>家電戦争</h1>
    <p className="lead">暮らしを変える家電を、あなたの会社から。</p>
    <p>現在は開発基盤の検証段階です。製品開発・生産・販売・保存はこれから実装します。</p>
    <section aria-labelledby="calendar-title">
      <p className="eyebrow">01 / ゲーム内暦</p>
      <h2 id="calendar-title">週を重ね、時代を進める</h2>
      <p>1か月は4週、1年は48週。ここでは暦の表示だけを試せます。</p>
      <p className="date" aria-live="polite">{date.year}年 {date.month}月 第{date.week}週</p>
      <div className="actions">
        <button onClick={() => setElapsedWeeks(w => w + 1)}>1週進める</button>
        <button onClick={() => setElapsedWeeks(w => w + 4)}>4週進める</button>
        <button className="secondary" onClick={() => setElapsedWeeks(0)}>初期日に戻す</button>
      </div>
      <small>決算・費用計算は未実装です。再読み込みすると初期日に戻ります。</small>
    </section>
    <section aria-labelledby="connection-title">
      <p className="eyebrow">02 / 開発用の接続確認</p>
      <h2 id="connection-title">APIとデータベース</h2>
      <p>ローカルのWorkersとD1を確認します。セーブデータは送信しません。</p>
      <button disabled={checking} onClick={() => { void checkConnection(); }}>接続を確認</button>
      <p role="status">{connection}</p>
    </section>
    <footer>次の工程：時間・状態・会計基盤。ゲーム本体の完成や公開を示す画面ではありません。</footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
