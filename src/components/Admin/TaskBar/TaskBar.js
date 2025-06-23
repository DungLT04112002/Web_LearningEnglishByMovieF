import React from "react";
import Link from 'next/link'
const TaskBar = () => {

    return (
        <div className=" items-center flex bg-black bg-opacity-50  px-6 py-3" >
            <Link href="/Navigate/manager/movie">
                <div className="flex items-center  " >

                    <img src="/assets/NLogo.png" alt="Logo" className="h-[6vh] mr-[40]" />
                    <span className="text-white text-xl font-bold">M Learning</span>

                </div >
            </Link>
            {/* Thanh tìm kiếm */}
            < div className=" flex  w-1/3 mx-[5vw]" >
                <input
                    type="text"
                    placeholder="Search Movies..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-transparent text-white "
                />
            </div >

            {/* Nút Home */}
            <div className="text-white flex">

                <div className="mx-[1vw]">
                    <Link href="/Navigate/manager/user">
                        <p className="font-bold ">Manage user</p>
                    </Link>
                </div>
                <div className="mx-[1vw]">
                    <Link href="/Navigate/manager/movie">
                        <p className="font-bold  ">Manage Movies </p>
                    </Link>
                </div>
                <div className="mx-[1vw]">
                    <Link href="/Navigate/manager/subtitle">
                        <p className="font-bold ">Manage Subtitles</p>
                    </Link>
                </div>
                <div className="mx-[1vw]">
                    <Link href="/Navigate/manager/manager_quizz">
                        <p className="font-bold ">Gen Quizs</p>
                    </Link>
                </div>
                <div className="mx-[1vw]">
                    <Link href="/Navigate/user/useraccount">
                        <p className="font-bold text-white">Person</p>
                    </Link>
                </div>
            </div>
        </div >
    )
}
export default TaskBar