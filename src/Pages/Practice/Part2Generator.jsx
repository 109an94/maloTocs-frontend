import { useState } from "react";

/** 유틸: JSON 안전 파싱 */
const pretty = (data) =>
  typeof data === "string" ? data : JSON.stringify(data, null, 2);

/** snake_case -> camelCase (template 정규화) */
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

const getImageUrlFor = async (id, imageS3Key) => {
  try {
    // presigned 우선
    const r = await fetch(`http://localhost:8080/api/v1/admin/problem/step2/${id}/image-url`);
    if (r.ok) {
      const { url } = await r.json();
      if (url) return url;
    }
  } catch (_) {}

  // 공개 버킷이면 key로 조합 (없으면 null)
  if (imageS3Key) {
    const bucket = import.meta.env.VITE_S3_BUCKET || "your-bucket";
    const region = import.meta.env.VITE_S3_REGION || "ap-northeast-2";
    return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(imageS3Key)}`;
  }
  return null;
};


export default function PracticeGenerator() {
  const [loading, setLoading] = useState(null); // 'step1' | 'step2' | 'step3' | 'latest' | null
  const [error, setError] = useState(null);

  const [currentId, setCurrentId] = useState(null); // ✅ 최신 Problem ID
  const [keywords, setKeywords] = useState(null);
  const [imageUrl, setImageUrl] = useState("");     // S3 presigned URL or public URL
  const [template, setTemplate] = useState(null);

  /** 공통 호출자 */
  const call = async (step, url, options = {}) => {
    try {
      setLoading(step);
      setError(null);
      const res = await fetch(url, {
        method: options.method || "POST",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        body: options.body ?? undefined,
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${res.status} ${res.statusText} - ${msg}`);
      }
      const data = await res.json().catch(() => ({}));
      return data;
    } catch (e) {
      setError(e.message || String(e));
      return null;
    } finally {
      setLoading(null);
    }
  };

  /** 최신 Problem 1개 가져오기 (선택 기능) */
  const fetchLatest = async () => {
    setKeywords(null);
    setImageUrl("");
    setTemplate(null);
    try {
      setLoading("latest");
      setError(null);
      const res = await fetch("http://localhost:8080/api/v1/admin/problem?limit=1", {
        method: "GET",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      const latest = Array.isArray(list) ? list[0] : null;
      if (!latest) throw new Error("No problems yet");
      setCurrentId(latest.id);
      setKeywords(latest.keywords ?? null);
      // 이미지 URL은 presign 엔드포인트를 통해 on demand로 발급
      // ✅ 이미지도 함께 가져오기
    const url = await getImageUrlFor(latest.id, latest.imageS3Key);
    setImageUrl(url || "");
      setTemplate(normalizeTemplate(latest.template));
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(null);
    }
  };

  /** Step1: 키워드 생성 → Problem(신규) 반환 */
  const onGenerateKeywords = async () => {
    const data = await call(
      "step1",
      "http://localhost:8080/api/v1/admin/problem/step1/generate-keywords"
    );
    if (!data) return;
    setCurrentId(data.id ?? null);                  // ✅ 최신 id 갱신
    setKeywords(data.keywords ?? null);
    setImageUrl("");                                // 이후 스텝에서 채움
    setTemplate(normalizeTemplate(data.template));  // 보통은 null이지만 방어적
  };

  /** Step2: 최신 Problem에 이미지 생성/저장 → Problem 반환 */
  const onGenerateImage = async () => {
    const data = await call(
      "step2",
      "http://localhost:8080/api/v1/admin/problem/step2/latest/image"
    );
    if (!data) return;

    const id = data.id ?? currentId;
    setCurrentId(id); // ✅ 최신 id 유지

    // presigned URL 발급 (권장 루트)
    if (id) {
      try {
        const urlRes = await fetch(`http://localhost:8080/api/v1/admin/problem/step2/${id}/image-url`);
        if (urlRes.ok) {
          const { url } = await urlRes.json();
          setImageUrl(url || "");
        } else {
          // 실패 시, 공개 버킷이면 S3 정적 URL 조합 (원한다면 .env로 버킷/리전 세팅)
          const key =
            data.imageS3Key ||
            data.image_url ||
            data.imageUrl ||
            data.s3Key ||
            "";
          if (key) {
            const bucket = import.meta.env.VITE_S3_BUCKET || "your-bucket";
            const region = import.meta.env.VITE_S3_REGION || "ap-northeast-2";
            setImageUrl(`https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`);
          } else {
            setImageUrl("");
          }
        }
      } catch {
        setImageUrl("");
      }
    }
  };

  /** Step3: 최신 Problem에 템플릿 생성 → API가 id(String) 반환 */
  const onGenerateTemplate = async () => {
    const idStr = await call(
      "step3",
      "http://localhost:8080/api/v1/admin/problem/step3/latest/template"
    );
    if (!idStr) return;

    // 컨트롤러가 String을 반환하니 그대로 반영
    const id = typeof idStr === "string" ? idStr : idStr.id || currentId;
    setCurrentId(id); // ✅ 최신 id 유지

    // 최신 Problem 상세 조회해서 템플릿 꺼내기
    if (id) {
      try {
        const res = await fetch(`http://localhost:8080/api/v1/admin/problem/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const p = await res.json();
        setTemplate(normalizeTemplate(p.template));
        // 이미지가 이미 있다면 presigned url도 새로고침할 수 있음(옵션)
        // 여기서는 유지
      } catch (e) {
        setError(e.message || String(e));
      }
    }
  };

  const copyId = async () => {
    if (!currentId) return;
    try {
      await navigator.clipboard.writeText(currentId);
      alert("Problem ID가 복사되었습니다!");
    } catch {
      // noop
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Part 2 연습 문제 생성</h1>
        <button
          onClick={fetchLatest}
          className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-200 disabled:opacity-60"
          disabled={loading !== null}
        >
          {loading === "latest" ? "불러오는 중…" : "최신 Problem 불러오기"}
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        아래 버튼을 순서대로 눌러 키워드 → 이미지 → 템플릿을 생성하세요.
      </p>

      {/* 최신 ID 표시 */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-700 ring-1 ring-gray-300">
          Latest Problem ID:
        </span>
        <code className="rounded-md bg-gray-50 px-2 py-1 text-gray-800 ring-1 ring-gray-200">
          {currentId ?? "—"}
        </code>
        <button
          onClick={copyId}
          disabled={!currentId}
          className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          복사
        </button>
      </div>

      {/* 버튼 영역 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button
          onClick={onGenerateKeywords}
          className="rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
          disabled={loading !== null}
        >
          {loading === "step1" ? "키워드 생성 중…" : "1) 키워드 생성"}
        </button>

        <button
          onClick={onGenerateImage}
          className="rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          disabled={loading !== null}
        >
          {loading === "step2" ? "이미지 생성 중…" : "2) 이미지 생성"}
        </button>

        <button
          onClick={onGenerateTemplate}
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loading !== null}
        >
          {loading === "step3" ? "템플릿 생성 중…" : "3) 템플릿 생성"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
          에러: {error}
        </div>
      )}

      {/* 결과 섹션 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* 키워드 */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">생성된 키워드</h2>
          {keywords ? (
            <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-gray-50 p-3 text-xs">
              {pretty(keywords)}
            </pre>
          ) : (
            <p className="mt-2 text-sm text-gray-500">아직 없음</p>
          )}
        </section>

        {/* 이미지 */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">생성된 이미지</h2>
          {imageUrl ? (
            <>
              <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-gray-100">
                {/* 4:3 비율, 살짝 축소해 미리보기 */}
                <div className="aspect-[4/3] w-full bg-gray-50">
                  <img
                    src={imageUrl}
                    alt="generated"
                    className="h-full w-full object-cover scale-90 rounded-xl"
                  />
                </div>
              </div>
              <p className="mt-2 truncate text-xs text-gray-500">{imageUrl}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-500">아직 없음</p>
          )}
        </section>

        {/* 템플릿 */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-800">생성된 템플릿</h2>
          {template ? (
            <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-gray-50 p-3 text-xs">
              {pretty(template)}
            </pre>
          ) : (
            <p className="mt-2 text-sm text-gray-500">아직 없음</p>
          )}
        </section>
      </div>
    </div>
  );
}
