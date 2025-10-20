// PartSelect.jsx
import React from "react";

/* --- 작은 SVG 아이콘들 --- */
const IconBullet = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <circle cx="12" cy="12" r="5" />
  </svg>
);
const IconTimer = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M9 2h6M12 7v6" />
  </svg>
);

/* --- 레벨 뱃지 --- */
const LevelBadge = ({ level = "중급" }) => {
  const style =
    level === "초급"
      ? "bg-emerald-50 text-emerald-600"
      : level === "중급"
      ? "bg-amber-50 text-amber-600"
      : "bg-rose-50 text-rose-600"; // 고급
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${style}`}>
      {level}
    </span>
  );
};

/* --- 카드 컴포넌트 --- */
const PartCard = ({
  id,
  titleEn,
  titleKo,
  partLabel, // e.g. "Part 2"
  level, // "초급" | "중급" | "고급"
  counts, // { questions?: string, time?: string }
  cta = "연습하기",
  onClick = () => {},
  selected = false,
  primary = false,
}) => {
  return (
    <div
      className={[
        "relative rounded-2xl bg-white p-5 shadow-sm border transition",
        selected
          ? "border-blue-500 shadow-blue-100 ring-2 ring-blue-200"
          : "border-gray-200 hover:shadow-md",
      ].join(" ")}
    >
      {/* 상단 라벨들 */}
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
          {partLabel}
        </span>
        <LevelBadge level={level} />
      </div>

      {/* 타이틀 */}
      <h3 className="text-lg font-semibold text-gray-900">{titleEn}</h3>
      <p className="mt-1 text-sm text-gray-500">{titleKo}</p>

      {/* 정보 라인 */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        {counts?.questions && (
          <span className="inline-flex items-center gap-1">
            <IconBullet className="h-4 w-4 text-indigo-500" />
            {counts.questions}
          </span>
        )}
        {counts?.time && (
          <span className="inline-flex items-center gap-1">
            <IconTimer className="h-4 w-4 text-indigo-500" />
            {counts.time}
          </span>
        )}
      </div>

      {/* CTA 버튼 */}
      <div className="mt-5">
        <button
          onClick={() => onClick(id)}
          className={[
            "w-full rounded-xl px-4 py-2 text-sm font-semibold transition",
            primary || selected
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50",
          ].join(" ")}
        >
          {primary || selected ? "AI 시험 시작" : cta}
        </button>
      </div>
    </div>
  );
};

/* --- 그리드 --- */
const PartSelect = ({
  selectedId = "part2",
  onSelect = (id) => console.log("select:", id),
}) => {
  const parts = [
    {
      id: "part1",
      partLabel: "Part 1",
      level: "초급",
      titleEn: "Read a text aloud",
      titleKo: "주어진 텍스트를 소리 내어 읽기",
      counts: { questions: "2문항", time: "각 45초" },
    },
    {
      id: "part2",
      partLabel: "Part 2",
      level: "중급",
      titleEn: "Describe a picture",
      titleKo: "사진을 보고 묘사하기",
      counts: { questions: "1문항", time: "45초" },
      primary: true, // 파란 CTA
    },
    {
      id: "part3",
      partLabel: "Part 3",
      level: "중급",
      titleEn: "Respond to questions",
      titleKo: "질문에 대해 답변하기",
      counts: { questions: "3문항", time: "각 15/30초" },
    },
    {
      id: "part4",
      partLabel: "Part 4",
      level: "고급",
      titleEn: "Respond using information",
      titleKo: "정보를 활용해 답변하기",
      counts: { questions: "3문항", time: "각 15/30초" },
    },
    {
      id: "part5",
      partLabel: "Part 5",
      level: "고급",
      titleEn: "Express an opinion",
      titleKo: "의견 제시하기",
      counts: { questions: "1문항", time: "60초" },
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        TOEIC Speaking Part 선택
      </h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {parts.map((p) => (
          <PartCard
            key={p.id}
            {...p}
            selected={p.id === selectedId}
            onClick={onSelect}
          />
        ))}
      </div>
    </section>
  );
};

export default PartSelect;
