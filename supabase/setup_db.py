"""
이음(E-UM) — DB 마이그레이션 적용 + 검증 스크립트 (1단계).

사용법:
    SUPABASE_DB_URL="postgresql://..." python supabase/setup_db.py
또는
    SUPABASE_DB_URL="postgresql://..." python supabase/setup_db.py --verify-only

연결 문자열은 환경변수로만 받으며 출력하지 않는다(비밀번호 노출 방지).
"""
import os
import sys
import glob

import psycopg2

# Windows 콘솔(cp949)에서도 한글/기호 출력이 깨지지 않도록 UTF-8 강제
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
MIG_DIR = os.path.join(HERE, "migrations")

EXPECTED_TABLES = {"users", "assets", "helpers", "digital_legacy", "fds_logs"}
EXPECTED_FUNCS = {"is_active_helper", "is_connected", "handle_new_user", "set_updated_at"}


def connect():
    dsn = os.environ.get("SUPABASE_DB_URL")
    if not dsn:
        print("[FAIL] SUPABASE_DB_URL 환경변수가 없습니다.")
        sys.exit(2)
    return psycopg2.connect(dsn, sslmode="require", connect_timeout=20)


def apply_migrations(conn):
    files = sorted(glob.glob(os.path.join(MIG_DIR, "*.sql")))
    if not files:
        print("[FAIL] migrations/*.sql 파일을 찾을 수 없습니다.")
        sys.exit(2)
    for f in files:
        sql = open(f, encoding="utf-8").read()
        try:
            with conn.cursor() as cur:
                cur.execute(sql)
            conn.commit()
            print(f"  [OK] {os.path.basename(f)}")
        except Exception as e:
            conn.rollback()
            print(f"  [FAIL] {os.path.basename(f)} -> {type(e).__name__}: {e}")
            raise


def q(conn, sql):
    with conn.cursor() as cur:
        cur.execute(sql)
        return cur.fetchall()


def verify(conn):
    ok = True

    # 1) 테이블
    rows = q(conn, """
        select table_name from information_schema.tables
        where table_schema='public' and table_type='BASE TABLE'
        order by table_name
    """)
    found = {r[0] for r in rows}
    missing = EXPECTED_TABLES - found
    print(f"\n[1] 테이블: {sorted(found & EXPECTED_TABLES)}")
    if missing:
        ok = False
        print(f"    [FAIL] 누락: {sorted(missing)}")

    # 2) RLS 활성화 여부
    rows = q(conn, """
        select c.relname, c.relrowsecurity
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relname = any(%s)
        order by c.relname
    """ % "array['users','assets','helpers','digital_legacy','fds_logs']")
    print("\n[2] RLS 활성화:")
    for name, enabled in rows:
        flag = "ON " if enabled else "OFF"
        print(f"    {flag}  {name}")
        if not enabled:
            ok = False

    # 3) 정책
    rows = q(conn, """
        select tablename, policyname, cmd from pg_policies
        where schemaname='public' order by tablename, policyname
    """)
    print(f"\n[3] RLS 정책 ({len(rows)}개):")
    for t, p, cmd in rows:
        print(f"    {t:<16} {p:<22} {cmd}")
    if len(rows) == 0:
        ok = False
        print("    [FAIL] 정책이 없습니다.")

    # 4) 함수
    rows = q(conn, """
        select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and proname = any(%s) order by proname
    """ % "array['is_active_helper','is_connected','handle_new_user','set_updated_at']")
    fns = {r[0] for r in rows}
    print(f"\n[4] 함수: {sorted(fns)}")
    if EXPECTED_FUNCS - fns:
        ok = False
        print(f"    [FAIL] 누락: {sorted(EXPECTED_FUNCS - fns)}")

    # 5) 트리거 (auth.users + assets)
    rows = q(conn, """
        select n.nspname as schema, c.relname as table, t.tgname as trigger
        from pg_trigger t
        join pg_class c on c.oid=t.tgrelid
        join pg_namespace n on n.oid=c.relnamespace
        where t.tgname in ('on_auth_user_created','trg_assets_set_updated_at')
        order by t.tgname
    """)
    print("\n[5] 트리거:")
    for s, t, trg in rows:
        print(f"    {s}.{t}  ->  {trg}")
    trg_names = {r[2] for r in rows}
    for need in ("on_auth_user_created", "trg_assets_set_updated_at"):
        if need not in trg_names:
            ok = False
            print(f"    [FAIL] 누락 트리거: {need}")

    print("\n" + ("=" * 48))
    print("검증 결과:", "ALL PASS [OK]" if ok else "일부 실패 [FAIL]")
    print("=" * 48)
    return ok


def main():
    verify_only = "--verify-only" in sys.argv
    conn = connect()
    try:
        if not verify_only:
            print("마이그레이션 적용:")
            apply_migrations(conn)
        passed = verify(conn)
    finally:
        conn.close()
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
