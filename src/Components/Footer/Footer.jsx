import { NavLink } from "react-router-dom";

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

const tabs = [
  { to: "/", label: "홈", Icon: IconHome },
  { to: "/practice", label: "연습문제", Icon: IconBook },
  { to: "/Mock/Part2", label: "모의고사", Icon: IconMic },
  { to: "/mypage", label: "마이페이지", Icon: IconUser },
];

const Footer = () => {
  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-50
        border-t bg-white/90 backdrop-blur
      "
      role="tablist"
      aria-label="Bottom navigation"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0px)" }} // iOS 안전영역
    >
      <div className="mx-auto max-w-3xl">
        <ul className="grid grid-cols-4">
          {tabs.map(({ to, label, Icon }) => (
            <li key={to} className="flex">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  [
                    "m-2 flex w-full flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs transition",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-6 w-6 ${isActive ? "" : "opacity-80"}`} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Footer;
