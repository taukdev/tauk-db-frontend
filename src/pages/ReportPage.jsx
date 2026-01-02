import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../features/breadcrumb/breadcrumbSlice';
import CustomTitle from '../components/CustomTitle';

function ReportPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Reports", path: "/reports" }
            ])
        );
    }, [dispatch]);

    return (
        <>
            <CustomTitle>Reports</CustomTitle>
        </>
    );
}

export default ReportPage;
