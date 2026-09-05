import { useState } from 'react';
import { scenarios } from '../../../../packages/content/src/scenarios';
import { isHealthResponse } from '../../../../packages/contracts/src/health';
import { useGameStore } from '../store';

export function Title() {
  const startGame = useGameStore(store => store.startGame);
  const [companyName, setCompanyName] = useState('あかつき電機');
  const [connection, setConnection] = useState('未確認');
  const [checking, setChecking] = useState(false);
  const scenario = scenarios[0];

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

  return (
    <main className="title-screen">
      <header>
        <span>KADEN WAR</span>
        <p>ローカルデモ / S1〜S3実装中</p>
      </header>
      <h1>家電戦争</h1>
      <p className="lead">暮らしを変える家電を、あなたの会社から。</p>

      {scenario ? (
        <section>
          <p className="eyebrow">シナリオ SC01</p>
          <h2>{scenario.name}</h2>
          <p className="date">{scenario.subtitle}</p>
          <p>{scenario.briefing}</p>
          <ol className="guidance">
            {scenario.guidance.map(line => <li key={line}>{line}</li>)}
          </ol>
          <label className="field">
            <span>会社名</span>
            <input
              type="text"
              value={companyName}
              maxLength={16}
              onChange={event => setCompanyName(event.target.value)}
            />
          </label>
          <div className="actions">
            <button onClick={() => startGame({ companyName, seed: 20260905 })}>この条件で始める</button>
            <button
              className="secondary"
              onClick={() => startGame({ companyName, seed: Math.floor(Math.random() * 2 ** 31) })}
            >
              乱数を変えて始める
            </button>
          </div>
          <small>保存機能は未実装です。再読み込みすると最初からになります。</small>
        </section>
      ) : null}

      <section>
        <p className="eyebrow">開発用の接続確認</p>
        <h2>APIとデータベース</h2>
        <p>ローカルのWorkersとD1を確認します。ゲーム進行はブラウザ内だけで完結し、データは送信しません。</p>
        <button disabled={checking} onClick={() => { void checkConnection(); }}>接続を確認</button>
        <p role="status">{connection}</p>
      </section>

      <footer>
        次の工程：入門シナリオの競合AI・イベント（S4）と保存（S5）。ゲーム本体の完成や公開を示す画面ではありません。
      </footer>
    </main>
  );
}
