import React, { useEffect } from 'react'
import PlatFormPanel from '../components/platForms/PlatFormPanel'
import CustomTitle from '../components/CustomTitle'
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../features/breadcrumb/breadcrumbSlice';

function PlatformPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Platforms", path: "/platforms" },
            ])
        );
    }, [dispatch]);
    return (
        <>
            <CustomTitle>Platforms</CustomTitle>
            <PlatFormPanel />
        </>
    )
}

export default PlatformPage
