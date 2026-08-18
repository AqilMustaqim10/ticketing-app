/**
 * Dashboard Component (Phase 6 Final)
 *
 * Fully integrated multi-tenant ticketing dashboard with stat cards, filters,
 * creation modals, and interactive status management.
 */

import React, { useState, useEffect } from "react";
import API from "../services/api";
import CreateTicketModal from "./CreateTicketModal";
import TicketDetailModal from "./TicketDetailModal";
import {
  LogOut,
  Calendar,
  Building,
  Layers,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Plus,
} from "lucide-react";

export default function Dashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filter states
  const [timeframe, setTimeframe] = useState("ALL");
  const [selectedBU, setSelectedBU] = useState("ALL");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await API.get("/tickets");
      setTickets(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tickets.");
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (selectedBU !== "ALL" && ticket.businessUnit.code !== selectedBU) {
      return false;
    }

    if (timeframe === "ALL") return true;

    const ticketDate = new Date(ticket.createdAt);
    const now = new Date();

    if (timeframe === "DAILY") {
      return ticketDate.toDateString() === now.toDateString();
    } else if (timeframe === "WEEKLY") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return ticketDate >= oneWeekAgo;
    } else if (timeframe === "MONTHLY") {
      return (
        ticketDate.getMonth() === now.getMonth() &&
        ticketDate.getFullYear() === now.getFullYear()
      );
    } else if (timeframe === "YEARLY") {
      return ticketDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  const totalCount = filteredTickets.length;
  const openCount = filteredTickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = filteredTickets.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const resolvedCount = filteredTickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED",
  ).length;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse";
      case "HIGH":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "LOW":
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "IN_PROGRESS":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "RESOLVED":
      case "CLOSED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-500/30">
            {user.role}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              IT Ticketing Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Welcome back, {user.fullName} ({user.businessUnit?.name})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-600/30"
          >
            <Plus size={16} />
            <span>New Ticket</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center mr-2">
              <Calendar size={14} className="mr-1" /> Timeframe:
            </span>
            {["ALL", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  timeframe === tf
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {tf.charAt(0) + tf.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
              <Building size={14} className="mr-1" /> Business Unit:
            </span>
            <select
              value={selectedBU}
              onChange={(e) => setSelectedBU(e.target.value)}
              disabled={user.role !== "ADMIN"}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
            >
              <option value="ALL">All Business Units</option>
              <option value="CCEC">CCEC (Convention Centre)</option>
              <option value="FNB">FNB (Food & Beverage)</option>
              <option value="HOTEL">HOTEL (Hospitality)</option>
            </select>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Tickets
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {totalCount}
              </h3>
            </div>
            <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl border border-indigo-500/20">
              <Layers size={24} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Open Tickets
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {openCount}
              </h3>
            </div>
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20">
              <ShieldAlert size={24} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                In Progress
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {inProgressCount}
              </h3>
            </div>
            <div className="bg-purple-500/10 text-purple-400 p-3 rounded-xl border border-purple-500/20">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Resolved / Closed
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {resolvedCount}
              </h3>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        {/* Ticket List Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Support Tickets ({filteredTickets.length})
            </h2>
            <span className="text-xs text-slate-400">
              Click any row to manage status
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading tickets...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No tickets found matching the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                    <th className="py-3 px-6">Ticket #</th>
                    <th className="py-3 px-6">Title</th>
                    <th className="py-3 px-6">Business Unit</th>
                    <th className="py-3 px-6">Priority</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <td className="py-4 px-6 font-mono text-indigo-400 font-medium">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-4 px-6 text-white font-medium">
                        {ticket.title}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-semibold">
                        {ticket.businessUnit?.code}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityBadge(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(ticket.status)}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* New Ticket Modal */}
      {isCreateModalOpen && (
        <CreateTicketModal
          user={user}
          onClose={() => setIsCreateModalOpen(false)}
          onTicketCreated={fetchTickets}
        />
      )}

      {/* Ticket Detail / Status Update Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          user={user}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={fetchTickets}
        />
      )}
    </div>
  );
}
