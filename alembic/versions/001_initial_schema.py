"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-01 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Applications Table
    op.create_table(
        "applications",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("repository_url", sa.String(length=255), nullable=True),
        sa.Column("environment", sa.String(length=50), nullable=False, server_default="production"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="healthy"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_applications_id"), "applications", ["id"], unique=False)
    op.create_index(op.f("ix_applications_name"), "applications", ["name"], unique=True)
    op.create_index(op.f("ix_applications_environment"), "applications", ["environment"], unique=False)
    op.create_index(op.f("ix_applications_status"), "applications", ["status"], unique=False)

    # 2. Deployments Table
    op.create_table(
        "deployments",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("version", sa.String(length=50), nullable=False),
        sa.Column("commit_hash", sa.String(length=40), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="pending"),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("deployment_environment", sa.String(length=50), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_deployments_id"), "deployments", ["id"], unique=False)
    op.create_index(op.f("ix_deployments_application_id"), "deployments", ["application_id"], unique=False)
    op.create_index(op.f("ix_deployments_version"), "deployments", ["version"], unique=False)
    op.create_index(op.f("ix_deployments_status"), "deployments", ["status"], unique=False)
    op.create_index(op.f("ix_deployments_environment"), "deployments", ["deployment_environment"], unique=False)

    # 3. Incidents Table
    op.create_table(
        "incidents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("severity", sa.String(length=50), nullable=False, server_default="medium"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_incidents_id"), "incidents", ["id"], unique=False)
    op.create_index(op.f("ix_incidents_application_id"), "incidents", ["application_id"], unique=False)
    op.create_index(op.f("ix_incidents_severity"), "incidents", ["severity"], unique=False)
    op.create_index(op.f("ix_incidents_status"), "incidents", ["status"], unique=False)
    op.create_index(op.f("ix_incidents_created_at"), "incidents", ["created_at"], unique=False)

    # 4. Recovery Actions Table
    op.create_table(
        "recovery_actions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("incident_id", sa.String(length=36), nullable=True),
        sa.Column("action_type", sa.String(length=100), nullable=False),
        sa.Column("execution_status", sa.String(length=50), nullable=False, server_default="simulated"),
        sa.Column("execution_details", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["incident_id"], ["incidents.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_recovery_actions_id"), "recovery_actions", ["id"], unique=False)
    op.create_index(op.f("ix_recovery_actions_application_id"), "recovery_actions", ["application_id"], unique=False)
    op.create_index(op.f("ix_recovery_actions_incident_id"), "recovery_actions", ["incident_id"], unique=False)
    op.create_index(op.f("ix_recovery_actions_action_type"), "recovery_actions", ["action_type"], unique=False)
    op.create_index(op.f("ix_recovery_actions_execution_status"), "recovery_actions", ["execution_status"], unique=False)
    op.create_index(op.f("ix_recovery_actions_created_at"), "recovery_actions", ["created_at"], unique=False)

    # 5. Monitoring Metrics Table
    op.create_table(
        "monitoring_metrics",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("application_id", sa.String(length=36), nullable=False),
        sa.Column("metric_name", sa.String(length=100), nullable=False),
        sa.Column("metric_value", sa.Float(), nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("source", sa.String(length=100), nullable=False, server_default="cloudops-agent"),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_monitoring_metrics_id"), "monitoring_metrics", ["id"], unique=False)
    op.create_index(op.f("ix_monitoring_metrics_application_id"), "monitoring_metrics", ["application_id"], unique=False)
    op.create_index(op.f("ix_monitoring_metrics_metric_name"), "monitoring_metrics", ["metric_name"], unique=False)
    op.create_index(op.f("ix_monitoring_metrics_recorded_at"), "monitoring_metrics", ["recorded_at"], unique=False)
    op.create_index(
        "ix_metrics_app_name_time",
        "monitoring_metrics",
        ["application_id", "metric_name", "recorded_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_table("monitoring_metrics")
    op.drop_table("recovery_actions")
    op.drop_table("incidents")
    op.drop_table("deployments")
    op.drop_table("applications")

