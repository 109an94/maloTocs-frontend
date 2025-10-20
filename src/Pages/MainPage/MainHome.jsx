// MainHome.jsx
import { useMemo } from "react";

const PencilIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14.06 6.19 16.9 3.34a1.75 1.75 0 0 1 2.48 0l1.28 1.28a1.75 1.75 0 0 1 0 2.48l-2.84 2.84" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// 원형 진행률 (SVG)
const ProgressRing = ({ value = 150, max = 200, size = 140, stroke = 12 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  const dash = useMemo(
    () => ({
      dasharray: circumference.toFixed(2),
      dashoffset: (circumference * (1 - percent / 100)).toFixed(2),
    }),
    [circumference, percent]
  );

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB" // gray-200
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={dash.dasharray}
          strokeDashoffset={dash.dashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />   {/* indigo-500 */}
            <stop offset="100%" stopColor="#7C3AED" /> {/* violet-600 */}
          </linearGradient>
        </defs>
      </svg>

      {/* 가운데 텍스트 */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-600">{value}</div>
          <div className="text-sm text-gray-400">/ {max}</div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, valueClass = "text-gray-700" }) => (
  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
    <span className="text-sm text-gray-500">{label}</span>
    <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
  </div>
);

const MainHome = ({
  currentScore = 150,
  targetScore = 200,
  daysLeft = 24,
  onStart = () => alert("AI 시험 시작!"),
  onEditGoal = () => alert("목표 수정"),
}) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white shadow">
        <h1 className="text-2xl font-bold md:text-3xl">TOEIC Speaking 완벽 대비!</h1>
        <p className="mt-2 text-white/90">
          AI 기반 맞춤형 가상 시험으로 실전 감각을 키우세요
        </p>
        <button
          onClick={onStart}
          className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow hover:bg-gray-50"
        >
          AI 시험 체험하기
        </button>
      </section>

      {/* Goal Card */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">나의 목표 점수</h2>
          <button
            onClick={onEditGoal}
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4" />
            수정
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[160px,1fr]">
          {/* Left: Donut */}
          <div className="flex items-center justify-center">
            <ProgressRing value={currentScore} max={targetScore} />
          </div>

          {/* Right: Rows */}
          <div className="grid gap-3">
            <StatRow label="현재 점수" value={`${currentScore}점`} />
            <StatRow label="목표 점수" value={`${targetScore}점`} />
            <StatRow label="남은 일수" value={`${daysLeft}일`} valueClass="text-emerald-600" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainHome;
