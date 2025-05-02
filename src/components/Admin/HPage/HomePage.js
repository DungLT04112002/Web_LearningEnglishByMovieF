import React from "react";
import MMovie from "../MMovie";
import MSubtitle from "../MSubtitle";
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