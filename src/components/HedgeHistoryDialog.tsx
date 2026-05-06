import { useState, useEffect } from 'react';
import { HedgeRow, STATUS_LABELS, CONDITION_LABELS } from '@/types';
import { API } from '@/config/api';

interface HistoryEntry {
  id: number;
  changedAt: string;
  changedBy: string | null;
  snapshot: HedgeRow;
}

interface Props {
  hedge: HedgeRow;
  onRollback: (hedge: HedgeRow) => void;
  onClose: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DiffRow({ label, before, after }: { label: string; before: unknown; after: unknown }) {
  const changed = String(before) !== String(after);
  if (!changed) return null;
  return (
    <div className="grid grid-cols-3 gap-1 text-xs py-1 border-b border-gray-50">
      <div className="text-[#6b7c6e]">{label}</div>
      <div className="line-through text-red-400">{String(before ?? '—')}</div>
      <div className="font-medium text-[#2d6a4f]">{String(after ?? '—')}</div>
    </div>
  );
}

export default function HedgeHistoryDialog({ hedge, onRollback, onClose }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API.HEDGES}?id=${hedge.id}&action=history`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setHistory(data); })
      .finally(() => setLoading(false));
  }, [hedge.id]);

  const handleRollback = async (entry: HistoryEntry) => {
    setRolling(entry.id);
    const res = await fetch(`${API.HEDGES}?id=${hedge.id}&action=rollback&history_id=${entry.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    const updated: HedgeRow = await res.json();
    onRollback(updated);
    setRolling(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <div className="font-semibold text-[#1a3a2a] text-sm">История изменений</div>
            <div className="text-xs text-[#6b7c6e]">🌿 №{hedge.number} — {hedge.name}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {loading && (
            <div className="text-center text-xs text-[#6b7c6e] py-8">Загрузка...</div>
          )}
          {!loading && history.length === 0 && (
            <div className="text-center text-xs text-[#6b7c6e] py-8">История изменений пуста</div>
          )}
          {history.map((entry, i) => {
            const snap = entry.snapshot;
            const next = i === 0 ? hedge : history[i - 1].snapshot;
            return (
              <div key={entry.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-semibold text-[#1a3a2a]">{formatDate(entry.changedAt)}</div>
                    {entry.changedBy && (
                      <div className="text-[10px] text-[#6b7c6e]">👤 {entry.changedBy}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleRollback(entry)}
                    disabled={rolling === entry.id}
                    className="text-[10px] px-2.5 py-1 rounded-md bg-[#2d6a4f] text-white hover:bg-[#1a3a2a] transition-colors disabled:opacity-50"
                  >
                    {rolling === entry.id ? '...' : '↩ Откатить'}
                  </button>
                </div>
                <div className="space-y-0.5">
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-[#6b7c6e] mb-1 font-medium">
                    <div>Поле</div><div>Было</div><div>Стало</div>
                  </div>
                  <DiffRow label="Название" before={snap.name} after={next.name} />
                  <DiffRow label="Вид" before={snap.species} after={next.species} />
                  <DiffRow label="Состояние" before={STATUS_LABELS[snap.status]} after={STATUS_LABELS[next.status]} />
                  <DiffRow label="Категория" before={CONDITION_LABELS[snap.condition]} after={CONDITION_LABELS[next.condition]} />
                  <DiffRow label="Длина" before={snap.lengthM ? `${snap.lengthM.toFixed(1)} м` : '—'} after={next.lengthM ? `${next.lengthM.toFixed(1)} м` : '—'} />
                  <DiffRow label="Адрес" before={snap.address} after={next.address} />
                  <DiffRow label="Примечание" before={snap.description} after={next.description} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
