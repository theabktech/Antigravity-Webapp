package com.antigravity.mobile.nativeapp.data.remote

import android.util.Log
import com.antigravity.mobile.nativeapp.data.model.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.TimeUnit

sealed class BridgeEvent {
    data class ConnectionChanged(val status: ConnectionStatus, val message: String = "") : BridgeEvent()
    data class ChatTokenReceived(val messageId: String, val token: String) : BridgeEvent()
    data class ChatMessageFinished(val message: ChatMessage) : BridgeEvent()
    data class ToolApprovalRequested(val approval: ToolApproval) : BridgeEvent()
    data class ToolStatusUpdated(val approvalId: String, val approved: Boolean) : BridgeEvent()
    data class TerminalOutputReceived(val line: TerminalLine) : BridgeEvent()
    data class SubagentUpdated(val subagent: Subagent) : BridgeEvent()
    data class LatencyUpdated(val pingMs: Long) : BridgeEvent()
}

class WebSocketBridgeClient(
    private val coroutineScope: CoroutineScope
) {
    private val tag = "AGY_WebSocketBridge"
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .pingInterval(10, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    private var webSocket: WebSocket? = null
    private var currentHost: HostProfile? = null
    private var isSimulated: Boolean = false

    private val _connectionStatus = MutableStateFlow(ConnectionStatus.DISCONNECTED)
    val connectionStatus = _connectionStatus.asStateFlow()

    private val _events = MutableSharedFlow<BridgeEvent>(extraBufferCapacity = 64)
    val events = _events.asSharedFlow()

    fun connect(host: HostProfile) {
        disconnect()
        currentHost = host
        isSimulated = false
        _connectionStatus.value = ConnectionStatus.CONNECTING

        val request = try {
            Request.Builder()
                .url(host.url)
                .apply {
                    if (host.token.isNotEmpty()) {
                        addHeader("Authorization", "Bearer ${host.token}")
                    }
                }
                .build()
        } catch (e: Exception) {
            Log.e(tag, "Invalid URL: ${host.url}", e)
            startSimulationMode()
            return
        }

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(tag, "Connected to ${host.url}")
                _connectionStatus.value = ConnectionStatus.CONNECTED
                coroutineScope.launch {
                    _events.emit(BridgeEvent.ConnectionChanged(ConnectionStatus.CONNECTED))
                    _events.emit(BridgeEvent.TerminalOutputReceived(
                        TerminalLine("conn-1", "Connected to host: ${host.name} (${host.url})", "system")
                    ))
                }
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                parseIncomingMessage(text)
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                webSocket.close(1000, null)
                _connectionStatus.value = ConnectionStatus.DISCONNECTED
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.w(tag, "WebSocket connection failed: ${t.message}. Falling back to simulation mode.")
                startSimulationMode()
            }
        })
    }

    fun startSimulationMode() {
        disconnect()
        isSimulated = true
        _connectionStatus.value = ConnectionStatus.SIMULATED
        coroutineScope.launch {
            _events.emit(BridgeEvent.ConnectionChanged(ConnectionStatus.SIMULATED, "Running in Offline Simulator Mode"))
            _events.emit(BridgeEvent.TerminalOutputReceived(
                TerminalLine("sim-1", "[SIMULATOR] Operating in local offline simulation mode", "system")
            ))
        }
    }

    fun disconnect() {
        try {
            webSocket?.close(1000, "User disconnected")
        } catch (e: Exception) {
            Log.e(tag, "Error closing websocket", e)
        }
        webSocket = null
        _connectionStatus.value = ConnectionStatus.DISCONNECTED
    }

    fun sendUserMessage(content: String) {
        if (isSimulated || webSocket == null) {
            simulateAssistantResponse(content)
            return
        }

        val json = JSONObject().apply {
            put("type", "user_message")
            put("content", content)
            put("timestamp", System.currentTimeMillis())
        }
        webSocket?.send(json.toString())
    }

    fun sendToolDecision(approvalId: String, approved: Boolean) {
        if (isSimulated || webSocket == null) {
            coroutineScope.launch {
                _events.emit(BridgeEvent.ToolStatusUpdated(approvalId, approved))
                _events.emit(BridgeEvent.TerminalOutputReceived(
                    TerminalLine("dec-${System.currentTimeMillis()}", "Tool $approvalId ${if (approved) "APPROVED" else "REJECTED"} by user", "system")
                ))
            }
            return
        }

        val json = JSONObject().apply {
            put("type", "tool_decision")
            put("approvalId", approvalId)
            put("approved", approved)
        }
        webSocket?.send(json.toString())
    }

    fun sendTerminalCommand(command: String) {
        coroutineScope.launch {
            _events.emit(BridgeEvent.TerminalOutputReceived(
                TerminalLine("cmd-${System.currentTimeMillis()}", "$ $command", "stdin")
            ))
        }

        if (isSimulated || webSocket == null) {
            coroutineScope.launch {
                delay(300)
                val response = when {
                    command.startsWith("git status") -> "On branch main\nYour branch is up to date with 'origin/main'.\nnothing to commit, working tree clean"
                    command.startsWith("clear") -> ""
                    command.startsWith("ls") || command.startsWith("dir") -> "app/\nbuild.gradle.kts\nsettings.gradle.kts\ngradle.properties\ngradlew.bat"
                    command.startsWith("./gradlew") -> "> Task :app:compileDebugKotlin\n> Task :app:assembleDebug\nBUILD SUCCESSFUL in 2.1s"
                    else -> "Command executed: $command (exit code 0)"
                }
                if (response.isNotEmpty()) {
                    _events.emit(BridgeEvent.TerminalOutputReceived(
                        TerminalLine("res-${System.currentTimeMillis()}", response, "stdout")
                    ))
                }
            }
            return
        }

        val json = JSONObject().apply {
            put("type", "terminal_command")
            put("command", command)
        }
        webSocket?.send(json.toString())
    }

    fun sendKillSubagent(subagentId: String) {
        if (isSimulated || webSocket == null) {
            coroutineScope.launch {
                _events.emit(BridgeEvent.TerminalOutputReceived(
                    TerminalLine("kill-${System.currentTimeMillis()}", "Sent SIGTERM to subagent $subagentId", "stderr")
                ))
            }
            return
        }

        val json = JSONObject().apply {
            put("type", "kill_subagent")
            put("subagentId", subagentId)
        }
        webSocket?.send(json.toString())
    }

    private fun parseIncomingMessage(text: String) {
        try {
            val json = JSONObject(text)
            when (json.optString("type")) {
                "token" -> {
                    val msgId = json.optString("messageId")
                    val token = json.optString("token")
                    coroutineScope.launch {
                        _events.emit(BridgeEvent.ChatTokenReceived(msgId, token))
                    }
                }
                "terminal_line" -> {
                    val line = TerminalLine(
                        id = json.optString("id", System.currentTimeMillis().toString()),
                        text = json.optString("text"),
                        type = json.optString("stream", "stdout")
                    )
                    coroutineScope.launch {
                        _events.emit(BridgeEvent.TerminalOutputReceived(line))
                    }
                }
                "tool_approval" -> {
                    val approval = ToolApproval(
                        id = json.optString("id"),
                        toolName = json.optString("toolName"),
                        summary = json.optString("summary"),
                        command = json.optString("command").ifEmpty { null },
                        targetFile = json.optString("targetFile").ifEmpty { null },
                        diffContent = json.optString("diff").ifEmpty { null },
                        riskLevel = json.optString("risk", "medium")
                    )
                    coroutineScope.launch {
                        _events.emit(BridgeEvent.ToolApprovalRequested(approval))
                    }
                }
                "subagent_update" -> {
                    val sub = Subagent(
                        id = json.optString("id"),
                        name = json.optString("name"),
                        role = json.optString("role"),
                        status = json.optString("status", "running"),
                        progress = json.optDouble("progress", 0.5).toFloat(),
                        currentTask = json.optString("currentTask"),
                        toolsUsed = json.optInt("toolsUsed", 0)
                    )
                    coroutineScope.launch {
                        _events.emit(BridgeEvent.SubagentUpdated(sub))
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(tag, "Error parsing incoming packet: $text", e)
        }
    }

    private fun simulateAssistantResponse(userPrompt: String) {
        coroutineScope.launch {
            val msgId = "msg-${System.currentTimeMillis()}"
            val responseText = when {
                userPrompt.startsWith("/goal") -> "Goal objective locked. Spawning dedicated autonomous execution subagents with continuous verification loops."
                userPrompt.startsWith("/grill-me") -> "Starting design review interview.\n\n**Question 1**: Would you like to use CameraX ML Kit or a hardware Zebra scanner for physical device deployments?"
                userPrompt.startsWith("/schedule") -> "Cron schedule created for periodic workspace health check."
                userPrompt.startsWith("/browser") -> "Automated headless browser session initialized."
                else -> "Received instruction: **\"$userPrompt\"**.\n\nExecuting actions natively in Kotlin with direct Android OS hardware access and zero WebView overhead."
            }

            // Stream response word by word
            val words = responseText.split(" ")
            var accumulated = ""
            for (word in words) {
                delay(40)
                accumulated += (if (accumulated.isEmpty()) "" else " ") + word
                _events.emit(BridgeEvent.ChatTokenReceived(msgId, accumulated))
            }

            val finalMessage = ChatMessage(
                id = msgId,
                role = "assistant",
                content = responseText,
                thinking = "1. Parsed user instruction\n2. Checked permissions and execution policy\n3. Dispatched Native Coroutine response",
                isThinkingExpanded = false,
                isStreaming = false
            )
            _events.emit(BridgeEvent.ChatMessageFinished(finalMessage))
        }
    }
}
