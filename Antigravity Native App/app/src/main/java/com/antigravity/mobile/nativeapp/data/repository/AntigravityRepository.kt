package com.antigravity.mobile.nativeapp.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.antigravity.mobile.nativeapp.data.model.*
import com.antigravity.mobile.nativeapp.data.remote.BridgeEvent
import com.antigravity.mobile.nativeapp.data.remote.MockDataProvider
import com.antigravity.mobile.nativeapp.data.remote.WebSocketBridgeClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class AntigravityRepository(
    private val context: Context,
    private val coroutineScope: CoroutineScope
) {
    private val prefs: SharedPreferences = context.getSharedPreferences("antigravity_prefs", Context.MODE_PRIVATE)
    val bridge = WebSocketBridgeClient(coroutineScope)

    val connectionStatus: StateFlow<ConnectionStatus> = bridge.connectionStatus
    val bridgeEvents: SharedFlow<BridgeEvent> = bridge.events

    private val _savedRemoteUrl = MutableStateFlow<String?>(prefs.getString("agy_live_remote_url", null))
    val savedRemoteUrl = _savedRemoteUrl.asStateFlow()

    private val _activeRemoteUrl = MutableStateFlow<String?>(prefs.getString("agy_live_remote_url", null))
    val activeRemoteUrl = _activeRemoteUrl.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(MockDataProvider.initialMessages())
    val messages = _messages.asStateFlow()

    private val _approvals = MutableStateFlow<List<ToolApproval>>(MockDataProvider.initialApprovals())
    val approvals = _approvals.asStateFlow()

    private val _subagents = MutableStateFlow<List<Subagent>>(MockDataProvider.initialSubagents())
    val subagents = _subagents.asStateFlow()

    private val _crons = MutableStateFlow<List<CronTask>>(MockDataProvider.initialCrons())
    val crons = _crons.asStateFlow()

    private val _terminalLines = MutableStateFlow<List<TerminalLine>>(MockDataProvider.initialTerminalLines())
    val terminalLines = _terminalLines.asStateFlow()

    private val _artifacts = MutableStateFlow<List<ArtifactDoc>>(MockDataProvider.initialArtifacts())
    val artifacts = _artifacts.asStateFlow()

    private val _hosts = MutableStateFlow<List<HostProfile>>(MockDataProvider.defaultHosts())
    val hosts = _hosts.asStateFlow()

    private val _selectedHost = MutableStateFlow<HostProfile?>(MockDataProvider.defaultHosts().firstOrNull())
    val selectedHost = _selectedHost.asStateFlow()

    private val _executionPolicy = MutableStateFlow(ExecutionPolicy.REQUEST_REVIEW)
    val executionPolicy = _executionPolicy.asStateFlow()

    private val _hapticsEnabled = MutableStateFlow(true)
    val hapticsEnabled = _hapticsEnabled.asStateFlow()

    init {
        coroutineScope.launch {
            bridge.events.collect { event ->
                when (event) {
                    is BridgeEvent.ChatTokenReceived -> {
                        val current = _messages.value.toMutableList()
                        val index = current.indexOfFirst { it.id == event.messageId }
                        if (index >= 0) {
                            val msg = current[index]
                            current[index] = msg.copy(content = event.token, isStreaming = true)
                            _messages.value = current
                        } else {
                            current.add(
                                ChatMessage(
                                    id = event.messageId,
                                    role = "assistant",
                                    content = event.token,
                                    isStreaming = true
                                )
                            )
                            _messages.value = current
                        }
                    }
                    is BridgeEvent.ChatMessageFinished -> {
                        val current = _messages.value.toMutableList()
                        val index = current.indexOfFirst { it.id == event.message.id }
                        if (index >= 0) {
                            current[index] = event.message
                        } else {
                            current.add(event.message)
                        }
                        _messages.value = current
                    }
                    is BridgeEvent.ToolApprovalRequested -> {
                        val current = _approvals.value.toMutableList()
                        current.add(0, event.approval)
                        _approvals.value = current
                    }
                    is BridgeEvent.ToolStatusUpdated -> {
                        val current = _approvals.value.toMutableList()
                        val index = current.indexOfFirst { it.id == event.approvalId }
                        if (index >= 0) {
                            current[index] = current[index].copy(isProcessed = true, approved = event.approved)
                            _approvals.value = current
                        }
                    }
                    is BridgeEvent.TerminalOutputReceived -> {
                        val current = _terminalLines.value.toMutableList()
                        current.add(event.line)
                        if (current.size > 200) current.removeAt(0)
                        _terminalLines.value = current
                    }
                    is BridgeEvent.SubagentUpdated -> {
                        val current = _subagents.value.toMutableList()
                        val index = current.indexOfFirst { it.id == event.subagent.id }
                        if (index >= 0) {
                            current[index] = event.subagent
                        } else {
                            current.add(event.subagent)
                        }
                        _subagents.value = current
                    }
                    else -> Unit
                }
            }
        }

        val initialUrl = _savedRemoteUrl.value
        if (!initialUrl.isNullOrEmpty()) {
            connectToRemoteUrl(initialUrl)
        } else {
            bridge.startSimulationMode()
        }
    }

    fun connectToRemoteUrl(url: String) {
        prefs.edit().putString("agy_live_remote_url", url).apply()
        _savedRemoteUrl.value = url
        _activeRemoteUrl.value = url

        val wsUrl = when {
            url.startsWith("https://") -> url.replace("https://", "wss://")
            url.startsWith("http://") -> url.replace("http://", "ws://")
            url.startsWith("ws://") || url.startsWith("wss://") -> url
            else -> "ws://$url"
        }

        val hostName = if (url.contains("://")) {
            url.substringAfter("://").substringBefore("/").substringBefore(":")
        } else {
            url
        }

        val hostProfile = HostProfile(
            id = "host-remote",
            name = hostName,
            url = wsUrl,
            token = "",
            isDefault = true,
            lastConnected = System.currentTimeMillis()
        )
        _selectedHost.value = hostProfile
        bridge.connect(hostProfile)
    }

    fun clearSavedRemoteUrl() {
        prefs.edit().remove("agy_live_remote_url").apply()
        _savedRemoteUrl.value = null
        _activeRemoteUrl.value = null
        bridge.startSimulationMode()
    }

    fun exitRemoteWorkspace() {
        _activeRemoteUrl.value = null
    }

    fun sendMessage(text: String) {
        val userMsg = ChatMessage(
            id = "msg-${System.currentTimeMillis()}",
            role = "user",
            content = text
        )
        val current = _messages.value.toMutableList()
        current.add(userMsg)
        _messages.value = current

        bridge.sendUserMessage(text)
    }

    fun processApproval(approvalId: String, approved: Boolean) {
        val current = _approvals.value.toMutableList()
        val index = current.indexOfFirst { it.id == approvalId }
        if (index >= 0) {
            current[index] = current[index].copy(isProcessed = true, approved = approved)
            _approvals.value = current
        }
        bridge.sendToolDecision(approvalId, approved)
    }

    fun sendTerminalCommand(command: String) {
        if (command == "clear") {
            _terminalLines.value = emptyList()
        } else {
            bridge.sendTerminalCommand(command)
        }
    }

    fun killSubagent(subagentId: String) {
        val current = _subagents.value.toMutableList()
        val index = current.indexOfFirst { it.id == subagentId }
        if (index >= 0) {
            current[index] = current[index].copy(status = "failed", currentTask = "Terminated by operator")
            _subagents.value = current
        }
        bridge.sendKillSubagent(subagentId)
    }

    fun setExecutionPolicy(policy: ExecutionPolicy) {
        _executionPolicy.value = policy
    }

    fun setHapticsEnabled(enabled: Boolean) {
        _hapticsEnabled.value = enabled
    }

    fun connectToHost(host: HostProfile) {
        _selectedHost.value = host
        bridge.connect(host)
    }

    fun addHost(name: String, url: String, token: String) {
        val newHost = HostProfile(
            id = "host-${System.currentTimeMillis()}",
            name = name,
            url = url,
            token = token,
            isDefault = false,
            lastConnected = System.currentTimeMillis()
        )
        val list = _hosts.value.toMutableList()
        list.add(newHost)
        _hosts.value = list
        connectToHost(newHost)
    }
}
