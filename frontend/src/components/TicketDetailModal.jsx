/**
 * Ticket Detail Modal Component
 *
 * Displays full ticket information and allows agents/admins to update status.
 */

import React, { useState } from "react";
import API from "../services/api";
import { X, CheckCircle, Clock, ShieldAlert, UserCheck } from "lucide-react";

export default function TicketDetailModal({
  ticket,
  user,
  onClose,
  onTicketUpdated,
}) {
  const [status, setStatus] = useState(ticket.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStatusUpdate = async (newStatus) => {
    setError("");
    setLoading(true);

    try {
      await API.patch(`/tickets/${ticket.id}/status`, { status: newStatus });
      setLoading(false);
      onTicketUpdated();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "Failed to update ticket status.");
    }
  };

  const isAgentOrAdmin = user.role === "ADMIN" || user.role === "AGENT";

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <span className="text-xs font-mono text-indigo-400 font-bold">
              {ticket.ticketNumber}
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Description
            </h3>
            <p className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300">
              {ticket.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">
                Business Unit
              </span>
              <span className="font-semibold text-white">
                {ticket.businessUnit?.name}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">
                Priority Level
              </span>
              <span className="font-semibold text-indigo-400">
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">
                Current Status
              </span>
              <span className="font-semibold text-blue-400">
                {ticket.status}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">
                Created By
              </span>
              <span className="font-semibold text-white">
                {ticket.createdBy?.fullName || "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls for Agents / Admins */}
        {isAgentOrAdmin ? (
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Update Ticket Status
            </label>
            <div className="flex flex-wrap gap-2">
              {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((st) => (
                <button
                  key={st}
                  disabled={loading}
                  onClick={() => handleStatusUpdate(st)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                    ticket.status === st
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            Only support agents and admins can modify ticket statuses.
          </div>
        )}
      </div>
    </div>
  );
}
