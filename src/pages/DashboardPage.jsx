import React, { useEffect } from 'react'
import DashCountData from '../components/dashboard/DashCountData'
import CustomTitle from '../components/CustomTitle'
import ActiveListsTable from '../components/dashboard/ActiveListsTable'
import { useDispatch, useSelector } from "react-redux";
import { setBreadcrumbs } from "../features/breadcrumb/breadcrumbSlice";

function DashboardPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Dashboard", path: "/dashboard" },
            ])
        );
    }, [dispatch]);

    return (
        <>
            <CustomTitle> Dashboard </CustomTitle>
            <DashCountData />
            <ActiveListsTable />
        </>
    )
}

export default DashboardPage
