import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import CustomTitle from "../components/CustomTitle";
import { setBreadcrumbs } from "../features/breadcrumb/breadcrumbSlice";
import ActiveCampaignsPanel from "../components/activeCampaigns/ActiveCampaignsPanel";

const ActiveCampaignsPage = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Active Campaigns", path: "/active-campaigns" },
            ])
        );
    }, [dispatch]);

    return (
        <>
            <CustomTitle>Active Campaigns</CustomTitle>
            <ActiveCampaignsPanel />
        </>
    );
};

export default ActiveCampaignsPage;

