import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const Layout = () => {
    return (
        <div className="flex h-[100dvh] w-full bg-[#000000] p-2 md:p-6 gap-2 md:gap-6 relative overflow-hidden">
            {/* Strict B/W/B Structural Decoration */}
            <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-900/5 blur-[80px] md:blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-800/5 blur-[80px] md:blur-[120px] rounded-full" />

            <div className="hidden lg:flex">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden relative">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar pr-1 pb-20 lg:pb-0">
                    <Outlet />
                    <MobileNav />
                </main>
            </div>
        </div>
    );
};

export default Layout;
