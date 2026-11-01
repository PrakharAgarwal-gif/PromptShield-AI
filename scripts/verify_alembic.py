"""
Verification script for Alembic migrations.
Runs Alembic upgrade head against an isolated database to verify that
all DDL statements, constraints, indexes, and tables apply cleanly.
"""

import os
import sys
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

# Ensure workspace root in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def verify_alembic_schema():
    print("=" * 60)
    print("ALEMBIC MIGRATION & SCHEMA VERIFICATION")
    print("=" * 60)

    db_path = os.path.abspath("test_migration.db")
    if os.path.exists(db_path):
        os.remove(db_path)

    test_db_url = f"sqlite:///{db_path}"
    print(f"Target verification database: {test_db_url}")

    # Configure Alembic
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", test_db_url)

    print("\n[ALEMBIC] Executing command: upgrade head...")
    command.upgrade(alembic_cfg, "head")
    print("[ALEMBIC] Upgrade to head completed successfully!")

    # Inspect created tables
    engine = create_engine(test_db_url)
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    print(f"\n[SCHEMA] Tables created in database: {tables}")
    expected_tables = ["applications", "deployments", "incidents", "recovery_actions", "monitoring_metrics", "alembic_version"]

    for table in expected_tables:
        assert table in tables, f"Missing table: {table}"
        print(f"  [OK] Confirmed table: {table}")

    # Inspect columns for applications table
    app_cols = [c["name"] for c in inspector.get_columns("applications")]
    print(f"\n[SCHEMA] 'applications' columns: {app_cols}")
    for col in ["id", "name", "description", "repository_url", "environment", "status", "created_at", "updated_at"]:
        assert col in app_cols, f"Missing column {col} in applications"

    # Inspect foreign keys for deployments
    fks = inspector.get_foreign_keys("deployments")
    print(f"[SCHEMA] 'deployments' foreign keys: {fks}")
    assert any(fk["referred_table"] == "applications" for fk in fks), "Missing FK to applications in deployments"

    # Test downgrade and upgrade cycle
    print("\n[ALEMBIC] Executing downgrade to base...")
    command.downgrade(alembic_cfg, "base")
    inspector_down = inspect(engine)
    remaining_tables = inspector_down.get_table_names()
    print(f"[ALEMBIC] Tables after downgrade: {remaining_tables}")
    assert "applications" not in remaining_tables

    print("[ALEMBIC] Re-applying upgrade head...")
    command.upgrade(alembic_cfg, "head")
    print("[ALEMBIC] Clean migration cycle verified!")

    # Clean up test file
    engine.dispose()
    if os.path.exists(db_path):
        os.remove(db_path)

    print("\n" + "=" * 60)
    print("ALL ALEMBIC MIGRATION TESTS PASSED (100% SUCCESS)")
    print("=" * 60)

if __name__ == "__main__":
    verify_alembic_schema()
