"""API 스펙 스모크 테스트 — 앱 로드 + 공통 래퍼/인증/엔드포인트 동작 확인."""
import io
import sys

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
AUTH = {"Authorization": "Bearer demo-token"}
fails = []


def check(name, cond, extra=""):
    mark = "OK " if cond else "XX "
    print(f"  [{mark}] {name}" + (f"  {extra}" if extra else ""))
    if not cond:
        fails.append(name)


print("=== 메타 / OpenAPI ===")
r = client.get("/health")
check("GET /health -> 200 & success", r.status_code == 200 and r.json()["success"] is True)

r = client.get("/openapi.json")
spec = r.json()
paths = sorted(spec.get("paths", {}).keys())
check("openapi.json -> 200", r.status_code == 200)
check("문서화된 경로 수", len(paths) >= 14, extra=f"{len(paths)}개")
r = client.get("/docs")
check("GET /docs -> 200", r.status_code == 200)

print("\n=== 인증 래퍼 ===")
r = client.get("/api/v1/auth/me")
body = r.json()
check("auth/me 무인증 -> 401", r.status_code == 401)
check("  오류 래퍼 형식", body["success"] is False and body["error"]["code"] == "UNAUTHORIZED", extra=str(body["error"]))

r = client.get("/api/v1/auth/me", headers=AUTH)
body = r.json()
check("auth/me 인증 -> 200", r.status_code == 200)
check("  data.role == senior", body["data"]["role"] == "senior")

print("\n=== 자산 ===")
r = client.get("/api/v1/assets", headers=AUTH)
body = r.json()
check("GET /assets -> 200", r.status_code == 200)
check("  data 가 리스트", isinstance(body["data"], list) and len(body["data"]) == 2)

r = client.post("/api/v1/assets", headers=AUTH,
                json={"asset_type": "crypto", "asset_name": "비트코인", "amount": 1000000})
body = r.json()
check("POST /assets -> 201", r.status_code == 201)
check("  source 기본값 manual", body["data"]["source"] == "manual")
check("  user_id 주입됨", body["data"]["user_id"] == "00000000-0000-0000-0000-000000000001")

r = client.post("/api/v1/assets/voice", headers=AUTH, json={"text": "농협에 돈 넣어뒀어"})
body = r.json()
check("POST /assets/voice -> candidates", body["data"]["candidates"][0]["institution"] == "농협은행")

r = client.post("/api/v1/assets/ocr", headers=AUTH,
                files={"file": ("a.png", io.BytesIO(b"x"), "image/png")})
body = r.json()
check("POST /assets/ocr -> extracted.amount", body["data"]["extracted"]["amount"] == 5000000)

print("\n=== 검증 오류 래퍼 ===")
r = client.post("/api/v1/assets", headers=AUTH, json={"asset_type": "INVALID", "asset_name": "x"})
body = r.json()
check("잘못된 enum -> 422", r.status_code == 422)
check("  VALIDATION_ERROR 코드", body["error"]["code"] == "VALIDATION_ERROR")

print("\n=== 조력자 / FDS / 유산 ===")
sid = "00000000-0000-0000-0000-000000000001"
r = client.get(f"/api/v1/helpers/dashboard/{sid}", headers=AUTH)
body = r.json()
check("GET /helpers/dashboard -> total_amount", body["data"]["total_amount"] == 5000000)

r = client.post("/api/v1/fds/unlock", headers=AUTH, json={"otp": "123456"})
check("POST /fds/unlock 6자리 -> is_locked false", r.json()["data"]["is_locked"] is False)
r = client.post("/api/v1/fds/unlock", headers=AUTH, json={"otp": "12"})
check("POST /fds/unlock 짧음 -> 422(스키마)", r.status_code == 422)

r = client.get("/api/v1/legacy", headers=AUTH)
body = r.json()
check("GET /legacy -> encrypted_data 미노출", "encrypted_data" not in body["data"][0])

print("\n" + "=" * 44)
if fails:
    print(f"실패 {len(fails)}건: {fails}")
    sys.exit(1)
print(f"모든 검증 통과 (문서화 경로 {len(paths)}개)")
print("경로 목록:")
for p in paths:
    print("  ", p)
