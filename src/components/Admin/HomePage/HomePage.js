import React from "react";
import MMovie from "../ManagerMovie/ManagerMovie";
import MSubtitle from "../ManagerSubtitle/ManagerSubtitle";
import TaskBar from "../TaskBar/TaskBar";
const HomePageAdmin = () => {
    return (
        <>
            <TaskBar></TaskBar>
            <MMovie></MMovie>
            <MSubtitle></MSubtitle>
        </>
    );
}
export default HomePageAdmin;