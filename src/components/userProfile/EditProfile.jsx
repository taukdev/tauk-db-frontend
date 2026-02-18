// EditProfile.jsx
import React, { useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomTextField from '../CustomTextField';
import CommunicationIcon from '../../assets/icons/communication-icon.svg';
import DefaultUser from '../../assets/icons/DefaultUser.svg';
import BgMaskImage from '../../assets/Bg-Mask.svg';
import UnionIcon from '../../assets/icons/Union-icon.svg';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setBreadcrumbs } from '../../features/breadcrumb/breadcrumbSlice';
import CustomButton from '../CustomButton';
import Checkbox from '../common/Checkbox';
import { useMe } from '../../hooks/auth/useMe.js';

const permissionsList = [
    "Internal View Only for Orders",
    "See Login Credentials for Any User",
    "Delete Orders",
];

const alertsList = [
    "Platform Payment Ran Out",
    "Live Post Broken",
    "Priority Post Broken",
    "Bidding Post Broken",
    "File Import Summary",
    "Pending Lead Return(s)",
];

const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    fullName: Yup.string().required('Required'),
    username: Yup.string().required('Required'),
});

const EditProfile = () => {
    const dispatch = useDispatch();
    const { me, loading: meLoading, error: meError } = useMe();

    const profile = useMemo(() => {
        // Support common backend shapes:
        // { email, name, username } OR { user: { ... } } OR { data: { ... } }
        const base = (me && typeof me === 'object' ? me : {}) || {};
        const u = base.user || base.data?.user || base.data || base.profile || base.me || {};

        const email = u.email || base.email || '';
        const fullName = u.name || u.fullName || u.full_name || base.name || '';
        const username = u.username || u.user_name || u.handle || base.username || '';

        return { email, fullName, username };
    }, [me]);

    const formik = useFormik({
        initialValues: {
            email: profile.email || '',
            fullName: profile.fullName || '',
            username: profile.username || '',
            status: 'Active',
            permissions: [],
            alerts: [],
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values) => {
            alert(JSON.stringify(values, null, 2));
        },
    });

    /**
     * Toggle helper for array fields stored in Formik.
     * field: string (name in formik.values)
     * value: item to toggle (string)
     */
    const handleCheckboxChange = (field, value) => {
        const current = formik.values[field] || [];
        const set = new Set(current);
        set.has(value) ? set.delete(value) : set.add(value);
        formik.setFieldValue(field, Array.from(set));
    };

    useEffect(() => {
        dispatch(
            setBreadcrumbs([
                { label: "Dashboard", path: "/dashboard" },
                { label: "Edit Profile", path: "/edit-profile" },
            ])
        );
    }, [dispatch]);

    return (
        <>
            <div>
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <div className='flex items-center gap-2 md:gap-4 text-primary-dark font-bold text-md'>
                        <img src={UnionIcon} alt="" />
                        <h2 className="text-md text-primary-dark font-bold">Edit Profile</h2>
                    </div>
                </Link>
            </div>
            <div className="p-0 mt-2 md:mt-0 md:p-2 min-h-screen">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md">
                    <div className="p-5">
                        <h2 className="text-md text-primary-dark font-bold">Profile Information</h2>
                    </div>
                    <hr className="border-t border-[#F1F1F4]" />
                    <div>
                        {meError && (
                            <div className="px-6 pt-4 text-sm text-red-600">
                                {meError}
                            </div>
                        )}
                        {/* Profile Avatar Section */}
                        <div className="relative flex flex-col items-center mb-6 p-6 md:p-6">
                            {/* Transparent background image overlay */}
                            <div
                                className="absolute inset-0 bg-no-repeat bg-center bg-cover md:bg-contain opacity-60 pointer-events-none"
                                style={{ backgroundImage: `url(${BgMaskImage})` }}
                            />
                            {/* Foreground content */}
                            <img
                                src={DefaultUser}
                                alt="User Avatar"
                                className="w-24 h-24 rounded-full border-3 border-[#01A9EA] relative z-10"
                            />
                            <h3 className="mt-2 text-lg font-bold relative z-10">
                                {profile.fullName || (meLoading ? "Loading..." : "—")}
                            </h3>
                            <div className="flex items-center gap-1 mt-1 relative z-10">
                                <img src={CommunicationIcon} alt="" />
                                <p className="text-sm text-gray-500">
                                    {profile.email || (meLoading ? "Loading..." : "—")}
                                </p>
                            </div>
                        </div>

                        <div className='mx-6 mt-0 md:m-10 md:mt-7'>
                            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-2">

                                {/* Email */}
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                    <label className="w-full md:w-1/4 text-sm text-neutral  mb-0 md:mb-4">User’s Email</label>
                                    <div className="w-full md:w-3/4">
                                        <CustomTextField
                                            name="email"
                                            type="email"
                                            placeholder="Enter email address"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.email ? formik.errors.email : ""}
                                        />
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                    <label className="w-full md:w-1/4 text-sm text-neutral  mb-0 md:mb-4">User’s Full Name</label>
                                    <div className="w-full md:w-3/4">
                                        <CustomTextField
                                            name="fullName"
                                            type="text"
                                            placeholder="Enter full name"
                                            value={formik.values.fullName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.fullName ? formik.errors.fullName : ""}
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                    <label className="w-full md:w-1/4 text-sm text-neutral  mb-0 md:mb-4">Username</label>
                                    <div className="w-full md:w-3/4">
                                        <CustomTextField
                                            name="username"
                                            type="text"
                                            placeholder="Enter username"
                                            value={formik.values.username}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.username ? formik.errors.username : ""}
                                        />
                                    </div>
                                </div>

                                {/* User Status */}
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                                    <label className="w-full md:w-1/4 text-sm text-neutral  mb-0 md:mb-4">User Status</label>
                                    <div className="w-full md:w-3/4">
                                        <CustomTextField
                                            name="status"
                                            isSelect={true}
                                            options={[
                                                { label: "Active", value: "Active" },
                                                { label: "Disable", value: "Disable" },
                                            ]}
                                            value={formik.values.status}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            error={formik.touched.status ? formik.errors.status : ""}
                                        />
                                    </div>
                                </div>           
                                {/* Submit Button */}
                                <CustomButton type="submit" className="mt-6 mb-6">
                                    {meLoading ? "Loading..." : "Save Information"}
                                </CustomButton>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditProfile;
