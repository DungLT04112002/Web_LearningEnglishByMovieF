import React from "react";
import ManagerUser from "@/src/components/Admin/ManagerUser/ManagerUser";
import TaskBar from "@/src/components/Admin/TaskBar/TaskBar";
const page = () => {
    return (
        <div>
            <TaskBar></TaskBar>
            <ManagerUser></ManagerUser>
        </div>
    )
}
export default page;