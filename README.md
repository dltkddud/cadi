# Cadi — AI 옷장 스타일링 서비스

나의 옷장에서 시작하는 AI 스타일링 서비스. 보유한 의류 사진을 등록하면 Cadi가 상황(장소·날씨·목적)에 맞는 착장과 어울리는 MCM 가방을 제안합니다.

배포: <https://dltkddud.github.io/cadi/>

> GitHub Pages는 `/cadi/` 하위 경로로 서빙됩니다. `https://dltkddud.github.io/` (루트)는 404이며, 반드시 `/cadi/`까지 포함한 주소로 접속해야 합니다.

## 주요 기능

- **랜딩 오프닝**: 서비스 소개와 시작하기 흐름
- **온보딩**: 회원가입, 로그인, 데이터 활용 동의
- **내 옷장**: 의류 사진 등록 및 AI 분석(카테고리/색상/스타일/계절), 카테고리 필터, 가로형 카드 목록
- **AI 스타일링 추천**: 착용 장소, 방문 목적, 날씨, 시간대를 입력하면 보유 의류 조합과 MCM 가방을 추천
- **데이터 관리**: 등록된 의류 개별 삭제 및 전체 삭제

## 기술 스택

- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase (DB + Edge Functions)
- OpenAI (Edge Function 내에서 호출)
- lucide-react (아이콘)

## 로컬 실행

```bash
npm install
cp .env.example .env   # 값을 채워주세요
npm run dev
```

그 밖의 스크립트:

```bash
npm run build      # 프로덕션 빌드 (base: /cadi/)
npm run preview    # 빌드 결과 미리보기
npm run typecheck  # 타입 체크
npm run lint       # ESLint
```

## 환경 변수

`.env` 파일에 아래 값을 설정합니다 (`.env.example` 참고).

| 변수 | 설명 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

OpenAI API 키는 프런트엔드가 아니라 Supabase Edge Function의 secret으로 설정합니다.

```bash
supabase secrets set API=sk-your-openai-key
```

`.env`가 없어도 앱은 흰 화면 없이 실행되며, 샘플 옷장과 mock 분석 결과로 동작합니다. 이 경우 등록한 의류는 저장되지 않습니다.

## 배포

`main`에 push하면 `.github/workflows/deploy.yml`이 빌드 후 GitHub Pages로 배포합니다.
저장소 Settings → Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록해야 빌드에 값이 주입됩니다.

`vite.config.ts`의 `base`는 프로덕션 빌드에서만 `/cadi/`로 설정됩니다. 저장소 이름을 바꾸면 이 값도 함께 바꿔야 합니다.
