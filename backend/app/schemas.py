from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field


# User & Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str


class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "DevOps Engineer"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Application Schemas
class ApplicationBase(BaseModel):
    name: str
    key: str
    description: Optional[str] = None
    environment: str = "Production"
    cluster_region: str = "us-east-1 (N. Virginia)"
    replica_count: int = 3
    cpu_limit: str = "2000m"
    memory_limit: str = "4096Mi"


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    environment: Optional[str] = None
    cluster_region: Optional[str] = None
    status: Optional[str] = None
    replica_count: Optional[int] = None
    cpu_limit: Optional[str] = None
    memory_limit: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Deployment Schemas
class DeploymentCreate(BaseModel):
    application_id: int
    version: str
    branch: Optional[str] = "main"
    triggered_by: Optional[str] = "Alex Vance (Lead SRE)"


class DeploymentResponse(BaseModel):
    id: int
    application_id: int
    version: str
    branch: str
    commit_hash: str
    status: str
    triggered_by: str
    execution_time_seconds: int
    logs: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Metric & Telemetry Schemas
class MetricLogResponse(BaseModel):
    id: int
    application_id: Optional[int] = None
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    latency_ms: float
    error_rate: float
    active_connections: int
    log_level: str
    message: Optional[str] = None

    class Config:
        from_attributes = True


class TelemetrySummary(BaseModel):
    cpu_average: float
    memory_average: float
    latency_p95: float
    error_rate: float
    uptime_percentage: float
    time_series: List[Dict[str, Any]]


# Incident Schemas
class IncidentCreate(BaseModel):
    application_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: str = "P2-High"


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    root_cause: Optional[str] = None


class IncidentResponse(BaseModel):
    id: int
    application_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    root_cause: Optional[str] = None
    detected_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Recovery Schemas
class RecoveryTrigger(BaseModel):
    incident_id: Optional[int] = None
    application_id: Optional[int] = None
    playbook_name: str
    trigger_type: str = "MANUAL"


class RecoveryResponse(BaseModel):
    id: int
    incident_id: Optional[int] = None
    application_id: Optional[int] = None
    playbook_name: str
    trigger_type: str
    status: str
    details: Optional[str] = None
    executed_at: datetime

    class Config:
        from_attributes = True


# Dashboard Schemas
class HexNode(BaseModel):
    id: str
    name: str
    region: str
    status: str  # healthy, warning, critical
    cpu_load: float
    ram_load: float
    pods_running: int
    uptime: str


class DashboardKPIs(BaseModel):
    total_applications: int
    healthy_services: int
    active_incidents: int
    running_deployments: int
    avg_cpu_utilization: float
    avg_memory_utilization: float
    resource_allocation_percent: float
    global_system_health: str
    cluster_nodes: List[HexNode]
