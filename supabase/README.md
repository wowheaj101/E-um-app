# 이음(E-UM) — Supabase DB

개발 순서 **1단계: DB 스키마 생성 + RLS 정책** 산출물입니다.
(참조: `이음_기술명세서.md` §2 데이터베이스 설계)

## 구성

```
supabase/
└── migrations/
    ├── 20260530120000_initial_schema.sql   # 테이블 5종 + 인덱스 + 트리거
    └── 20260530120100_rls_policies.sql     # RLS 활성화 + 정책 + 헬퍼 함수
```

### 테이블

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 (Supabase Auth `auth.users` 와 1:1 연동) |
| `assets` | 자산 (시니어별) |
| `helpers` | 조력자 연결 (senior ↔ helper) |
| `digital_legacy` | 디지털 유산 노트 (암호화 저장) |
| `fds_logs` | 이상 감지 로그 |

### RLS 정책 요약

| 테이블 | 정책 |
|--------|------|
| `users` | 본인 + 연결된 사용자 SELECT / 본인 INSERT·UPDATE |
| `assets` | 본인 = 전체 CRUD / 연결된 활성 조력자 = SELECT만 |
| `helpers` | senior·helper 일치 시 SELECT, 시니어 초대, 양측 수락/해제 |
| `digital_legacy` | 본인만 전체 CRUD |
| `fds_logs` | 본인 + 연결 활성 조력자 SELECT, 본인 INSERT·UPDATE |

> 조력자의 **이체·수정 차단**은 SELECT 권한만 부여하여 구조적으로 보장됩니다.

## 적용 방법

### 방법 A — Supabase 대시보드 SQL Editor (가장 빠름)

1. Supabase 프로젝트 → **SQL Editor** 열기
2. `20260530120000_initial_schema.sql` 내용 붙여넣고 **Run**
3. `20260530120100_rls_policies.sql` 내용 붙여넣고 **Run** (순서 중요)

> 두 파일 모두 재실행 안전(idempotent)하게 작성되어 있어 여러 번 실행해도 됩니다.

### 방법 B — Supabase CLI

```bash
# 최초 1회: 프로젝트 연결
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>

# 마이그레이션 적용
supabase db push
```

## 검증 체크리스트

- [ ] 5개 테이블이 `public` 스키마에 생성됨
- [ ] 각 테이블 RLS = **Enabled** (Table Editor에서 확인)
- [ ] 신규 회원가입 시 `public.users` 행 자동 생성 (`on_auth_user_created` 트리거)
- [ ] 조력자 계정으로 시니어 자산 SELECT만 가능 / INSERT·UPDATE·DELETE 차단

## 다음 단계

→ **2단계: FastAPI API 스펙 정의** (응답 형식 확정). 본 스키마의 컬럼이
`types/asset.ts` 등 프론트 타입과 1:1 매핑되도록 유지합니다.
