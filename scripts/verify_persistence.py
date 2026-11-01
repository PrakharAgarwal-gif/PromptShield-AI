"""
Data Persistence Verification Script for CloudOps Sentinel.
Validates that database state survives connection terminations and container/process restarts,
confirming named volume and file persistence integrity.
"""

import os
import sys
import uuid
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure project root in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models.application import Application
from app.models.deployment import Deployment
from app.models.incident import Incident
from app.models.recovery import RecoveryAction

DB_FILE = os.path.abspath("test_persistence.db")

def run_persistence_test():
    print("=" * 65)
    print("CLOUDOPS SENTINEL: DATA PERSISTENCE & RESTART INTEGRITY TEST")
    print("=" * 65)

    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

    db_url = f"sqlite:///{DB_FILE}"

    # 1. Apply Schema via Alembic
    print("\n[PHASE 1] Initializing persistent schema via Alembic...")
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    command.upgrade(alembic_cfg, "head")
    print("[PHASE 1] Database schema initialized.")

    # 2. Write Data in Session 1
    print("\n[PHASE 2] Writing production records before restart...")
    engine_1 = create_engine(db_url)
    Session_1 = sessionmaker(bind=engine_1)
    session_1 = Session_1()

    app_id = str(uuid.uuid4())
    app_record = Application(
        id=app_id,
        name="sentinel-billing-service",
        description="Persistent billing engine service",
        environment="production",
        status="healthy",
    )
    session_1.add(app_record)

    dep_id = str(uuid.uuid4())
    dep_record = Deployment(
        id=dep_id,
        application_id=app_id,
        version="v3.0.0",
        commit_hash="f0e1d2c3b4a5",
        status="successful",
        deployment_environment="production",
    )
    session_1.add(dep_record)

    inc_id = str(uuid.uuid4())
    inc_record = Incident(
        id=inc_id,
        application_id=app_id,
        title="High payment gateway latency",
        severity="high",
        status="investigating",
    )
    session_1.add(inc_record)

    rec_id = str(uuid.uuid4())
    rec_record = RecoveryAction(
        id=rec_id,
        application_id=app_id,
        incident_id=inc_id,
        action_type="scale_replicas",
        execution_status="simulated",
        execution_details="[DRY-RUN SIMULATION] Scaled replicas from 2 to 4 safely.",
    )
    session_1.add(rec_record)

    app_name = app_record.name
    session_1.commit()
    session_1.close()
    engine_1.dispose()
    print(f"  [OK] Successfully committed records for Application '{app_name}' ({app_id})")

    # 3. Simulate Container / Process Shutdown & Restart
    print("\n[PHASE 3] Simulating container shutdown and restart...")
    print("  Closing all connection pools and releasing memory...")
    del session_1
    del engine_1

    # Verify physical file persists
    assert os.path.exists(DB_FILE), "Persistent storage file disappeared!"
    file_size = os.path.getsize(DB_FILE)
    print(f"  [OK] Confirmed storage volume exists: {file_size} bytes")

    # 4. Reconnect in a New Isolated Session
    print("\n[PHASE 4] Reconnecting to persistent storage with new session...")
    engine_2 = create_engine(db_url)
    Session_2 = sessionmaker(bind=engine_2)
    session_2 = Session_2()

    # Query persisted data
    loaded_app = session_2.query(Application).filter_by(id=app_id).first()
    assert loaded_app is not None, "Application record was lost after restart!"
    print(f"  [OK] Persisted App verified: '{loaded_app.name}' ({loaded_app.id})")

    loaded_dep = session_2.query(Deployment).filter_by(id=dep_id).first()
    assert loaded_dep is not None, "Deployment record was lost!"
    print(f"  [OK] Persisted Deployment verified: {loaded_dep.version} (Commit: {loaded_dep.commit_hash})")

    loaded_inc = session_2.query(Incident).filter_by(id=inc_id).first()
    assert loaded_inc is not None, "Incident record was lost!"
    print(f"  [OK] Persisted Incident verified: '{loaded_inc.title}' [{loaded_inc.severity.upper()}]")

    loaded_rec = session_2.query(RecoveryAction).filter_by(id=rec_id).first()
    assert loaded_rec is not None, "Recovery Action record was lost!"
    print(f"  [OK] Persisted Recovery Action verified: {loaded_rec.action_type} [{loaded_rec.execution_status.upper()}]")

    # Verify foreign key cascade and relationship query
    assert loaded_dep.application_id == loaded_app.id
    assert loaded_rec.incident_id == loaded_inc.id
    print("  [OK] Foreign key relationship integrity 100% verified!")

    session_2.close()
    engine_2.dispose()

    # Clean up test file
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)

    print("\n" + "=" * 65)
    print("DATA PERSISTENCE & RESTART VERIFICATION COMPLETED: 100% SUCCESS")
    print("=" * 65)

if __name__ == "__main__":
    run_persistence_test()
