/**
 * Dashboard Component
 *
 * Displays tickets with Timeframe filters (Daily, Weekly, Monthly, Yearly)
 * and Business Unit scoping selectors based on user roles.
 */

import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  LogOut,
  Filter,
  Calendar,
  Building,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function Dashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [timeframe, setTimeframe] = useState("ALL"); // ALL, DAILY, WEEKLY, MONTHLY, YEARLY
  const [selectedBU, setSelectedBU] = useState("ALL"); // ALL or specific BU code

  // Fetch tickets on mount
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

  // Filter tickets based on Timeframe and Business Unit selection
  const filteredTickets = tickets.filter((ticket) => {
    // Business Unit filter logic
    if (selectedBU !== "ALL" && ticket.businessUnit.code !== selectedBU) {
      return false;
    }

    // Timeframe filter logic
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg font-bold border border-indigo-500/30">
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

        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Timeframe Filters */}
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

          {/* Business Unit Selector (Admin sees all, agents/users scoped) */}
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

        {/* Ticket List Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Support Tickets ({filteredTickets.length})
            </h2>
            <span className="text-xs text-slate-400">
              Showing filtered results
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
                      className="hover:bg-slate-800/30 transition"
                    >
                      <td className="py-4 px-6 font-mono text-indigo-400 font-medium">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-4 px-6 text-white font-medium">
                        {ticket.title}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {ticket.businessUnit?.code}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
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
    </div>
  );
}
