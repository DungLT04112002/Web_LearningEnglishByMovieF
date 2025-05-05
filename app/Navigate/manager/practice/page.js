import React from "react";
import QuizzDemo from "@/src/components/QuizzDemo";
import TaskBar from "@/src/components/Admin/TaskBar/TaskBar";
import ManagerQuizz from "@/src/components/Admin/ManagerQuizz/ManagerQuizz";
import MovieQuiz from "@/src/components/Admin/ManagerQuizz/MQuiz";
const page = () => {
    return (
        <>
            <TaskBar></TaskBar>
            {/* <MovieQuiz></MovieQuiz> */}
            <ManagerQuizz></ManagerQuizz>
        </>)
}
export default page;