import React, { useState } from 'react';
import { DollarSign, Layers } from 'lucide-react';
import type { ModelConfig } from '../types/prompt';
import { SUPPORTED_MODELS } from '../services/models';

interface CostEstimatorProps {
  tokenCount: number;
  currentModel: ModelConfig;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ tokenCount, currentModel }) => {
  const [callVolume, setCallVolume] = useState<number>(100000); // Default 100k calls

  // Context window usage percentage for current model
  const contextUsage = Math.min(100, (tokenCount / currentModel.contextWindow) * 100);

  return (
    <div className="glass-card" id="cost-estimator-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="editor-header">
        <div className="editor-title-wrap">
          <DollarSign size={18} color="var(--emerald)" />
          <h2 className="section-title">Multi-Model Cost & Context Window Estimator</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Call Volume:</span>
          <select
            className="model-select"
            value={callVolume}
            onChange={(e) => setCallVolume(Number(e.target.value))}
            style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}
          >
            <option value={1000}>1,000 runs</option>
            <option value={10000}>10,000 runs</option>
            <option value={100000}>100,000 runs</option>
            <option value={1000000}>1,000,000 runs</option>
          </select>
        </div>
      </div>

      {/* Context Window Capacity Bar */}
      <div style={{
        padding: '14px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} color="var(--cyan)" />
            {currentModel.name} Context Utilization
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)', fontWeight: 600 }}>
            {tokenCount.toLocaleString()} / {currentModel.contextWindow.toLocaleString()} tokens ({contextUsage.toFixed(3)}%)
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${Math.max(1, Math.min(100, contextUsage))}%`,
              background: contextUsage > 80 ? 'var(--rose)' : contextUsage > 50 ? 'var(--amber)' : 'var(--cyan)',
            }}
          />
        </div>
      </div>

      {/* Comparative Model Pricing Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="cost-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Provider</th>
              <th>Token Count</th>
              <th>Price / 1M In</th>
              <th>Cost for {callVolume.toLocaleString()} Runs</th>
            </tr>
          </thead>
          <tbody>
            {SUPPORTED_MODELS.map((model) => {
              // Exact prompt cost = (tokenCount * callVolume / 1,000,000) * inputPricePerMillion
              const totalTokens = tokenCount * callVolume;
              const totalCost = (totalTokens / 1000000) * model.inputPricePerMillion;
              const isSelected = model.id === currentModel.id;

              return (
                <tr
                  key={model.id}
                  style={{
                    background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: model.badgeColor,
                        display: 'inline-block',
                      }}
                    />
                    <span>{model.name}</span>
                    {isSelected && (
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, background: 'var(--cyan)', color: '#000', fontWeight: 700 }}>
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{model.provider}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{tokenCount.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    ${model.inputPricePerMillion.toFixed(2)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#34d399', fontWeight: 600 }}>
                    ${totalCost < 0.01 && totalCost > 0 ? totalCost.toFixed(4) : totalCost.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
