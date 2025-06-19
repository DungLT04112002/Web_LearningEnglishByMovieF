import React from "react";
import TaskBar from "@/src/components/Admin/TaskBar/TaskBar";
import ManagerQuizz from "@/src/components/Admin/ManagerQuizz/ManagerGenQuizz";
const page = () => {
    return (
        <>
            <TaskBar></TaskBar>
            <ManagerQuizz></ManagerQuizz>
        </>)
}
export default page;