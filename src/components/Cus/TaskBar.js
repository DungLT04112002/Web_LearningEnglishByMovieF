import React from "react";
import Link from 'next/link'
import QuizzDemo from "../QuizzDemo";
const TaskBar = () => {

    return (
        <div className=" items-center flex bg-black bg-opacity-50  px-6 py-3" >
            <Link href="/Navigate/user/homepage">  < div className="flex items-center  " >

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
            <div className="mx-[1vw]">
                <Link href="/Navigate/user/watchmoive">
                    <p className="font-bold text-white">Xem phim song ngữ</p>
                </Link>
            </div>
            <div className="mx-[1vw]">
                <Link href="">
                    <p className="font-bold text-white">Luyện tập</p>
                </Link>
            </div>
            <div className="mx-[1vw]">
                <Link href="">
                    <p className="font-bold text-white">Yêu thích</p>
                </Link>
            </div>
        </div >
    )
}
export default TaskBar