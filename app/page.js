import React from "react";
import HomePage from "@/src/components/Cus/HPage/HomePage"
import HomePageAdmin from "@/src/components/Admin/HPage/HomePage";
const page = () => {
    return (
        <div className="w-[100vw] h-[100vh]">
            <HomePage></HomePage>
            {/* <HomePageAdmin></HomePageAdmin> */}
        </div>

    );
};

export default page;