// Pages/MockPage/Part2Template.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const buildS3Url = (bucket, region, key) =>
  `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;

export default function Part2Template() {
  const nav = useNavigate();
  const { state } = useLocation();
  const [params] = useSearchParams();

  // ✅ MockPart2에서 넘긴 problemId 사용, 없으면 쿼리스트링도 허용
  const problemId = state?.problemId || params.get("problemId");

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!problemId) {
      setErr("problemId가 없습니다.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8080/api/v1/admin/problem/${problemId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        data.template = normalizeTemplate(data.template);
        setProblem(data);
      } catch (e) {
        setErr(e.message || "문제를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [problemId]);
const normalizeTemplate = (tpl) => {
  if (!tpl) return null;
  return {
    place: tpl.place ?? null,
    mainSubject: tpl.main_subject ?? tpl.mainSubject ?? null,
    leftDetail: tpl.left_detail ?? tpl.leftDetail ?? null,
    rightDetail: tpl.right_detail ?? tpl.rightDetail ?? null,
    backgroundDetail: tpl.background_detail ?? tpl.backgroundDetail ?? null,
    overallImpression: tpl.overall_impression ?? tpl.overallImpression ?? null,
  };
};
  // 템플릿/이미지/태그 뽑기
  const t = problem?.template || {};
  const tag =
    state?.tag ||
    t?.mainSubject ||
    problem?.keywords?.roles?.[0] ||
    "Unknown Topic";

  // 이미지 URL (presigned가 있으면 우선 사용, 아니면 공개버킷 URL 구성)
  const imageUrl = useMemo(() => {
    if (!problem) return state?.image || "https://via.placeholder.com/600x400";
    if (problem.imagePresignedUrl) return problem.imagePresignedUrl;
    if (problem.imageS3Key) {
      const bucket = import.meta.env.VITE_S3_BUCKET || "your-bucket";
      const region = import.meta.env.VITE_S3_REGION || "ap-northeast-2";
      return buildS3Url(bucket, region, problem.imageS3Key);
    }
    return state?.image || "https://via.placeholder.com/600x400";
  }, [problem, state?.image]);

  // 문장 생성 (네가 원하는 템플릿에 딱 맞춰 매핑)
  const sentences = useMemo(() => {
    return [
      `This picture was taken ${t.place ?? "..."}.`,
      `What I notice first is ${t.mainSubject ?? "..."}.`,
      `On the left, ${t.leftDetail ?? "..."}.`,
      `On the right, ${t.rightDetail ?? "..."}.`,
      `In the background, ${t.backgroundDetail ?? "..."}.`,
      `Overall, it seems like ${t.overallImpression ?? "..."}.`,
    ];
  }, [t]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-gray-800 px-4 py-3 text-white">
        <button onClick={() => nav(-1)} className="text-gray-300 hover:text-white">
          ←
        </button>
        <h1 className="text-sm font-semibold">[IH] Part 2 템플릿 모아보기</h1>
        <div className="w-6" />
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          {/* SET / TAG */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-600">SET 1</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                Q3
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {tag}
              </span>
            </div>
          </div>

          {/* 상태 표시 */}
          {loading && (
            <div className="mb-6 rounded-xl bg-gray-50 p-6 text-center text-gray-500">
              불러오는 중…
            </div>
          )}
          {err && (
            <div className="mb-6 rounded-xl bg-rose-50 p-6 text-center text-rose-700">
              {err}
            </div>
          )}

          {/* Image */}
          {!loading && !err && (
            <div className="relative w-full max-w-xl mx-auto rounded-xl overflow-hidden ring-1 ring-gray-200 bg-gray-50">
            <div className="aspect-[4/3] w-full">
                <img
                src={imageUrl}
                alt="problem"
                className="h-full w-full object-cover scale-90 rounded-xl"
                />
            </div>
            </div>
          )}

          {/* Template Text */}
          {!loading && !err && (
            <div className="mt-5 space-y-2 text-sm leading-6 text-gray-800">
              {sentences.map((s, i) => (
                <p key={i}>{s}</p>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
