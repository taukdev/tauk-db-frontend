import React from 'react'
import CustomTitle from '../components/CustomTitle'
import VendorList from '../components/vendors/VendorList';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../features/breadcrumb/breadcrumbSlice';
import { useEffect } from 'react'
function VendorsPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setBreadcrumbs([
        { label: "Vendors", path: "/vendors" },
      ])
    );
  }, [dispatch]);
  
  return (
    <>
      <CustomTitle> Vendors </CustomTitle>
      <VendorList />
    </>
  )
}

export default VendorsPage
