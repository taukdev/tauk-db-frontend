import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomTextField from '../components/CustomTextField';
import DangerCircleIcon from '../assets/icons/DangerCircle-icon.svg';
import CustomTitle from '../components/CustomTitle';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../features/breadcrumb/breadcrumbSlice';
import CustomButton from '../components/CustomButton';
const searchOptions = [
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'IP', value: 'ip' },
    { label: 'First and Last Name', value: 'fullname' },
    { label: 'Offer URL', value: 'offer_url' },
    { label: 'First Name', value: 'first_name' },
    { label: 'Last Name', value: 'last_name' },
    { label: 'ID', value: 'id' },
];

const validationSchema = Yup.object({
    searchBy: Yup.string().required('Please select a search field'),
    searchQuery: Yup.string().required('Please enter a value to search'),
});

const SearchReport = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Search Records", path: "/search-records" }
            ])
        );
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            searchBy: '',
            searchQuery: '',
        },
        validationSchema,
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
            // Handle your search logic here
        },
    });

    return (
        <>
            <CustomTitle> Search Records </CustomTitle>
            <div className="p-4 md:p-10 min-h-screen">
                <div className="max-w-5xl mx-auto mb-3">
                    <div className="text-xs flex flex-col md:flex-row items-center gap-1 text-center md:text-left">
                        <img src={DangerCircleIcon} alt="" className="w-4 h-4 flex-shrink-0" />
                        <p className='text-neutral'>
                            If you search by Offer Url, First Name or Last Name, you will only see the
                            top 100 results of the search as these parameters usually generate large
                            result sets.
                        </p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md">
                    <div className="p-5">
                        <h2 className="text-md text-primary-dark font-bold">Sales Report</h2>
                    </div>
                    <hr className="border-t border-[#F1F1F4]" />
                    <div className="mx-6 mt-5 md:m-10 md:mt-7">
                        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

                            {/* Search By */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    Search By
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        size='sm'
                                        name="searchBy"
                                        isSelect={true}
                                        options={searchOptions}
                                        placeholder="Select vendor"
                                        value={formik.values.searchBy}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.searchBy ? formik.errors.searchBy : ""}
                                    />
                                </div>
                            </div>

                            {/* Search Query */}
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                <label className="w-full md:w-1/4 text-sm text-neutral">
                                    What to Search?
                                </label>
                                <div className="w-full md:w-3/4">
                                    <CustomTextField
                                        size='sm'
                                        name="searchQuery"
                                        type="text"
                                        placeholder="What do you want to search"
                                        value={formik.values.searchQuery}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.searchQuery ? formik.errors.searchQuery : ""}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <CustomButton
                                type="submit"
                                position="end"
                                className="mb-6"
                            >
                                Search
                            </CustomButton>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchReport;