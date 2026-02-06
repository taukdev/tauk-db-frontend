import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ChevronDown, ChevronUp, Eye, Search } from "lucide-react";

import UnionIcon from "../../../assets/icons/Union-icon.svg";
import { getWebhookStatsApi } from "../../../api/vendors";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import LoadingSpinner from "../../common/LoadingSpinner";
import Pagination from "../../common/Pagination";

const WebhookStatistics = () => {
    const { id: vendorId } = useParams();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getWebhookStatsApi(vendorId);
            if (res?.status === "success") {
                setStats(res.data);
            } else {
                setError("Failed to fetch webhook statistics");
            }
        } catch (err) {
            console.error("Error fetching webhook stats:", err);
            setError(err?.message || "An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vendorId]);

    useEffect(() => {
        if (stats) {
            const vName = stats.Vendor?.vendor_name || stats.Vendor?.company_name || `Vendor ${vendorId}`;
            dispatch(
                setBreadcrumbs([
                    { label: "Vendors", path: "/vendors" },
                    { label: vName, path: `/vendor/${vendorId}` },
                    { label: "Webhook Statistics", path: `/vendor/list/${vendorId}/webhook` },
                ])
            );
        }
    }, [dispatch, vendorId, stats]);

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const filteredHistory = stats?.recent_webhooks?.filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            item.webhook_url?.toLowerCase().includes(q) ||
            item._id?.toLowerCase().includes(q)
        );
    }) || [];

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Link to={stats?.vendor_id ? `/vendor/${stats.vendor_id}` : "/vendors"} className="cursor-pointer">
                            <img src={UnionIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <h1 className="text-xl font-semibold text-primary-dark">
                            Webhook History - {stats?.Vendor?.vendor_name || `Vendor ${vendorId}`}
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Total Webhooks: <span className="font-semibold text-primary">{stats?.total_webhooks || 0}</span>
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search history..."
                        className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-custom-lg border border-secondary-lighter shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-neutral-input border-b border-secondary-lighter">
                            <tr>
                                <th className="px-5 py-4 font-semibold text-secondary text-xs uppercase tracking-wider w-10"></th>
                                <th className="px-5 py-4 font-semibold text-secondary text-xs uppercase tracking-wider">Webhook URL</th>
                                <th className="px-5 py-4 font-semibold text-secondary text-xs uppercase tracking-wider">Date & Time</th>
                                <th className="px-5 py-4 font-semibold text-secondary text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-lighter">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center">
                                        <LoadingSpinner text="Loading webhook data..." size="md" />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-gray-500 italic">
                                        No webhook history found.
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((item) => (
                                    <React.Fragment key={item._id}>
                                        <tr className={`hover:bg-gray-50 transition-colors ${expandedRows.has(item._id) ? 'bg-primary/5' : ''}`}>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => toggleRow(item._id)}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                >
                                                    {expandedRows.has(item._id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4 text-primary-dark font-medium break-all">{item.webhook_url || '-'}</td>
                                            <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    onClick={() => toggleRow(item._id)}
                                                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-semibold text-xs transition-colors whitespace-nowrap"
                                                >
                                                    <Eye size={14} /> {expandedRows.has(item._id) ? 'Hide Data' : 'View Payload'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Row for Payload */}
                                        {expandedRows.has(item._id) && (
                                            <tr className="bg-gray-50 shadow-inner">
                                                <td colSpan={4} className="px-8 md:px-12 py-6 border-l-4 border-primary">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-bold text-primary-dark uppercase tracking-tight">Payload Details</h4>
                                                            <div className="flex gap-2">
                                                                <span className="text-[10px] text-gray-400 font-mono">ID: {item._id}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-[#1e293b] rounded-xl p-5 shadow-lg max-h-[400px] overflow-auto border border-gray-700 custom-scrollbar">
                                                            <pre className="text-xs text-blue-200 font-mono whitespace-pre-wrap leading-relaxed">
                                                                {JSON.stringify(item.payload, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 text-right italic font-medium">
                                                            Processing Status: <span className="uppercase">{item.processing_status}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WebhookStatistics;
