// src/components/authentication/loginComponent.jsx
import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import CustomTextField from "../CustomTextField";
import CustomButton from "../CustomButton";
import Checkbox from "../common/Checkbox";
import { useLogin } from "../../hooks/auth/useLogin.js";
import { getIsLoggedIn } from "../../auth/authStorage.js";

import bg from "../../assets/bg-image.png";
import taukLogo from "../../assets/tauk-logo.svg";
import googleIcon from "../../assets/google.svg"; 

export default function LoginComponent() {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useLogin();

  // If already logged in, take user to dashboard
  useEffect(() => {
    if (getIsLoggedIn()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      setSubmitting(true);
      setErrors({});
      setError("");
      try {
        await login({
          email: values.email.trim(),
          password: values.password,
          remember: values.remember,
        });
        navigate("/dashboard");
      } catch (e) {
        setErrors({ general: e?.message || "Invalid email or password" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGoogleSignIn = () => {
    console.log("Google sign-in clicked");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="bg-white shadow-md rounded-[20px] sm:rounded-[28px] px-6 sm:px-8 md:px-10 py-3 sm:py-12 w-full max-w-sm sm:max-w-md lg:max-w-[480px]">
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-">
          <img src={taukLogo} alt="Logo" className="h-[50px] sm:h-[66px] w-auto" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-[26px] font-semibold text-center mb-1">
          Welcome Back
        </h2>
        <p className="text-sm sm:text-base text-neutral text-center mb-6 sm:mb-10">
          Sign in to continue to your account
        </p>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* General error */}
          {(formik.errors.general || error) && (
            <div className="text-sm text-red-600 text-center">
              {formik.errors.general || error}
            </div>
          )}

          {/* Email Field */}
          <CustomTextField
            name="email"
            type="email"
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email ? formik.errors.email : ""}
          />

          {/* Password Field */}
          <CustomTextField
            name="password"
            type="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password ? formik.errors.password : ""}
          />

          {/* Remember me + Forgot Password - using shared Checkbox */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 gap-2">
            <Checkbox
              name="remember"
              checked={!!formik.values.remember}
              onChange={(e) => formik.setFieldValue("remember", e.target.checked)}
              label="Remember me"
              checkboxSize="w-5 h-5"
              labelClassName="text-sm text-[#374151] font-normal"
            />

            <Link to="/forgot-password" className="text-sm text-[#0189CD] hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Primary Sign In button */}
          <CustomButton
            type="submit"
            fullWidth={true}
            className="mt-2 !text-[16px] font-medium"
            position="center"
            disabled={formik.isSubmitting || loading}
          >
            {formik.isSubmitting || loading ? "Signing in..." : "Sign In"}
          </CustomButton>

          {/* OR divider */}
          {/* <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-[#D6DAE6]" />
            <div className="text-xs text-[#78829D]">OR</div>
            <div className="flex-1 h-px bg-[#D6DAE6]" />
          </div> */}

          {/* Google Sign-In */}
          {/* <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full mt-4 flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer"
              aria-label="Sign in with Google"
            >
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              <span className="text-xs font-medium text-[#4B5675]">Login with Google</span>
            </button>
          </div> */}
        </form>
      </div>
    </div>
  );
}
