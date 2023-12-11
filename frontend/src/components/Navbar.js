"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
  const pathname = usePathname()


  return (
<nav className=" bg-gradient-to-l from-purple-800 via-black to-white">
  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
  <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
      <img src={"/images/logo_Ic.png"} className="h-8" alt="God help Us" />
      <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">GPT
      </span>

  </a>
  <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
  <ConnectButton accountStatus="avatar" chainStatus="icon" />
      <button data-collapse-toggle="navbar-cta" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-cta" aria-expanded="false">
        <span className="sr-only">Open main menu</span>
        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
        </svg>
    </button>
  </div>
  <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
    <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg  md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0  dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
      <li>
        <a href="/marketplace" className={` ${pathname === '/marketplace' ? 'md:text-[#FFD700]' : ''} block py-2 px-3 md:p-0 text-white bg-blue-700 rounded md:bg-transparent  md:dark:text-blue-500 `} aria-current="page" > Marketplace</a>
      </li>
      <li>
        <a href="/dashboard" className={pathname === '/dashboard' ? 'md:text-[#FFD700]' : '' + "block py-2 px-3 md:p-0 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#FFD700] md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"}>Dashboard</a>
      </li>
      <li>
        <a href="/creator" className={pathname === '/creator' ? 'md:text-[#FFD700]' : '' + "block py-2 px-3 md:p-0 text-white rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#FFD700] md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700" }>Creator</a>
      </li>
    </ul>
  </div>
  </div>
</nav>


  );
};

export default Navbar;
