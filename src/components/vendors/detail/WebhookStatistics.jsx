import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Search, Globe, Copy, Check } from "lucide-react";

import UnionIcon from "../../../assets/icons/Union-icon.svg";
import { getVendorWebhooksApi } from "../../../api/vendors";
import { setBreadcrumbs } from "../../../features/breadcrumb/breadcrumbSlice";
import LoadingSpinner from "../../common/LoadingSpinner";

const WebhookStatistics = () => {
    const { id: vendorId } = useParams();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [copiedId, setCopiedId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getVendorWebhooksApi(vendorId);
            if (res?.status === "success") {
                setData(res.data);
            } else {
                setError("Failed to fetch webhook instructions");
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
        if (data) {
            const vName = data.vendor?.vendor_name || data.vendor?.company_name || `Vendor ${vendorId}`;
            dispatch(
                setBreadcrumbs([
                    { label: "Vendors", path: "/vendors" },
                    { label: vName, path: `/vendor/${vendorId}` },
                    { label: "Webhook Instructions", path: `/vendor/list/${vendorId}/webhook` },
                ])
            );
        }
    }, [dispatch, vendorId, data]);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredLists = data?.lists?.filter((list) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            list.list_name?.toLowerCase().includes(q) ||
            String(list.id).includes(q)
        );
    }) || [];

    return (
        <div className="w-full space-y-6">
       
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Link to={vendorId ? `/vendor/${vendorId}` : "/vendors"} className="cursor-pointer">
                            <img src={UnionIcon} alt="Back" className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <h1 className="text-xl font-semibold text-primary-dark">
                            Webhook Posting Instructions - {data?.vendor?.vendor_name || `Vendor ${vendorId}`}
                        </h1>
                    </div>
                    {data && (
                        <p className="text-gray-500 text-sm mt-1">
                            Total Lists: <span className="font-semibold text-primary">{data.total_lists || 0}</span>
                        </p>
                    )}
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search lists..."
                        className="w-full border border-gray-300 bg-neutral-input rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-xl border border-secondary-lighter p-12 text-center">
                        <LoadingSpinner text="Loading webhook data..." size="md" />
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl border border-red-200 p-12 text-center text-red-500">
                        {error}
                    </div>
                ) : filteredLists.length === 0 ? (
                    <div className="bg-white rounded-xl border border-secondary-lighter p-12 text-center text-gray-500 italic">
                        No lists found.
                    </div>
                ) : (
                    filteredLists.map((list) => (
                        <div
                            key={list.id}
                            className="bg-white rounded-xl border border-secondary-lighter p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-primary-dark">
                                        {list.id} - {list.list_name}
                                    </h3>
                                    {/* <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${list.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {list.list_status}
                                    </div> */}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="text-xs font-bold text-secondary-dark uppercase tracking-wider min-w-[100px]">
                                            Webhook URL
                                        </div>
                                        <div className="flex-1 flex items-center gap-2 group">
                                            <div className="flex-1 bg-secondary-light border border-secondary-lighter rounded-lg p-3 text-xs font-mono break-all text-primary-dark relative">
                                                {list.webhook_link}
                                                <button
                                                    onClick={() => handleCopy(list.webhook_link, list.id)}
                                                    className="absolute right-2 top-2 p-1.5 hover:bg-white rounded transition-colors"
                                                    title="Copy Webhook URL"
                                                >
                                                    {copiedId === list.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-400" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                        <Globe size={12} />
                                        <span>Created on {new Date(list.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WebhookStatistics;
