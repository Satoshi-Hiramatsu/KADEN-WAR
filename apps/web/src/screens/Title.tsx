import { useState } from 'react';
import { scenarios } from '../../../../packages/content/src/scenarios';
import { isHealthResponse } from '../../../../packages/contracts/src/health';
import { useGameStore } from '../store';
import sceneMarketAkiba from '../../../../assets/scenes/scene-market-akiba-v1.png';

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
      <div className="title-backdrop" style={{ backgroundImage: `url(${sceneMarketAkiba})` }}>
        <div className="title-scanlines" aria-hidden="true" />
        <div className="title-vignette" aria-hidden="true" />

        <div className="title-stage">
          <p className="title-kicker">K A D E N &nbsp; W A R</p>
          <h1 className="title-logo">
            <span className="title-logo-main">家電</span>
            <span className="title-logo-accent">戦争</span>
          </h1>
          <p className="title-copy">暮らしを変える家電を、あなたの会社から。</p>

          {scenario ? (
            <section className="sfc-window">
              <p className="sfc-eyebrow">SCENARIO 01</p>
              <h2 className="sfc-heading">{scenario.name}</h2>
              <p className="sfc-period">{scenario.subtitle}</p>
              <p className="sfc-briefing">{scenario.briefing}</p>
              <ol className="sfc-guidance">
                {scenario.guidance.map(line => <li key={line}>{line}</li>)}
              </ol>

              <label className="sfc-field">
                <span>会社名</span>
                <input
                  type="text"
                  value={companyName}
                  maxLength={16}
                  onChange={event => setCompanyName(event.target.value)}
                />
              </label>

              <div className="sfc-menu" role="menu">
                <button
                  className="sfc-menu-item"
                  onClick={() => startGame({ companyName, seed: 20260905 })}
                >
                  この条件で始める
                </button>
                <button
                  className="sfc-menu-item"
                  onClick={() => startGame({ companyName, seed: Math.floor(Math.random() * 2 ** 31) })}
                >
                  乱数を変えて始める
                </button>
              </div>
              <small className="sfc-note">保存機能は未実装です。再読み込みすると最初からになります。</small>
            </section>
          ) : null}

          <details className="dev-panel">
            <summary>開発者向け：API接続確認</summary>
            <p>
              ローカルのWorkersとD1を確認します。ゲーム進行はブラウザ内だけで完結し、データは送信しません。
            </p>
            <button className="sfc-btn-small" disabled={checking} onClick={() => { void checkConnection(); }}>
              接続を確認
            </button>
            <p role="status">{connection}</p>
          </details>

          <p className="title-version">
            ローカルデモ / S1〜S3実装中 / 次の工程：入門シナリオの競合AI・イベント（S4）と保存（S5）
          </p>
        </div>
      </div>
    </main>
  );
}
