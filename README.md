# Cadi

나의 옷장에서 시작하는 AI 스타일링 서비스. 보유한 의류 사진을 등록하면 Cadi가 상황(장소·날씨·목적)에 맞는 착장과 어울리는 MCM 가방을 제안합니다.

## 기술 스택

- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase (DB + Edge Functions)
- OpenAI (Edge Function 내에서 호출)

## 로컬 실행

```bash
npm install
cp .env.example .env   # 값을 채워주세요
npm run dev
```

## 환경 변수

`.env` 파일에 아래 값을 설정합니다 (`.env.example` 참고).

| 변수 | 설명 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

> OpenAI API 키는 프런트엔드에 두지 않고 Supabase Edge Function 시크릿(`API`)으로 설정합니다.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint
- `npm run typecheck` — 타입 검사
