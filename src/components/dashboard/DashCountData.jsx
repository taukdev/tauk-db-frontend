import React from "react";
import UserCheckIcon from '../../assets/icons/UserCheck-icon.svg';
import ArrowDownIcon from '../../assets/icons/ArrowDown-icon.svg';
import CrossxIcon from '../../assets/icons/Crossx-icon.svg';
import ChainIcon from '../../assets/icons/Chain-icon.svg';
import CubeIcon from '../../assets/icons/Cube-icon.svg';
import BgDashDataImage from '../../assets/Bg-dashdata-image.svg';

const stats = [
    { icon: UserCheckIcon, title: "Leads Systemwide", value: "7,334,903" },
    { icon: ArrowDownIcon, title: "Leads Imported Today", value: "1,765" },
    { icon: CrossxIcon, title: "Total Abandons Leads", value: "3,564" },
    { icon: ChainIcon, title: "Buyers leads", value: "7,342" },
    { icon: CubeIcon, title: "Declines Leads", value: "3,657" },
];

export default function DashCountData() {
    return (
        <div className="w-full max-w-full mx-auto">
            <div
                className="bg-white rounded-xl p-3 sm:p-4 md:p-2 w-full"
                style={{
                    border: "1px solid #8B92A633",
                    // Hide background on small screens by not setting it until md
                    backgroundImage: undefined,
                }}
            >
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full"
                    style={{
                        // Add decorative background only from md and up using a media query fallback
                        backgroundImage: `url(${BgDashDataImage})`,
                        backgroundPosition: 'right',
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {stats.map(({ icon, title, value }, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 min-w-[200px]"
                        >
                            <div className="flex items-center justify-center rounded-xl w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-primary flex-shrink-0">
                                <img
                                    src={icon}
                                    alt={title}
                                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-[#626C86] text-[12px] sm:text-[13px] md:text-[14px]">{title}</p>
                                <p className="font-semibold text-black text-[18px] sm:text-[20px] md:text-[24px]">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}