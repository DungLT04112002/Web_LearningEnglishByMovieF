import React from "react";
import TaskBar from "@/src/components/User/TaskBar/TaskBar";
import ManagerAccount from "@/src/components/User/UserAccountPage/ManagerAccount";
const page = () => {
    return (
        <div>
            <TaskBar></TaskBar>
            <ManagerAccount></ManagerAccount>
        </div>
    )
}
export default page;