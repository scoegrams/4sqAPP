import React, { useCallback, useEffect, useState } from 'react';
import { Inbox, Loader2, RefreshCw } from 'lucide-react';
import { supabase, hasSupabase } from '../lib/supabase';
import {
  fetchPartyInquiries,
  updatePartyInquiryStatus,
  type PartyInquiryRow,
} from '../lib/partyInquiry';

const TYPE_LABELS: Record<PartyInquiryRow['inquiry_type'], string> = {
  catering: 'Catering',
  venue: 'Venue',
  table: 'Table',
};

const PartyInquiriesPanel: React.FC = () => {
  const [rows, setRows] = useState<PartyInquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hasSupabase() || !supabase) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPartyInquiries(supabase);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: PartyInquiryRow['status']) => {
    if (!supabase) return;
    await updatePartyInquiryStatus(supabase, id, status);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  if (!hasSupabase()) {
    return (
      <p className="text-xs text-[#5c564d]">
        Connect Supabase and run migration <code className="text-[10px]">008_party_inquiries.sql</code> to receive online party requests.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[#5c564d]">
          New party / event form submissions from the Host Your Party page.
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2d3d2d] border border-[#c4beb5] px-2 py-1 hover:bg-white"
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-xs text-[#5c564d]">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {!loading && rows.length === 0 && (
        <p className="text-xs text-[#5c564d] flex items-center gap-2">
          <Inbox size={14} /> No inquiries yet.
        </p>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {rows.map((row) => (
          <div key={row.id} className="border-2 border-[#c4beb5] bg-white p-3 text-xs space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-[#2d3d2d]">
                {TYPE_LABELS[row.inquiry_type]} · {row.name}
              </span>
              <select
                value={row.status}
                onChange={(e) => void setStatus(row.id, e.target.value as PartyInquiryRow['status'])}
                className="text-[10px] font-bold uppercase border border-[#c4beb5] px-1 py-0.5"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <p className="text-[#5c564d]">
              <a href={`mailto:${row.email}`} className="underline">{row.email}</a>
              {' · '}
              <a href={`tel:${row.phone}`} className="underline">{row.phone}</a>
            </p>
            {(row.event_date || row.event_time || row.head_count) && (
              <p className="text-[#5c564d]">
                {row.event_date && `Date: ${row.event_date}`}
                {row.event_time && ` · ${row.event_time}`}
                {row.head_count != null && ` · ${row.head_count} guests`}
              </p>
            )}
            {row.details && <p className="text-[#5c564d] leading-snug">{row.details}</p>}
            <p className="text-[10px] text-[#8a8580]">
              {new Date(row.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartyInquiriesPanel;
