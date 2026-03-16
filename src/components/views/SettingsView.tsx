import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { ClientSeat } from '../../types';
import { Save } from 'lucide-react';

export default function SettingsView() {
  const [seats, setSeats] = useState<ClientSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSeats();
  }, []);

  async function fetchSeats() {
    setLoading(true);
    const { data } = await supabase.from('client_seats').select('*').order('company_name');
    if (data) setSeats(data);
    setLoading(false);
  }

  async function updateSeat(id: string, updates: Partial<ClientSeat>) {
    setSaving(true);
    await supabase.from('client_seats').update(updates).eq('id', id);
    await fetchSeats();
    setSaving(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-secondary">Loading settings...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-primary">Client Seat Management</h2>
        <p className="text-sm text-secondary mt-1">Configure seat counts and cycle start dates for each client.</p>
      </div>

      <div className="dashboard-card overflow-hidden">
        {/* Header */}
        <div
          className="grid items-center gap-4 px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider"
          style={{
            gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <span>Client Name</span>
          <span>Company ID</span>
          <span>Seats</span>
          <span>Cycle Start</span>
          <span>Save</span>
        </div>

        {seats.map((seat) => (
          <SeatRow key={seat.id} seat={seat} onSave={updateSeat} saving={saving} />
        ))}

        {seats.length === 0 && (
          <div className="px-4 py-8 text-center text-secondary">
            No client seats configured yet. Add them in your Supabase <code>client_seats</code> table.
          </div>
        )}
      </div>
    </div>
  );
}

function SeatRow({
  seat,
  onSave,
  saving,
}: {
  seat: ClientSeat;
  onSave: (id: string, updates: Partial<ClientSeat>) => void;
  saving: boolean;
}) {
  const [seatCount, setSeatCount] = useState(seat.seat_count);
  const [cycleStart, setCycleStart] = useState(seat.cycle_start_date);
  const hasChanges = seatCount !== seat.seat_count || cycleStart !== seat.cycle_start_date;

  return (
    <div
      className="grid items-center gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 0.5fr' }}
    >
      <span className="text-primary font-medium text-sm">{seat.company_name}</span>
      <span className="text-secondary text-xs font-mono">{seat.company_id}</span>
      <input
        type="number"
        value={seatCount}
        onChange={(e) => setSeatCount(parseInt(e.target.value) || 1)}
        min={1}
        className="input-field text-sm w-20"
      />
      <input
        type="date"
        value={cycleStart}
        onChange={(e) => setCycleStart(e.target.value)}
        className="input-field text-sm"
      />
      <button
        onClick={() => onSave(seat.id, { seat_count: seatCount, cycle_start_date: cycleStart })}
        disabled={!hasChanges || saving}
        className={`p-2 rounded-lg transition-colors ${
          hasChanges ? 'text-cyan hover:bg-cyan/10' : 'text-secondary/30 cursor-not-allowed'
        }`}
      >
        <Save size={16} />
      </button>
    </div>
  );
}
