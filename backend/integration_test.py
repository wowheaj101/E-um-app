"""라이브 통합 테스트 — 실제 Supabase + Gemini 연동 검증.

사전 조건:
  1) backend/.env 에 SUPABASE_* / GEMINI_API_KEY / LEGACY_ENCRYPTION_KEY 채움
  2) 로그인한 사용자(시니어)의 Supabase access_token 을 환경변수로 전달
     예) $env:TEST_ACCESS_TOKEN="eyJ..."; $env:PYTHONIOENCODING="utf-8"; python integration_test.py

DB 에 실제 행을 생성/삭제하므로(자산·유산), 테스트 후 정리까지 수행한다.
"""
import os
import sys

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

fails = []


def check(name, cond, extra=""):
    print(f"  [{'OK ' if cond else 'XX '}] {name}" + (f"  {extra}" if extra else ""))
    if not cond:
        fails.append(name)


if not settings.supabase_configured or not settings.supabase_jwt_secret:
    print("[SKIP] .env 의 SUPABASE_URL/ANON_KEY/JWT_SECRET 가 필요합니다.")
    sys.exit(2)

token = os.environ.get("TEST_ACCESS_TOKEN")
if not token:
    print("[SKIP] TEST_ACCESS_TOKEN 환경변수가 필요합니다 (로그인 사용자의 access_token).")
    sys.exit(2)

client = TestClient(app)
AUTH = {"Authorization": f"Bearer {token}"}

print("=== 인증 ===")
r = client.get("/api/v1/auth/me", headers=AUTH)
check("GET /auth/me -> 200", r.status_code == 200, extra=str(r.json())[:200])
me = r.json().get("data") if r.status_code == 200 else None
if not me:
    print("토큰 검증 실패 — 이후 테스트 중단.")
    sys.exit(1)
print(f"  로그인: {me['name']} ({me['role']}) {me['email']}")

print("\n=== 자산 CRUD ===")
r = client.get("/api/v1/assets", headers=AUTH)
check("GET /assets -> 200 & list", r.status_code == 200 and isinstance(r.json()["data"], list))

r = client.post("/api/v1/assets", headers=AUTH,
                json={"asset_type": "bank", "asset_name": "통합테스트 예금", "institution": "테스트은행", "amount": 12345})
check("POST /assets -> 201", r.status_code == 201, extra=str(r.json())[:200])
asset_id = r.json()["data"]["id"] if r.status_code == 201 else None

if asset_id:
    r = client.patch(f"/api/v1/assets/{asset_id}", headers=AUTH, json={"amount": 99999})
    check("PATCH /assets/{id} -> amount 갱신", r.status_code == 200 and r.json()["data"]["amount"] == 99999)
    r = client.delete(f"/api/v1/assets/{asset_id}", headers=AUTH)
    check("DELETE /assets/{id} -> deleted", r.status_code == 200 and r.json()["data"]["deleted"] is True)

print("\n=== 음성 파싱 (Gemini) ===")
r = client.post("/api/v1/assets/voice", headers=AUTH, json={"text": "농협에 오백만원 예금 넣어뒀어"})
ok_voice = r.status_code == 200 and isinstance(r.json()["data"]["candidates"], list)
check("POST /assets/voice -> candidates", ok_voice, extra=str(r.json())[:200])
if ok_voice and r.json()["data"]["candidates"]:
    print("  후보:", r.json()["data"]["candidates"][0])

print("\n=== 디지털 유산 (암호화) ===")
r = client.post("/api/v1/legacy", headers=AUTH,
                json={"category": "sns", "title": "통합테스트 계정", "content": "id/pw 비밀값"})
check("POST /legacy -> 201", r.status_code == 201, extra=str(r.json())[:200])
note_id = r.json()["data"]["id"] if r.status_code == 201 else None
check("  응답에 encrypted_data 미노출", note_id is not None and "encrypted_data" not in r.json()["data"])
if note_id:
    r = client.get("/api/v1/legacy", headers=AUTH)
    check("GET /legacy -> 목록", r.status_code == 200 and any(n["id"] == note_id for n in r.json()["data"]))
    r = client.delete(f"/api/v1/legacy/{note_id}", headers=AUTH)
    check("DELETE /legacy/{id}", r.status_code == 200)

print("\n=== FDS ===")
r = client.get("/api/v1/fds/logs", headers=AUTH)
check("GET /fds/logs -> 200", r.status_code == 200)
r = client.post("/api/v1/fds/lock", headers=AUTH, json={"reason": "통합테스트"})
check("POST /fds/lock -> is_locked", r.status_code == 200 and r.json()["data"]["is_locked"] is True)
r = client.post("/api/v1/fds/unlock", headers=AUTH, json={"otp": "123456"})
check("POST /fds/unlock 6자리 -> is_locked false", r.status_code == 200 and r.json()["data"]["is_locked"] is False)

print("\n" + "=" * 44)
if fails:
    print(f"실패 {len(fails)}건: {fails}")
    sys.exit(1)
print("모든 라이브 검증 통과")
