"use client"
import Link from 'next/link'
import './globals.css'
import Taskbar from '../src/components/Cus/TaskBar'; // Đường dẫn tùy vị trí file layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex space-x-4">
            <Link href="/" className="hover:text-gray-300">Home</Link>
            <Link href="/practicereading" className="hover:text-gray-300">Practice Reading</Link>
            <Link href="/admin/managerSubtitle" className="hover:text-gray-300">Manage Subtitles</Link>
          </div>
        </nav> */}
        <main className="w-full ">
          {children}
        </main>
      </body>
    </html>
  )
}
