"""Public Aeoth Agent Python SDK namespace.

The ``deepseek_harness`` namespace remains available as a compatibility import
for existing applications; new code should import from this module.
"""

from deepseek_harness import (
    AeothAgent,
    AeothAgentConfig,
    AeothAgentRunResult,
    AeothAgentSession,
    AeothClient,
    AeothRuntimeConfig,
    HarnessClient,
    HarnessConfig,
    IncomingRequest,
    InitializeResponse,
    JsonObject,
    Notification,
    RunResult,
    ServerInfo,
    SdkProtocolError,
    Session,
)

__all__ = [
    "AeothAgent",
    "AeothAgentConfig",
    "AeothAgentRunResult",
    "AeothAgentSession",
    "AeothClient",
    "AeothRuntimeConfig",
    "Session",
    "RunResult",
    "HarnessClient",
    "HarnessConfig",
    "SdkProtocolError",
    "IncomingRequest",
    "InitializeResponse",
    "JsonObject",
    "Notification",
    "ServerInfo",
]
