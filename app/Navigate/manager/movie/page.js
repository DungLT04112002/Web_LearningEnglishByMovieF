import React from "react";
import TaskBar from "@/src/components/Admin/TaskBar/TaskBar";
import MMovie from "@/src/components/Admin/ManagerMovie/ManagerMovie";
const page = () => {
    return (
        <div>
            <TaskBar></TaskBar>
            <MMovie></MMovie>
        </div>


    )
}
export default page;