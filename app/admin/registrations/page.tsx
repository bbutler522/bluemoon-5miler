'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpDown,
  Loader2,
  Eye,
} from 'lucide-react';
import type { AdminRegistration } from '@/lib/admin';

const statusStyles: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  refunded: { icon: XCircle, color: 'text-stardust/50', bg: 'bg-stardust/5' },
};

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        sort,
        order,
      });
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/registrations?${params}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setRegistrations(data.registrations);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, status, search, sort, order]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  function toggleSort(field: string) {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl text-moonlight">Registrations</h2>
          <p className="text-xs text-stardust/40 mt-1">
            {total} total registration{total !== 1 ? 's' : ''}
          </p>
        </div>

        <a
          href={`/api/admin/registrations/export?status=${status}`}
          className="btn-secondary !py-2 !px-4 !text-xs"
        >
          Export Filtered CSV
        </a>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stardust/30"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input-field !pl-9"
            placeholder="Search by name or email..."
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input-field !w-auto min-w-[160px]"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-lunar-400/10">
                {[
                  { key: 'bib_number', label: 'Bib' },
                  { key: 'last_name', label: 'Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'payment_status', label: 'Status' },
                  { key: 'amount_paid', label: 'Paid' },
                  { key: 'shirt_size', label: 'Shirt' },
                  { key: 'created_at', label: 'Registered' },
                  { key: null, label: '' },
                ].map((col) => (
                  <th
                    key={col.label || 'action'}
                    className={`px-4 py-3 text-left text-[10px] uppercase tracking-widest text-stardust/40 font-semibold whitespace-nowrap ${
                      col.key ? 'cursor-pointer hover:text-stardust/70 select-none' : ''
                    }`}
                    onClick={() => col.key && toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.key && sort === col.key && (
                        <ArrowUpDown size={10} className="text-stardust/50" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2
                      size={20}
                      className="animate-spin text-stardust/30 mx-auto"
                    />
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-stardust/30"
                  >
                    No registrations found
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => {
                  const st = statusStyles[reg.payment_status] || statusStyles.pending;
                  const StatusIcon = st.icon;

                  return (
                    <tr
                      key={reg.id}
                      className="border-b border-lunar-400/5 hover:bg-midnight-900/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-stardust/50">
                        {reg.bib_number ? `#${reg.bib_number}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-moonlight font-medium whitespace-nowrap">
                        {reg.first_name} {reg.last_name}
                      </td>
                      <td className="px-4 py-3 text-stardust/50">{reg.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${st.bg} ${st.color}`}
                        >
                          <StatusIcon size={12} />
                          {reg.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-stardust/60">
                        ${Number(reg.amount_paid).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-stardust/50">
                        {reg.shirt_size || '—'}
                      </td>
                      <td className="px-4 py-3 text-stardust/40 whitespace-nowrap">
                        {new Date(reg.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/registrations/${reg.id}`}
                          className="text-stardust/30 hover:text-moonlight transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-lunar-400/10">
            <p className="text-xs text-stardust/30">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg text-stardust/40 hover:text-moonlight hover:bg-midnight-800/50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-stardust/40 hover:text-moonlight hover:bg-midnight-800/50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
