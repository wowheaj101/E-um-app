"""오프라인 스모크 테스트 — 자격증명 없이 부팅/라우팅/응답래퍼/보안로직 검증.

실제 Supabase/Gemini 네트워크는 호출하지 않는다(설정을 강제로 비워 503 경로 확인).
JWT 검증·AES 암복호화·Gemini 정규화 같은 순수 로직은 직접 단위 검증한다.
라이브 연동 검증은 integration_test.py 참조.
"""
import sys
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt

# --- 결정적 오프라인 검증을 위해 설정을 강제(앱 임포트 전에) ---
from app.core.config import settings

settings.supabase_jwt_secret = "test-secret"
settings.legacy_encryption_key = "test-legacy-key"
settings.supabase_url = None       # 네트워크 차단 → ConfigError 경로 확인
settings.supabase_anon_key = None

from fastapi.testclient import TestClient  # noqa: E402

from app.core import gemini, security  # noqa: E402
from app.core.security import AuthError  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)
fails = []


def check(name, cond, extra=""):
    print(f"  [{'OK ' if cond else 'XX '}] {name}" + (f"  {extra}" if extra else ""))
    if not cond:
        fails.append(name)


def make_token(secret="test-secret", aud="authenticated", expired=False):
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "sub": str(uuid4()),
            "email": "senior@example.com",
            "aud": aud,
            "exp": now + (timedelta(hours=-1) if expired else timedelta(hours=1)),
            "user_metadata": {"name": "김순자", "role": "senior"},
        },
        secret,
        algorithm="HS256",
    )


print("=== 메타 / OpenAPI ===")
r = client.get("/health")
check("GET /health -> 200 & success", r.status_code == 200 and r.json()["success"] is True)
check("  supabase_configured 노출", "supabase_configured" in r.json()["data"])

spec = client.get("/openapi.json").json()
paths = sorted(spec.get("paths", {}).keys())
check("문서화된 경로 수 >= 14", len(paths) >= 14, extra=f"{len(paths)}개")
check("GET /docs -> 200", client.get("/docs").status_code == 200)

print("\n=== 인증 래퍼 ===")
r = client.get("/api/v1/auth/me")
body = r.json()
check("auth/me 무인증 -> 401", r.status_code == 401)
check("  오류 래퍼 UNAUTHORIZED", body["success"] is False and body["error"]["code"] == "UNAUTHORIZED")

r = client.post("/api/v1/auth/login", json={"access_token": make_token(secret="wrong-secret")})
check("login 잘못된 서명 -> 401", r.status_code == 401)

print("\n=== JWT 검증 (단위) ===")
claims = security.verify_supabase_jwt(make_token())
check("유효 토큰 -> sub 반환", "sub" in claims and claims["email"] == "senior@example.com")
try:
    security.verify_supabase_jwt(make_token(expired=True))
    check("만료 토큰 -> AuthError", False)
except AuthError:
    check("만료 토큰 -> AuthError", True)
try:
    security.verify_supabase_jwt(make_token(secret="other"))
    check("서명 불일치 -> AuthError", False)
except AuthError:
    check("서명 불일치 -> AuthError", True)

print("\n=== AES(Fernet) 암복호화 (단위) ===")
secret_text = "카카오 비밀번호: hunter2 / 복구코드 abc-123"
enc = security.encrypt(secret_text)
check("암호문 != 평문", enc != secret_text)
check("복호화 round-trip 일치", security.decrypt(enc) == secret_text)

print("\n=== Gemini 정규화 (단위) ===")
c = gemini._norm_candidate({"asset_type": "weird", "amount": "5000000", "confidence": 2})
check("잘못된 asset_type -> bank", c["asset_type"] == "bank")
check("문자열 amount -> int", c["amount"] == 5000000)
check("confidence 클램프 <=1", c["confidence"] == 1.0)
check("_to_int 비정상 -> None", gemini._to_int("x") is None and gemini._to_int(None) is None)

print("\n=== 미구성(503) 게이트 ===")
tok = {"Authorization": f"Bearer {make_token()}"}
r = client.get("/api/v1/assets", headers=tok)
body = r.json()
check("GET /assets 미구성 -> 503", r.status_code == 503)
check("  NOT_CONFIGURED 코드", body["error"]["code"] == "NOT_CONFIGURED")

print("\n=== 검증 오류 래퍼 ===")
r = client.post("/api/v1/auth/login", json={})
check("login 필드 누락 -> 422", r.status_code == 422 and r.json()["error"]["code"] == "VALIDATION_ERROR")

print("\n" + "=" * 44)
if fails:
    print(f"실패 {len(fails)}건: {fails}")
    sys.exit(1)
print(f"모든 오프라인 검증 통과 (문서화 경로 {len(paths)}개)")
for p in paths:
    print("  ", p)
