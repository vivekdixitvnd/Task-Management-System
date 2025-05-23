"use client"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import Footer from "./Footer" 

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

return (
  <div className="flex flex-col min-h-screen">
    <Navbar toggleSidebar={toggleSidebar} />
    <div className="flex flex-1">
      <Sidebar isOpen={sidebarOpen} />
      <main className={`main-content flex-1 ${sidebarOpen && !isMobile ? "ml-250" : "ml-0"}`}>
        <div className="container py-4">
          <Outlet />
        </div>
      </main>
    </div>
    <Footer />
  </div>
)
}
export default Layout


//   "use client"

// import { useState, useEffect } from "react"
// import { Outlet } from "react-router-dom"
// import Navbar from "./Navbar"
// import Sidebar from "./Sidebar"
// import Footer from "./Footer" 

// const Layout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true)
//   const [isMobile, setIsMobile] = useState(false)

//   // Check if mobile on mount and window resize
//   useEffect(() => {
//     const checkIfMobile = () => {
//       setIsMobile(window.innerWidth < 768)
//     }

//     // Initial check
//     checkIfMobile()

//     // Add event listener
//     window.addEventListener("resize", checkIfMobile)

//     // Cleanup
//     return () => {
//       window.removeEventListener("resize", checkIfMobile)
//     }
//   }, [])

//   // Close sidebar by default on mobile
//   useEffect(() => {
//     if (isMobile) {
//       setSidebarOpen(false)
//     } else {
//       setSidebarOpen(true)
//     }
//   }, [isMobile])

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen)
//   }

//   return (
//     <div>
//       <Navbar toggleSidebar={toggleSidebar} />
//       <div className="flex">
//         <Sidebar isOpen={sidebarOpen} />
//         <main className={main-content ${sidebarOpen && !isMobile ? "ml-250" : "ml-0"}}>
//           <div className="container">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     <Footer />
//     </div>
//   )
// }

// export default Layout
