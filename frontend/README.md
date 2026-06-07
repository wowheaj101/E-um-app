# 이음(E-UM) 프론트엔드

시니어-가족 연결 AI 자산관리 — Vue 3 + TypeScript + Vite. 모바일 우선.
디자인은 **Wanted Design System** 토큰을 기반으로 E-UM 브랜드(Navy `#1A2B4C` +
Amber `#F8B820`)를 입혀 재구성했다. 단일 기준 문서는 루트의 `이음_기술명세서.md`.

## 실행

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # 타입체크(vue-tsc) + 프로덕션 빌드
npm run type-check   # 타입만 검사
```

## 데이터 소스 (mock ↔ real swap)

`.env` 의 `VITE_USE_MOCK` 로 전환한다.

- `VITE_USE_MOCK=true` (기본) — `src/services/mock/*` 인메모리 데이터. 백엔드/인증 불필요.
- `VITE_USE_MOCK=false` — `VITE_API_BASE_URL` 의 실제 FastAPI 백엔드 호출.
  `localStorage['eum_access_token']` 의 Supabase JWT 를 Bearer 로 전송.

화면·스토어는 `services/*` 인터페이스만 바라보고, mock/real 모두 **동일한 `src/types`**
(백엔드 `schemas.py` 와 1:1)를 반환하므로 응답 모양이 표류하지 않는다. 실연동은
엔드포인트 단위로 점진 전환한다.

## 구조

```
src/
├─ styles/tokens/     # 디자인 토큰(CSS 변수). E-UM Navy/Amber override 포함
├─ styles/index.css   # Tailwind 레이어 + 시니어 모드([data-mode] 확대)
├─ components/
│  ├─ common/         # AppIcon·BaseButton·BaseCard·ListCell·AppHeader·BrandLogo·MicIcon
│  └─ asset/          # AssetAvatar
├─ views/             # HomeView·AssetListView·VoiceInputView
├─ composables/       # useSpeech (Web Speech API + fallback)
├─ stores/            # Pinia: auth(role·mode)·asset
├─ services/          # http(axios)·mock·assetService·authService (USE_MOCK 분기)
├─ types/             # 백엔드 schemas.py 와 1:1
└─ utils/             # 금액 포맷 등
```

## 시니어 모드

`<html data-mode="senior">` 에서 타이포 토큰이 커져(본문 18px+/제목 24px+) 모든
`.wt-*`·`var()` 참조 컴포넌트가 자동 확대된다. 홈 우상단 "글자 크기(보통/크게)"
토글이 `data-mode` 를 바꾼다(`stores/auth` 의 `setMode`). 조력자 모드는 DS 표준값.

## Tailwind

`tailwind.config.js` 의 theme 가 토큰 CSS 변수(`var(--token)`)를 참조한다.
타이포는 다중 속성을 묶는 `.wt-*` 클래스를, 색/간격/반경/그림자는 Tailwind 유틸을 쓴다.
