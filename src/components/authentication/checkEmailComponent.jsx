import { useLocation, useNavigate } from "react-router-dom";
import bg from "../../assets/bg-image.png";
import taukLogo from "../../assets/Tauk-Logo.svg";
import checkEmail from "../../assets/check-email.svg";
import CustomButton from "../CustomButton";

export default function CheckEmailComponent() {
  const location = useLocation();
  const navigate = useNavigate();

  const userEmail = location.state?.email || "your-email@example.com";

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-center flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-x-hidden relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Logo */}
      <div className="absolute top-5 left-5">
        <img
          src={taukLogo}
          alt="Logo"
          className="h-[50px] sm:h-[66px] w-auto"
        />
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-[20px] sm:rounded-[28px] px-6 sm:px-8 md:px-10 py-8 sm:py-12 w-full max-w-sm sm:max-w-md lg:max-w-[480px] text-center">
        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <img
            src={checkEmail}
            alt="Check your email"
            className="w-[120px] sm:w-[150px] md:w-[180px]"
          />
        </div>

        {/* Title */}
        <h2 className="text-[18px] sm:text-[14px] md:text-[16px] font-semibold mb-4">
          Check your email
        </h2>

        {/* Message */}
        <p className="text-sm sm:text-base text-neutral mb-8 sm:mb-12 leading-relaxed">
          Please click the link sent to your email <br />
          <span className="font-semibold break-all">{userEmail}</span> to reset
          your password
        </p>

        {/* Back to Login Button */}
        <CustomButton
          onClick={() => navigate("/")}
          fullWidth={true}
          className="sm:w-auto px-6 lg:min-w-[160px] !text-[16px]"
          position="center"
        >
          Back to Login
        </CustomButton>

        {/* Resend link */}
        <p className="text-sm sm:text-base text-neutral mt-6">
          Didn’t receive an email?{" "}
          <button className="text-[#0189CD] font-medium hover:underline cursor-pointer">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
