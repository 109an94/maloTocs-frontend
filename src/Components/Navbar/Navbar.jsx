import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
// import { IconHome, IconMic, IconBook } from "@/assets/icons";


const IconHome = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 3.2 3 11.5a1 1 0 0 0 1.3 1.5L6 12.6V20a2 2 0 0 0 2 2h3v-6h2v6h3a2 2 0 0 0 2-2v-7.4l1.7 1.4a1 1 0 0 0 1.3-1.5L12 3.2z" />
  </svg>
);
const IconBook = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M5 4a3 3 0 0 0-3 3v11a1 1 0 0 0 1.5.9L7 18.4l3.5 1.5A1 1 0 0 0 12 19V7a3 3 0 0 0-3-3H5zm9-0h3a3 3 0 0 1 3 3v11a1 1 0 0 1-1.5.86L17 18.4l-3 1.2A1 1 0 0 1 12 19V7a3 3 0 0 1 3-3z" />
  </svg>
);
const IconMic = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M5 11a1 1 0 1 0-2 0 9 9 0 0 0 8 8.95V22a1 1 0 1 0 2 0v-2.05A9 9 0 0 0 21 11a1 1 0 1 0-2 0 7 7 0 0 1-14 0z" />
  </svg>
);
const IconUser = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5z" />
  </svg>
);

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("ko"); // 'ko' | 'en'
  const toggleMenu = () => setIsOpen(!isOpen);

  const menu = [
    { key: "home", label: { ko: "홈", en: "Home" }, Icon: IconHome, href: "/" },
  { key: "practice", label: { ko: "연습문제", en: "Practice" }, Icon: IconBook, href: "/practice" },
  { key: "mockpart2", label: { ko: "모의고사", en: "Mock Test" }, Icon: IconMic, href: "/mock/part2" },
    { key: "analytics", label: { ko: "마이페이지", en: "My Page" }, Icon: IconUser, href: "#" },
  ];

  // 활성 메뉴 키가 있다면 여기서 제어 (예: 라우터 연동)
  const activeKey = "home";

  return (
    <nav className="w-full bg-white border-b">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Brand */}
          <a href="#" className="text-xl font-extrabold tracking-wide text-blue-600">
            MALOTOCS
          </a>

          {/* Right: Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            {menu.map(({ key, label, Icon, href }) => {
              const isActive = key === activeKey;
              return (
                <a
                  key={key}
                  href={href}
                  className={`group flex flex-col items-center text-xs ${
                    isActive ? "text-gray-900" : "text-gray-500"
                  } hover:text-gray-900`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`} />
                  <span className="mt-1">{label[language]}</span>
                </a>
              );
            })}

            {/* Language toggle
            <button
              onClick={() => setLanguage((prev) => (prev === "ko" ? "en" : "ko"))}
              className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50"
              aria-label="Toggle language"
            >
              {language.toUpperCase()}
            </button> */}
          </div>

          {/* Mobile actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setLanguage((prev) => (prev === "ko" ? "en" : "ko"))}
              className="text-xs px-2 py-1 rounded-md border hover:bg-gray-50"
              aria-label="Toggle language"
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {/* hamburger */}
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="md:hidden border-t">
            <div className="grid grid-cols-4 gap-2 px-2 py-2">
              {menu.map(({ key, label, Icon, href }) => {
                const isActive = key === activeKey;
                return (
                  <a
                    key={key}
                    href={href}
                    className={`flex flex-col items-center py-2 rounded-lg ${
                      isActive ? "text-gray-900" : "text-gray-600"
                    } hover:bg-gray-50`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="mt-1 text-xs">{label[language]}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;