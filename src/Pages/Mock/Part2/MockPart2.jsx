// MockPart2.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/* --- icons --- */
const IconPen = (p) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M14.06 6.19 16.9 3.34a1.75 1.75 0 0 1 2.48 0l1.28 1.28a1.75 1.75 0 0 1 0 2.48l-2.84 2.84" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const IconBullet = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <circle cx="12" cy="12" r="4" />
  </svg>
);
const IconReplay = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-4.9 6.1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const tabs = [
  { key: "p1", label: "지문읽기" },
  { key: "p2", label: "사진묘사" },
  { key: "p3", label: "질문에 답하기" },
  { key: "p4", label: "표 보고 답하기" },
];

const toDisplayLines = (p) => {
  const lines = [];
  if (p?.template) {
    const t = p.template;
    if (t.main_subject && t.place) lines.push(`${t.main_subject} ${t.place}`);
  } else if (p?.keywords) {
    const k = p.keywords;
    if (k.actions?.length) lines.push(`Action: ${k.actions.join(", ")}`);
  }
  return lines.length ? lines.slice(0, 3) : ["(설명 없음)"];
};

export default function MockPart2() {
  const [activeTab, setActiveTab] = useState("p2");
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  // ✅ MongoDB에서 문제 리스트 불러오기
  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/v1/admin/problem?limit=10");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      setProblems(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e.message || "문제 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  if (loading)
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-gray-500">
        불러오는 중…
      </div>
    );

  if (err)
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-rose-700">
        {err}
      </div>
    );

  if (!problems.length)
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-yellow-700">
        생성된 문제 세트가 없습니다.
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* 상단 안내 */}
      <header className="rounded-2xl bg-gray-50 px-5 py-6 text-center">
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-indigo-700">
          <IconPen className="h-5 w-5" />
        </div>
        <p className="text-sm text-gray-500">실제 시험문제 유형을 미리 풀어보세요</p>
        <h1 className="mt-1 text-lg font-bold">
          <span className="text-indigo-700">실전문제</span>로 점검하고<br/>나의 보완점을 확인하세요!
        </h1>
      </header>

      {/* 탭바 */}
      <nav className="mt-5 flex overflow-x-auto border-b">
        <ul className="flex min-w-full gap-6">
          {tabs.map((t) => (
            <li key={t.key}>
              <button
                onClick={() => setActiveTab(t.key)}
                className={[
                  "pb-3 text-sm font-medium text-gray-500",
                  activeTab === t.key
                    ? "text-indigo-700 border-b-2 border-indigo-700"
                    : "hover:text-gray-700",
                ].join(" ")}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ✅ 모든 Problem을 카드로 렌더링 */}
      <div className="mt-6 space-y-6">
        {problems.map((p, idx) => {
          const lines = toDisplayLines(p);
          return (
            <section
              key={p.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-400">
                    PART 2 <span className="text-[11px]">(Q3-4)</span>
                  </div>
                  <div className="mt-1 text-center text-sm font-semibold tracking-wide text-gray-500">
                    SET {idx + 1}
                  </div>
                </div>
                <span className="rounded-full bg-indigo-700 px-2.5 py-1 text-[10px] font-bold text-white">
                  ALL
                </span>
              </div>

              <ul className="space-y-2">
                {lines.map((txt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <IconBullet className="mt-1 h-4 w-4 text-indigo-700" />
                    <span className="text-[15px] text-gray-800">{txt}</span>
                  </li>
                ))}
              </ul>

              {/* 하단 버튼 */}
              <div className="mt-4 grid grid-cols-2 items-center gap-3 rounded-xl bg-gray-50 p-2">
                <button
                  onClick={() =>
                    nav("/mock/part2/template", { state: { problemId: p.id } })
                  }
                  className="flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-100"
                >
                  템플릿 확인
                </button>
                <button
                  onClick={() =>
                    nav("/mock/part2/exam", { state: { problemId: p.id } })
                  }
                  className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  AI 시험 시작
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {/* ✅ 다시풀기 버튼: 새로고침 or 리스트 재조회 */}
      <div className="mt-8 text-center">
        <button
          onClick={fetchProblems}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-200"
        >
          <IconReplay className="h-5 w-5" />
          다시풀기
        </button>
      </div>
    </div>
  );
}
