# maloTocs: TOEIC Speaking Part 2 Trainer (MVP)

토익 스피킹 Part 2 연습을 로컬에서 빠르게 진행할 수 있는 MVP입니다. OpenAI 기반으로 문제(이미지/문장 템플릿)를 자동 생성하고, 사용자의 답변을 분석·피드백하는 기능을 목표로 합니다. 로그인 없이 단일 사용자(local)로 동작합니다.

## 주요 기능

A. Part 2 연습 문제 생성(완료)
- 키워드 생성
  - Spring AI(OpenAI) 사용.
  - 예시 스키마: `keywords { _id, date, tags: string[] }`
- 이미지 생성 및 저장
  - OpenAI DALL·E → AWS S3 업로드.
  - 스키마: `images { _id, date, s3Url, keywordId }`
- 템플릿 문장 완성
  - 미리 정의한 템플릿의 { } 부분을 AI가 채움.
  - 스키마: `templates { _id, date, lines: string[], imageId }`
- 하나의 “문제”는 위 세 리소스를 조합해 제공.

B. Part 2 테스트(미구현 — 계획)
- 프론트에서 녹음(Web Audio/MediaRecorder) → 백엔드 전송.
- 음성 번역(STT/번역) 및 피드백 생성.
  - 스키마(예정):
    - `transcripts { _id, user: "local", date, text, problemId }`
    - `feedbacks { _id, user: "local", date, problemId, score, tips: string[] }`

C. 로그인(미구현 — 계획)
- MVP 단계에서는 비활성. 이후 간단한 사용자 식별/히스토리 저장 예정.

## 기술 스택

- Backend
  - Java 21, Spring Boot 3.x
  - Spring AI(OpenAI), OpenAI Images(DALL·E)
  - MongoDB(Spring Data MongoDB)
  - AWS S3(이미지 저장)
- Frontend
  - React 19, Vite
  - React Router, React Icons
  - Tailwind CSS v3(PostCSS 플러그인)
  - MediaRecorder API(브라우저 녹음)
- Dev/Infra
  - Node.js 20+, npm
  - 환경변수: `OPENAI_API_KEY`, `MONGODB_URI`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `VITE_API_BASE_URL`

## 시스템 개요(데이터 흐름)

1) 사용자 요청 → 백엔드가 키워드 생성 → 이미지 생성·S3 저장 → 템플릿 완성 → MongoDB에 각 문서 저장 → 문제 ID 반환  
2) 프론트는 문제 조회로 이미지/템플릿 표시  
3) (예정) 사용자가 녹음 업로드 → 백엔드가 STT/번역 및 피드백 생성 → MongoDB 저장 → 프론트 표시

## API 개요

- 문제 생성
  - POST `/api/part2/problems/generate`
  - Res 예시
    ```json
    {
      "problemId": "665f...",
      "image": { "url": "https://s3....jpg" },
      "template": { "lines": ["This picture was taken {at a park}.", "What I notice first {is...}"] }
    }
    ```
- 문제 조회
  - GET `/api/part2/problems/{id}`
  - GET `/api/part2/problems?date=YYYY-MM-DD`
- (예정) 음성 제출
  - POST `/api/part2/answers` (multipart/form-data: audio)
  - Res: `{ transcript, feedback: { score, tips: [] } }`

## 프론트엔드 개발

- 개발 서버
  - `npm install`
  - `.env` 예시
    ```
    VITE_API_BASE_URL=http://localhost:8080
    ```
  - `npm run dev`
- 스타일
  - Tailwind v3 사용: `@tailwind base; @tailwind components; @tailwind utilities;`
  - 필수 파일:
    - `tailwind.config.cjs`
    - `postcss.config.cjs` (plugins: tailwindcss, autoprefixer)
- 기본 구조(예)
  ```
  src/
    components/
      Navbar/
      ...
    pages/
    hooks/
    assets/
    index.css
    main.jsx
  ```

## 백엔드 실행(개요)

1) 환경변수 설정(또는 application.yml)  
2) MongoDB 접속 설정: `MONGODB_URI`  
3) AWS/S3, OpenAI 키 설정  
4) Spring Boot 애플리케이션 실행(8080)

## 로드맵

- 음성 업로드 → STT/번역/피드백 파이프라인 구현
- 문제 난이도/주제 파라미터화
- 문제/피드백 히스토리 UI
- 간단 사용자 관리(옵션)

## 주의

- OpenAI/S3 사용 시 비용이 발생할 수 있습니다.
- 개인 정보(음성 데이터) 저장 정책을 명시하고 로컬 보관을 기본값으로 유지하십시오.
