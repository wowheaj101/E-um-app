# 기여 가이드 (이음 / E-UM)

이 문서는 새 팀원 온보딩과 협업 규칙을 정리합니다. 설계·범위의 단일 기준(SSOT)은
`이음_기술명세서.md`이며, 작업 전 항상 먼저 참조하세요. 코드베이스 가이드는 `CLAUDE.md`입니다.

개발 환경: **Windows + PowerShell**. 한글/이모지를 출력하는 Python 스크립트는 콘솔(cp949)에서
깨지므로 `PYTHONIOENCODING=utf-8`을 설정합니다.

---

## 1. 처음 한 번 — 온보딩

```powershell
# 1) 클론
git clone https://github.com/wowheaj101/E-um-app.git
cd E-um-app

# 2) 환경변수 템플릿 복사 (값은 비어 있음)
Copy-Item backend/.env.example backend/.env

# 3) backend/.env 의 값 채우기  → 아래 "2. 환경변수와 비밀정보" 참고
#    실제 키는 git 이 아니라 팀 비밀번호 관리자(공유 볼트)에서 받습니다.

# 4) 백엔드 의존성 설치 + 실행
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # Swagger: http://localhost:8000/docs
```

> 프론트엔드(`src/`)는 3단계에서 추가됩니다. 추가되면 이 문서에 설치 절차를 보완합니다.

---

## 2. 환경변수와 비밀정보

### 원칙: "구조는 커밋, 값은 별도 채널" (12-Factor Config)

- **`backend/.env.example` (커밋함)** — 어떤 변수가 필요한지 알려주는 템플릿. **빈 값/더미만.**
  새 변수를 추가하면 반드시 여기에도 키를 추가해 동료에게 알립니다.
- **`backend/.env` (절대 커밋 안 함)** — 실제 값. `.gitignore`로 제외됨. git 밖의 채널로 공유.

### 실제 값은 어디서 받나

| 변수 | 출처 |
|------|------|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` | Supabase 대시보드 → Project Settings → **API** |
| `SUPABASE_DB_URL` | Supabase → Connect → **Session Pooler** 문자열 (마이그레이션용) |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey |
| `LEGACY_ENCRYPTION_KEY` | 팀 공유 볼트의 **고정 값** (아래 주의 참고) |

팀 공유 방법: **비밀번호 관리자의 공유 볼트**(1Password / Bitwarden 등)에 `.env` 항목을 두고
권한 있는 팀원이 열람합니다. 배포 환경은 플랫폼 대시보드에 직접 입력합니다
(Render → Environment, Vercel → Environment Variables).

> ❌ 카카오톡·이메일·Slack·커밋·스크린샷으로 키를 평문 전달하지 마세요. 한 번이라도
> 안전하지 않은 채널을 거친 키는 "유출"로 간주하고 즉시 회전(rotate)합니다.

### 키별 주의사항 (이음 특이점)

- **`SUPABASE_ANON_KEY`(anon/publishable)는 공개돼도 안전**합니다. 프론트 번들에 포함되도록
  설계된 키이며, 실제 데이터 보호는 **RLS**가 합니다. 프론트에서는 `VITE_` 접두사로 노출 OK.
- **`SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_JWT_SECRET` / `GEMINI_API_KEY`는 서버 전용.**
  RLS를 우회하거나 토큰을 위조할 수 있으므로 **프론트엔드/클라이언트에 절대 넣지 마세요.**
- **`LEGACY_ENCRYPTION_KEY`는 환경 간 동일해야 합니다.** 디지털 유산 암호화 키라, 한 곳에서
  암호화한 데이터는 같은 키로만 복호화됩니다. **이 키를 잃으면 저장 데이터를 영구히 못 읽습니다** —
  공유 볼트에 반드시 백업하고, dev/prod가 같은 값을 쓰도록 합니다. (개발 초기 더미 데이터만
  있을 때는 새로 생성해도 무방: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)

### 무시되는 파일도 종류가 다릅니다

| 종류 | 예시 | 공유 방법 |
|------|------|-----------|
| 진짜 비밀 | `backend/.env` | 공유 볼트 |
| 개인 로컬 설정 | `.claude/settings.local.json` | **공유 안 함** — 각자 생성. 접속 문자열이 평문으로 남을 수 있음 |
| 빌드 산출물 | `__pycache__/`, `node_modules/`, `dist/` | **공유 안 함** — 재생성. 대신 lockfile을 커밋해 버전 통일 |

---

## 3. DB 마이그레이션

스키마/RLS 변경은 `supabase/migrations/`에 **타임스탬프 순 파일**로 추가합니다(재실행 안전하게
`if not exists` / `or replace` 사용). 적용·검증:

```powershell
# setup_db.py 는 SUPABASE_DB_URL 환경변수를 직접 읽습니다(.env 자동 로드 아님).
$env:SUPABASE_DB_URL = (Get-Content backend/.env | Select-String '^SUPABASE_DB_URL=').ToString().Split('=',2)[1]
$env:PYTHONIOENCODING = "utf-8"
python supabase/setup_db.py               # 적용 후 검증
python supabase/setup_db.py --verify-only # 적용 없이 검증만
```

> IPv4 전용 망에서는 Direct connection(`db.<ref>.supabase.co`)이 DNS 해석조차 실패하므로
> 반드시 **Session Pooler** 문자열(`...pooler.supabase.com:5432`)을 사용합니다. 자세한 내용은
> `CLAUDE.md` "Supabase 접속 제약" 참고.

---

## 4. 테스트

```powershell
cd backend
$env:PYTHONIOENCODING = "utf-8"

# 오프라인 — 자격증명 없이 부팅·라우팅·응답래퍼·JWT·암호화 검증
python smoke_test.py

# 라이브 — 실제 Supabase + Gemini 연동 (.env 채움 + 로그인 사용자 토큰 필요)
$env:TEST_ACCESS_TOKEN = "<supabase access_token>"
python integration_test.py
```

PR을 올리기 전 최소 **오프라인 스모크 테스트는 통과**해야 합니다.

---

## 5. 브랜치 / 커밋 / PR

- `main`에 직접 푸시하지 말고 **기능 브랜치**에서 작업 후 PR을 엽니다.
  예: `feat/asset-list-view`, `fix/ocr-amount-parse`.
- 커밋 메시지는 **Conventional Commits** 권장: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
  본문은 한국어로 "무엇을·왜" 설명합니다.
- **커밋 전 비밀정보 점검** — 스테이징 diff에 키/비밀번호/접속 문자열이 없는지 확인:

  ```powershell
  git diff --cached | Select-String -Pattern 'SUPABASE_SERVICE|JWT_SECRET|GEMINI_API_KEY|pooler\.supabase|sb_secret_'
  ```
  (아무것도 출력되지 않아야 정상)

- API 계약(`backend/app/schemas.py`)을 바꾸면 DB 컬럼·프론트 타입과의 1:1 정합성을 함께 확인합니다.

---

## 6. 비밀 키가 유출됐다면

키가 커밋/평문 전달/스크린샷 등으로 노출됐다면 **삭제만으로는 부족**합니다(히스토리·캐시에 남음).
즉시 해당 서비스에서 **회전(재발급)** 하세요.

- Supabase: Project Settings → API → service_role/anon 재발급, JWT Secret 회전
- Gemini: AI Studio에서 키 폐기 후 재발급
- 회전한 새 값을 공유 볼트와 배포 환경(Render/Vercel)에 갱신
