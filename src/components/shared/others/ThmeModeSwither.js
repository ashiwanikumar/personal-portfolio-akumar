"use client";

import themeController from "@/libs/themeController";
import { useEffect } from "react";

const ThmeModeSwither = () => {
  useEffect(() => {
    themeController();
  }, []);
  return (
    <div className="fixed top-[200px] lg:top-[300px] transition-all duration-300 right-[-50px] hover:right-0 z-4xl">
      <button className="theme-controller w-90px h-10 bg-200 bg-gradient-secondary hover:bg-[-100%] rounded-l-full text-whiteColor px-10px flex items-center transition-all duration-300 font-sora">
        {/* dark  */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-10px w-5 block dark:hidden"
          viewBox="0 0 512 512"
        >
          <path
            d="M160 136c0-30.62 4.51-61.61 16-88C99.57 81.27 48 159.32 48 248c0 119.29 96.71 216 216 216 88.68 0 166.73-51.57 200-128-26.39 11.49-57.38 16-88 16-119.29 0-216-96.71-216-216z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="32"
          ></path>
        </svg>
        <span className="text-base block dark:hidden">Dark</span>
        {/* hacker theme */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="hidden mr-10px w-5 dark:block"
          viewBox="0 0 640 512"
        >
          <path
            fill="currentColor"
            d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"
          />
        </svg>
        <span className="text-base hidden dark:block">Hacker</span>
      </button>
    </div>
  );
};

export default ThmeModeSwither;
