import React, { useEffect, useMemo, useState } from "react";
import UserCheckIcon from '../../assets/icons/UserCheck-icon.svg';
import ArrowDownIcon from '../../assets/icons/ArrowDown-icon.svg';
import CrossxIcon from '../../assets/icons/Crossx-icon.svg';
import ChainIcon from '../../assets/icons/Chain-icon.svg';
import CubeIcon from '../../assets/icons/Cube-icon.svg';
import BgDashDataImage from '../../assets/Bg-dashdata-image.svg';
import { getVendorListsApi } from "../../api/vendors";

export default function DashCountData({ dateRange, selectedLeadTypeId }) {
    const [summary, setSummary] = useState({
        leads_systemwide: 0,
        leads_today: 0,
        abandons: 0,
        buyers: 0,
        declines: 0,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                setError(null);
                const res = await getVendorListsApi(
                    1,
                    10,
                    null,
                    "active",
                    selectedLeadTypeId ? Number(selectedLeadTypeId) : null,
                    dateRange?.startDate || null,
                    dateRange?.endDate || null
                );
                let lists = [];
                let sum = {};
                if (Array.isArray(res?.data?.lists)) {
                    lists = res.data.lists;
                    sum = res.data.summary || res.summary || {};
                } else if (Array.isArray(res?.data?.data)) {
                    lists = res.data.data;
                    sum = res.data.summary || res.summary || {};
                } else if (Array.isArray(res?.data)) {
                    lists = res.data;
                    sum = res.summary || {};
                } else if (Array.isArray(res)) {
                    lists = res;
                    sum = {};
                }
                const totalLeads = lists.reduce((acc, item) => acc + (Number(item.total_leads) || 0), 0);
                if (mounted) {
                    setSummary({
                        leads_systemwide: sum.leads_systemwide ?? totalLeads,
                        leads_today: sum.leads_today ?? 0,
                        abandons: sum.abandons ?? 0,
                        buyers: sum.buyers ?? 0,
                        declines: sum.declines ?? 0,
                    });
                }
            } catch (e) {
                if (mounted) setError(e?.message || "Failed to load");
            }
        };
        fetchData();
        return () => {
            mounted = false;
        };
    }, [selectedLeadTypeId, dateRange?.startDate, dateRange?.endDate]);

    const stats = useMemo(() => ([
        { icon: UserCheckIcon, title: "Leads Systemwide", value: (summary.leads_systemwide || 0).toLocaleString() },
        { icon: ArrowDownIcon, title: "Leads Imported Today", value: String(summary.leads_today || 0) },
        { icon: CrossxIcon, title: "Total Abandons Leads", value: String(summary.abandons || 0) },
        { icon: ChainIcon, title: "Buyers leads", value: String(summary.buyers || 0) },
        { icon: CubeIcon, title: "Declines Leads", value: String(summary.declines || 0) },
    ]), [summary]);

    return (
        <div className="w-full max-w-full mx-auto">
            <div
                className="bg-white rounded-xl p-3 sm:p-4 md:p-2 w-full"
                style={{
                    border: "1px solid #8B92A633",
                    backgroundImage: undefined,
                }}
            >
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full"
                >
                    {stats.map(({ icon, title, value }, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 min-w-[200px]"
                        >
                            <div className="flex items-center justify-center rounded-xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-primary flex-shrink-0">
                                <img
                                    src={icon}
                                    alt={title}
                                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-[#626C86] text-[12px] sm:text-[13px] md:text-[14px]">{title}</p>
                                <p className="font-semibold text-black text-[18px] sm:text-[20px] md:text-[24px]">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
