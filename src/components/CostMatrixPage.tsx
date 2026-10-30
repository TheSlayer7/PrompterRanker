import React, { useState } from 'react';
import {
  DollarSign,
  Layers,
  Download,
} from 'lucide-react';
import type { ModelConfig, NamingStyle, ModelId } from '../types/prompt';
import { SUPPORTED_MODELS, getModelDisplayName } from '../services/models';

interface CostMatrixPageProps {
  tokenCount: number;
  currentModel: ModelConfig;
  namingStyle: NamingStyle;
  onSelectModel: (modelId: ModelId) => void;
}

export const CostMatrixPage: React.FC<CostMatrixPageProps> = ({
  tokenCount,
  currentModel,
  namingStyle,
  onSelectModel,
}) => {
  const [callVolume, setCallVolume] = useState<number>(100000); // 100k default

  const exportPricingCSV = () => {
    const rows = [
      ['Model', 'Provider', 'Tokens', 'Input Rate ($/1M)', `Total Cost (${callVolume.toLocaleString()} calls)`],
      ...SUPPORTED_MODELS.map((m) => {
        const cost = ((tokenCount * callVolume) / 1000000) * m.inputPricePerMillion;
        return [
          getModelDisplayName(m, namingStyle),
          m.provider,
          tokenCount.toString(),
          `$${m.inputPricePerMillion.toFixed(2)}`,
          `$${cost.toFixed(2)}`,
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prompt-cost-matrix-${callVolume}-runs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="cost-matrix-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-section-title">Cost & Context Window Matrix</h2>
          <p className="page-section-subtitle">
            Simulate enterprise execution expenditure and analyze context utilization across all architectures.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={exportPricingCSV}>
          <Download size={14} />
          <span>Export Matrix (CSV)</span>
        </button>
      </div>

      {/* Volume Simulator Card */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Execution Volume Simulator
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Current evaluated prompt size: <strong>{tokenCount.toLocaleString()} tokens</strong>
            </p>
          </div>

          <div className="volume-presets">
            {[1000, 10000, 100000, 500000, 1000000].map((vol) => (
              <button
                key={vol}
                className={`volume-pill ${callVolume === vol ? 'active' : ''}`}
                onClick={() => setCallVolume(vol)}
              >
                {vol >= 1000000 ? `${vol / 1000000}M` : `${vol / 1000}k`} runs
              </button>
            ))}
          </div>
        </div>

        {/* Volume Slider */}
        <div className="volume-slider-wrap">
          <input
            type="range"
            min={1000}
            max={1000000}
            step={5000}
            value={callVolume}
            onChange={(e) => setCallVolume(Number(e.target.value))}
            className="volume-range-input"
          />
          <div className="slider-labels">
            <span>1,000 calls</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {callVolume.toLocaleString()} calls simulated
            </span>
            <span>1,000,000 calls</span>
          </div>
        </div>
      </div>

      {/* Detailed Multi-Model Pricing Table */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <DollarSign size={18} color="var(--emerald)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Comparative Enterprise Cost Breakdown
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="cost-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th>Context Window</th>
                <th>Input Rate</th>
                <th>Cost for {callVolume.toLocaleString()} Runs</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {SUPPORTED_MODELS.map((model) => {
                const totalCost = ((tokenCount * callVolume) / 1000000) * model.inputPricePerMillion;
                const isCurrent = model.id === currentModel.id;
                const contextUsage = Math.min(100, (tokenCount / model.contextWindow) * 100);

                return (
                  <tr key={model.id} className={isCurrent ? 'selected-row' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: model.badgeColor,
                            display: 'inline-block',
                          }}
                        />
                        <span style={{ fontWeight: 600 }}>{getModelDisplayName(model, namingStyle)}</span>
                        {isCurrent && <span className="active-row-badge">Active</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{model.provider}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                          {(model.contextWindow / 1000).toLocaleString()}k tokens
                        </span>
                        <div className="mini-progress-track">
                          <div
                            className="mini-progress-fill"
                            style={{
                              width: `${Math.max(1, contextUsage)}%`,
                              background: model.badgeColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      ${model.inputPricePerMillion.toFixed(2)} / 1M
                    </td>
                    <td>
                      <span className="cost-value" style={{ color: 'var(--emerald)', fontWeight: 700 }}>
                        ${totalCost < 0.01 && totalCost > 0 ? totalCost.toFixed(4) : totalCost.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      {!isCurrent && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onSelectModel(model.id)}
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Context Window Capacity Visualizer */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Layers size={18} color="var(--purple)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Context Window Capacity Distribution
          </h3>
        </div>

        <div className="context-bars-grid">
          {SUPPORTED_MODELS.map((m) => {
            const usagePercent = ((tokenCount / m.contextWindow) * 100).toFixed(4);
            return (
              <div key={m.id} className="context-bar-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>{getModelDisplayName(m, namingStyle)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {usagePercent}%
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.max(1, Math.min(100, Number(usagePercent)))}%`,
                      background: m.badgeColor,
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  {tokenCount.toLocaleString()} / {(m.contextWindow / 1000).toLocaleString()}k window
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
