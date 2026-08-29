package com.antigravity.mobile.nativeapp.viewmodel

import android.app.Application
import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.antigravity.mobile.nativeapp.data.model.*
import com.antigravity.mobile.nativeapp.data.repository.AntigravityRepository
import com.antigravity.mobile.nativeapp.ui.components.NavigationTab
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import org.json.JSONObject

class MainViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = AntigravityRepository(application.applicationContext, viewModelScope)

    val connectionStatus: StateFlow<ConnectionStatus> = repository.connectionStatus
    val savedRemoteUrl: StateFlow<String?> = repository.savedRemoteUrl
    val activeRemoteUrl: StateFlow<String?> = repository.activeRemoteUrl

    val messages: StateFlow<List<ChatMessage>> = repository.messages
    val approvals: StateFlow<List<ToolApproval>> = repository.approvals
    val subagents: StateFlow<List<Subagent>> = repository.subagents
    val crons: StateFlow<List<CronTask>> = repository.crons
    val terminalLines: StateFlow<List<TerminalLine>> = repository.terminalLines
    val artifacts: StateFlow<List<ArtifactDoc>> = repository.artifacts
    val hosts: StateFlow<List<HostProfile>> = repository.hosts
    val selectedHost: StateFlow<HostProfile?> = repository.selectedHost
    val executionPolicy: StateFlow<ExecutionPolicy> = repository.executionPolicy
    val hapticsEnabled: StateFlow<Boolean> = repository.hapticsEnabled

    private val _currentTab = MutableStateFlow(NavigationTab.CHAT)
    val currentTab = _currentTab.asStateFlow()

    private val _showQrScanner = MutableStateFlow(false)
    val showQrScanner = _showQrScanner.asStateFlow()

    private val _showSettings = MutableStateFlow(false)
    val showSettings = _showSettings.asStateFlow()

    fun connectToRemoteUrl(url: String) {
        repository.connectToRemoteUrl(url)
        triggerHaptic(HapticType.SUCCESS)
    }

    fun clearSavedRemoteUrl() {
        repository.clearSavedRemoteUrl()
        triggerHaptic(HapticType.LIGHT)
    }

    fun exitRemoteWorkspace() {
        repository.exitRemoteWorkspace()
        triggerHaptic(HapticType.LIGHT)
    }

    fun selectTab(tab: NavigationTab) {
        _currentTab.value = tab
        triggerHaptic(HapticType.LIGHT)
    }

    fun openQrScanner() {
        _showQrScanner.value = true
        triggerHaptic(HapticType.LIGHT)
    }

    fun closeQrScanner() {
        _showQrScanner.value = false
    }

    fun openSettings() {
        _showSettings.value = true
        triggerHaptic(HapticType.LIGHT)
    }

    fun closeSettings() {
        _showSettings.value = false
    }

    fun sendMessage(text: String) {
        repository.sendMessage(text)
        triggerHaptic(HapticType.LIGHT)
    }

    fun approveTool(approvalId: String) {
        repository.processApproval(approvalId, true)
        triggerHaptic(HapticType.SUCCESS)
    }

    fun rejectTool(approvalId: String) {
        repository.processApproval(approvalId, false)
        triggerHaptic(HapticType.REJECT)
    }

    fun sendTerminalCommand(command: String) {
        repository.sendTerminalCommand(command)
        triggerHaptic(HapticType.KEYPRESS)
    }

    fun killSubagent(subagentId: String) {
        repository.killSubagent(subagentId)
        triggerHaptic(HapticType.WARNING)
    }

    fun setExecutionPolicy(policy: ExecutionPolicy) {
        repository.setExecutionPolicy(policy)
        triggerHaptic(HapticType.SELECTION)
    }

    fun toggleHaptics(enabled: Boolean) {
        repository.setHapticsEnabled(enabled)
    }

    fun selectHost(host: HostProfile) {
        repository.connectToHost(host)
        triggerHaptic(HapticType.SUCCESS)
    }

    fun addHost(name: String, url: String, token: String) {
        repository.addHost(name, url, token)
        triggerHaptic(HapticType.SUCCESS)
    }

    fun onQrScanned(code: String) {
        _showQrScanner.value = false
        triggerHaptic(HapticType.SUCCESS)

        try {
            if (code.startsWith("http://") || code.startsWith("https://")) {
                connectToRemoteUrl(code.trim())
            } else if (code.startsWith("{")) {
                val json = JSONObject(code)
                val url = json.optString("url")
                val token = json.optString("token")
                val name = json.optString("name", "Desktop QR Host")
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    connectToRemoteUrl(url.trim())
                } else if (url.isNotEmpty()) {
                    repository.addHost(name, url, token)
                }
            } else if (code.startsWith("ws://") || code.startsWith("wss://")) {
                repository.addHost("Scanned Host", code.trim(), "")
            }
        } catch (e: Exception) {
            if (code.startsWith("http")) {
                connectToRemoteUrl(code.trim())
            }
        }
    }

    enum class HapticType {
        LIGHT, KEYPRESS, SELECTION, SUCCESS, REJECT, WARNING
    }

    private fun triggerHaptic(type: HapticType) {
        if (!repository.hapticsEnabled.value) return

        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val manager = getApplication<Application>().getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                manager.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                getApplication<Application>().getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val effect = when (type) {
                    HapticType.LIGHT -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)
                    HapticType.KEYPRESS -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
                    HapticType.SELECTION -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
                    HapticType.SUCCESS -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
                    HapticType.REJECT -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK)
                    HapticType.WARNING -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
                }
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(50)
            }
        } catch (e: Exception) {
            // Ignore
        }
    }
}
