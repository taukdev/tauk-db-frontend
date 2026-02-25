import React, { useEffect, useState } from 'react'
import DashCountData from '../components/dashboard/DashCountData'
import CustomTitle from '../components/CustomTitle'
import ActiveListsTable from '../components/dashboard/ActiveListsTable'
import { useDispatch, useSelector } from "react-redux";
import { setBreadcrumbs } from "../features/breadcrumb/breadcrumbSlice";
import { fetchVendors } from "../features/vendor/vendorSlice";

function DashboardPage() {
    const dispatch = useDispatch();
    const vendors = useSelector((state) => state.vendors.vendors || []);
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const [selectedLeadTypeId, setSelectedLeadTypeId] = useState("");

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Dashboard", path: "/dashboard" },
            ])
        );
    }, [dispatch]);

    // Always fetch vendors when the dashboard mounts (navigating to it)
    // so the vendor dropdown in ActiveListsTable is always populated
    useEffect(() => {
        dispatch(fetchVendors({ page: 1, limit: 100 }));
    }, [dispatch]);

    return (
        <>
            <CustomTitle> Dashboard </CustomTitle>
            <DashCountData
              dateRange={dateRange}
              selectedLeadTypeId={selectedLeadTypeId}
            />
            <ActiveListsTable
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedLeadTypeId={selectedLeadTypeId}
              onLeadTypeChange={setSelectedLeadTypeId}
            />
        </>
    )
}

export default DashboardPage
