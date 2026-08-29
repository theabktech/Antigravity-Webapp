package com.antigravity.mobile.nativeapp.data.model

import kotlinx.serialization.Serializable

enum class ConnectionStatus {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    SIMULATED
}

enum class ExecutionPolicy(val label: String, val description: String) {
    REQUEST_REVIEW("Request Review", "Ask for confirmation before running sensitive tools"),
    STRICT("Strict Security", "Block all file deletion, shell execution & destructive actions"),
    ALWAYS_PROCEED("Always Proceed", "Execute tools autonomously without waiting for approvals"),
    SANDBOX("Isolated Sandbox", "Execute actions strictly inside virtual container sandbox")
}

@Serializable
data class HostProfile(
    val id: String,
    val name: String,
    val url: String,
    val token: String = "",
    val isDefault: Boolean = false,
    val lastConnected: Long = 0L
)

@Serializable
data class ToolCallInfo(
    val id: String,
    val toolName: String,
    val summary: String = "",
    val details: String = "",
    val status: String = "completed" // pending, running, approved, rejected, completed, error
)

@Serializable
data class ChatMessage(
    val id: String,
    val role: String, // "user", "assistant", "system"
    val content: String,
    val timestamp: Long = System.currentTimeMillis(),
    val thinking: String? = null,
    val isThinkingExpanded: Boolean = false,
    val isStreaming: Boolean = false,
    val toolCalls: List<ToolCallInfo> = emptyList()
)

@Serializable
data class ToolApproval(
    val id: String,
    val toolName: String,
    val summary: String,
    val command: String? = null,
    val targetFile: String? = null,
    val diffContent: String? = null,
    val riskLevel: String = "medium", // low, medium, high, critical
    val timestamp: Long = System.currentTimeMillis(),
    val isProcessed: Boolean = false,
    val approved: Boolean = false
)

@Serializable
data class Subagent(
    val id: String,
    val name: String,
    val role: String,
    val status: String = "running", // running, idle, completed, failed
    val progress: Float = 0.5f,
    val currentTask: String = "",
    val toolsUsed: Int = 3
)

@Serializable
data class TerminalLine(
    val id: String,
    val text: String,
    val type: String = "stdout" // stdout, stderr, stdin, system
)

@Serializable
data class ArtifactDoc(
    val id: String,
    val title: String,
    val filename: String,
    val content: String,
    val category: String = "spec" // spec, plan, code, report
)

@Serializable
data class CronTask(
    val id: String,
    val name: String,
    val expression: String,
    val nextRun: String,
    val active: Boolean = true
)
