// Pages/MockPage/Part2Exam.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const pad = (n) => String(n).padStart(2, "0");
const buildS3Url = (bucket, region, key) =>
  `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;

export default function Part2Exam() {
  const nav = useNavigate();
  const { state } = useLocation();
  const problemId = state?.problemId;

  // ====== 문제/이미지 가져오기 ======
  const [problem, setProblem] = useState(null);
  const [loading,   setLoading] = useState(true);
  const [err,       setErr]     = useState(null);

  useEffect(() => {
    if (!problemId) {
      setErr("problemId가 없습니다.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        // 템플릿에서 사용했던 API
        const res = await fetch(`http://localhost:8080/api/v1/admin/problem/${problemId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProblem(data);
      } catch (e) {
        setErr(e.message || "문제를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [problemId]);

  const imageUrl = useMemo(() => {
    if (!problem) return null;
    if (problem.imagePresignedUrl) return problem.imagePresignedUrl;
    if (problem.imageS3Key) {
      const bucket = import.meta.env.VITE_S3_BUCKET || "your-bucket";
      const region = import.meta.env.VITE_S3_REGION || "ap-northeast-2";
      return buildS3Url(bucket, region, problem.imageS3Key);
    }
    return null;
  }, [problem]);

  // ====== 타이머 & 페이즈 ======
  // 요구사항: 3초 카운트다운 후 30초 녹음 자동 시작/자동 종료
  const COUNTDOWN = 3;      // 3초
  const ANSWER    = 30;     // 30초
  const [phase, setPhase] = useState("countdown"); // 'countdown' -> 'recording' -> 'done'
  const [count, setCount] = useState(COUNTDOWN);   // 카운트다운 표시
  const [remain, setRemain] = useState(ANSWER);    // 녹음 남은 시간

  // 3초 카운트다운
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count <= 0) {
      setPhase("recording");
      return;
    }
    const t = setTimeout(() => setCount((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, count]);

  // ====== 녹음/파형 (Web Audio API + MediaRecorder) ======
  // *** 필요 없으면 이 블록 전체 삭제 가능 ***
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(0);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // 저장 폐기 제어 플래그: 뒤로가기 등으로 이 값이 true면 onstop에서 저장하지 않음
  const discardRef = useRef(false);

  const drawWave = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, W, H);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#4f46e5";
      ctx.beginPath();

      const sliceWidth = W / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      rafRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        // 🔒 discardRef가 true면 저장하지 않고 폐기
        if (discardRef.current) {
          audioChunksRef.current = [];
          return;
        }
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      drawWave();

      mr.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert("마이크 권한을 허용해 주세요.");
      // 권한 실패 시 바로 done 처리
      setPhase("done");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);

    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    try { sourceRef.current?.disconnect(); } catch {}
    sourceRef.current = null;
    try { analyserRef.current?.disconnect(); } catch {}
    analyserRef.current = null;
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
  };

  // phase가 'recording'이 되면 즉시 녹음 시작 + 30초 타이머
  useEffect(() => {
    if (phase !== "recording") return;

    discardRef.current = false; // 녹음 정상 저장 모드
    startRecording();

    // 30초 타이머
    setRemain(ANSWER);
    const tick = setInterval(() => {
      setRemain((r) => {
        if (r <= 1) {
          clearInterval(tick);
          stopRecording();     // 자동 종료
          setPhase("done");    // 완료 상태로 전환
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // 언마운트 시 자원 정리 (뒤로가기 포함)
  useEffect(() => {
    return () => {
      // 뒤로가기 등으로 떠날 때는 저장 폐기
      discardRef.current = true;
      stopRecording();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 뒤로가기 버튼: 저장하지 않고 종료
  const handleBack = () => {
    discardRef.current = true; // 저장 폐기
    stopRecording();
    nav(-1);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* 헤더 */}
      <header className="flex items-center justify-between">
        <button onClick={handleBack} className="text-gray-400 hover:text-gray-600">✕</button>
        <div className="text-sm font-semibold">Question 3</div>
        <button className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">SKIP</button>
      </header>

      <hr className="my-3" />
      <h1 className="text-center text-lg font-semibold">Describe a Picture</h1>
      <div className="my-3 flex justify-center">
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">Q3</span>
      </div>

      {/* 이미지 (4:3 비율 + 살짝 축소) */}
      {!loading && !err && (
        <div className="relative w-full max-w-xl mx-auto rounded-xl overflow-hidden ring-1 ring-gray-200 bg-gray-50">
          <div className="aspect-[4/3] w-full">
            <img
              src={imageUrl || "https://via.placeholder.com/1024x768?text=No+Image"}
              alt="problem"
              className="h-full w-full object-cover scale-90 rounded-xl"
            />
          </div>
        </div>
      )}
      {loading && <div className="mt-4 text-center text-gray-500">이미지 불러오는 중…</div>}
      {err && <div className="mt-4 text-center text-rose-700">{err}</div>}

      {/* 하단 영역 */}
      <div className="mt-8 grid place-items-center">
        {phase === "countdown" && (
          <>
            <div className="rounded-full bg-gray-800 px-4 py-2 text-xs font-semibold text-white/90">
              START IN
            </div>
            <div className="mt-2 rounded-xl bg-gray-100 px-4 py-3 font-mono text-2xl">
              00:00:{pad(count)}
            </div>
          </>
        )}

        {phase === "recording" && (
          <>
            <div className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
              ANSWER TIME (Recording)
            </div>

            {/* ====== 녹음/파형 UI (필요 없으면 이 섹션 삭제) ====== */}
            <div className="mt-4 w-full max-w-xl rounded-xl border bg-white p-4 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">
                {isRecording ? "녹음 중…" : "대기 중"}
              </div>
              <div className="rounded-md ring-1 ring-gray-200 bg-gray-50 p-2">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={120}
                  className="w-full"
                  aria-label="waveform"
                />
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="rounded-xl bg-gray-100 px-3 py-2 font-mono">
                  남은 시간: 00:00:{pad(remain)}
                </div>
                {/* 수동 중지 버튼(선택) */}
                {isRecording && (
                  <button
                    onClick={() => { stopRecording(); setPhase("done"); }}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                  >
                    녹음 종료
                  </button>
                )}
              </div>
            </div>
            {/* ====== /녹음/파형 UI ====== */}
          </>
        )}

        {phase === "done" && (
          <>
            <div className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">
              FINISHED
            </div>
            <div className="mt-3 text-sm text-gray-500">
              녹음이 종료되었습니다. (재생/저장 가능)
            </div>

            {/* ====== 저장/재생 UI (필요 없으면 삭제) ====== */}
            {audioUrl ? (
              <div className="mt-3 flex items-center gap-3">
                <audio controls src={audioUrl} className="h-9" />
                <a
                  href={audioUrl}
                  download={`part2_${problemId}.webm`}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 hover:bg-gray-200"
                >
                  로컬 저장
                </a>
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-400">
                저장된 오디오가 없습니다.
              </div>
            )}
            {/* ====== /저장/재생 UI ====== */}
          </>
        )}
      </div>
    </div>
  );
}
