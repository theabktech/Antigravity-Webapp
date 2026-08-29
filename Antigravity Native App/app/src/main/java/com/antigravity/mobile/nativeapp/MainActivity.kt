package com.antigravity.mobile.nativeapp

import android.Manifest
import android.content.Intent
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.antigravity.mobile.nativeapp.ui.components.*
import com.antigravity.mobile.nativeapp.ui.screens.*
import com.antigravity.mobile.nativeapp.ui.theme.AntigravityNativeTheme
import com.antigravity.mobile.nativeapp.ui.theme.BgDark
import com.antigravity.mobile.nativeapp.viewmodel.MainViewModel
import java.util.Locale

class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AntigravityNativeTheme {
                val savedRemoteUrl by viewModel.savedRemoteUrl.collectAsStateWithLifecycle()
                val activeRemoteUrl by viewModel.activeRemoteUrl.collectAsStateWithLifecycle()
                val connectionStatus by viewModel.connectionStatus.collectAsStateWithLifecycle()
                val selectedHost by viewModel.selectedHost.collectAsStateWithLifecycle()
                val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
                val messages by viewModel.messages.collectAsStateWithLifecycle()
                val approvals by viewModel.approvals.collectAsStateWithLifecycle()
                val subagents by viewModel.subagents.collectAsStateWithLifecycle()
                val crons by viewModel.crons.collectAsStateWithLifecycle()
                val terminalLines by viewModel.terminalLines.collectAsStateWithLifecycle()
                val artifacts by viewModel.artifacts.collectAsStateWithLifecycle()
                val hosts by viewModel.hosts.collectAsStateWithLifecycle()
                val executionPolicy by viewModel.executionPolicy.collectAsStateWithLifecycle()
                val hapticsEnabled by viewModel.hapticsEnabled.collectAsStateWithLifecycle()
                val showQrScanner by viewModel.showQrScanner.collectAsStateWithLifecycle()
                val showSettings by viewModel.showSettings.collectAsStateWithLifecycle()

                // Permission Launcher for Camera QR Scanner
                val cameraPermissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission()
                ) { isGranted ->
                    if (isGranted) {
                        viewModel.openQrScanner()
                    }
                }

                // Speech Recognizer Launcher for Voice Dictation
                val voiceLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.StartActivityForResult()
                ) { result ->
                    if (result.resultCode == RESULT_OK) {
                        val spokenText = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
                        if (!spokenText.isNullOrBlank()) {
                            viewModel.sendMessage(spokenText)
                        }
                    }
                }

                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(BgDark)
                ) {
                    if (activeRemoteUrl != null) {
                        // 100% Native Antigravity Companion UI
                        Scaffold(
                            modifier = Modifier.fillMaxSize(),
                            containerColor = BgDark,
                            topBar = {
                                TopHeaderBar(
                                    connectionStatus = connectionStatus,
                                    hostName = selectedHost?.name ?: "Workspace",
                                    modelName = "3.7 Flash",
                                    onDisconnect = { viewModel.exitRemoteWorkspace() },
                                    onQrClick = {
                                        cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                                    },
                                    onSettingsClick = { viewModel.openSettings() }
                                )
                            },
                            bottomBar = {
                                BottomNavigationBar(
                                    currentTab = currentTab,
                                    pendingApprovalCount = approvals.count { !it.isProcessed },
                                    onTabSelected = { viewModel.selectTab(it) }
                                )
                            }
                        ) { innerPadding ->
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(innerPadding)
                            ) {
                                when (currentTab) {
                                    NavigationTab.CHAT -> ChatScreen(
                                        messages = messages,
                                        onSendMessage = { viewModel.sendMessage(it) },
                                        onVoiceClick = {
                                            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                                                putExtra(
                                                    RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                                                    RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                                                )
                                                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                                                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak to Antigravity...")
                                            }
                                            try {
                                                voiceLauncher.launch(intent)
                                            } catch (e: Exception) {
                                                // Handle speech recognition not supported
                                            }
                                        }
                                    )
                                    NavigationTab.APPROVALS -> ApprovalScreen(
                                        approvals = approvals,
                                        onApprove = { viewModel.approveTool(it) },
                                        onReject = { viewModel.rejectTool(it) }
                                    )
                                    NavigationTab.TERMINAL -> TerminalScreen(
                                        terminalLines = terminalLines,
                                        onSendCommand = { viewModel.sendTerminalCommand(it) }
                                    )
                                    NavigationTab.SUBAGENTS -> SubagentsScreen(
                                        subagents = subagents,
                                        crons = crons,
                                        onKillSubagent = { viewModel.killSubagent(it) }
                                    )
                                    NavigationTab.ARTIFACTS -> ArtifactsScreen(
                                        artifacts = artifacts
                                    )
                                }
                            }
                        }
                    } else {
                        // Antigravity Setup Hub Screen
                        SetupHubScreen(
                            savedUrl = savedRemoteUrl,
                            onConnect = { url -> viewModel.connectToRemoteUrl(url) },
                            onClearSaved = { viewModel.clearSavedRemoteUrl() },
                            onOpenQr = {
                                cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                            }
                        )
                    }

                    // QR Code Camera Scanner Modal
                    if (showQrScanner) {
                        QRScanScreen(
                            onCodeScanned = { viewModel.onQrScanned(it) },
                            onClose = { viewModel.closeQrScanner() }
                        )
                    }

                    // Settings Screen Modal
                    if (showSettings) {
                        SettingsScreen(
                            hosts = hosts,
                            selectedHost = selectedHost,
                            executionPolicy = executionPolicy,
                            hapticsEnabled = hapticsEnabled,
                            onSelectHost = { viewModel.selectHost(it) },
                            onAddHost = { name, url, token -> viewModel.addHost(name, url, token) },
                            onSetExecutionPolicy = { viewModel.setExecutionPolicy(it) },
                            onToggleHaptics = { viewModel.toggleHaptics(it) },
                            onClose = { viewModel.closeSettings() }
                        )
                    }
                }
            }
        }
    }
}
