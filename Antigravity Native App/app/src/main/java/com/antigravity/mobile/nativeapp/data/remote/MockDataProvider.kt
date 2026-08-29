package com.antigravity.mobile.nativeapp.data.remote

import com.antigravity.mobile.nativeapp.data.model.*

object MockDataProvider {
    fun initialMessages(): List<ChatMessage> = listOf(
        ChatMessage(
            id = "msg-1",
            role = "user",
            content = "Analyze our backend architecture and implement the new Subagent Mesh dispatcher.",
            timestamp = System.currentTimeMillis() - 120000
        ),
        ChatMessage(
            id = "msg-2",
            role = "assistant",
            thinking = "I need to inspect the current WebSocket bridge, verify subagent lifecycles, and check if any pending tool approvals require elevated permissions.\n1. Inspecting repository structure\n2. Generating Native Jetpack Compose architecture\n3. Establishing WebSocket streaming contract",
            isThinkingExpanded = true,
            content = "I have analyzed the workspace and structured the **100% Native Jetpack Compose** companion architecture.\n\nKey highlights:\n- ⚡ **Zero-Latency UI**: Rendered with Compose hardware acceleration\n- 📱 **CameraX QR Pairing**: Instant desktop connection handshake\n- 🛡️ **Action & Approval Center**: 1-tap granular permission control\n- 💻 **Monospace Touch Terminal**: Dedicated mobile developer keyboard keys",
            timestamp = System.currentTimeMillis() - 90000,
            toolCalls = listOf(
                ToolCallInfo(
                    id = "tool-1",
                    toolName = "list_dir",
                    summary = "Scanned workspace directories",
                    details = "Discovered 4 subdirectories and 17 files",
                    status = "completed"
                ),
                ToolCallInfo(
                    id = "tool-2",
                    toolName = "write_to_file",
                    summary = "Generated native Android configuration",
                    details = "Created app/build.gradle.kts and AndroidManifest.xml",
                    status = "completed"
                )
            )
        )
    )

    fun initialApprovals(): List<ToolApproval> = listOf(
        ToolApproval(
            id = "appr-1",
            toolName = "run_command",
            summary = "Execute Gradle APK Build in Release Mode",
            command = ".\\gradlew.bat assembleRelease --no-daemon --parallel",
            targetFile = "app/build.gradle.kts",
            riskLevel = "medium",
            timestamp = System.currentTimeMillis() - 30000
        ),
        ToolApproval(
            id = "appr-2",
            toolName = "replace_file_content",
            summary = "Deploy Production API Endpoint Configuration",
            targetFile = "src/config/network.ts",
            diffContent = "- const API_HOST = 'http://localhost:4200';\n+ const API_HOST = 'wss://gateway.antigravity.internal';",
            riskLevel = "high",
            timestamp = System.currentTimeMillis() - 15000
        )
    )

    fun initialSubagents(): List<Subagent> = listOf(
        Subagent(
            id = "sub-1",
            name = "Codebase Architect",
            role = "System Refactoring & Dependency Mapping",
            status = "running",
            progress = 0.78f,
            currentTask = "Optimizing Jetpack Compose recomposition scopes",
            toolsUsed = 7
        ),
        Subagent(
            id = "sub-2",
            name = "Security Auditor",
            role = "Tool Approval & Permission Enforcement",
            status = "idle",
            progress = 1.0f,
            currentTask = "Standing by for pending high-risk tool invocations",
            toolsUsed = 3
        ),
        Subagent(
            id = "sub-3",
            name = "Test Automation Runner",
            role = "End-to-End Build & Validation",
            status = "running",
            progress = 0.45f,
            currentTask = "Executing Gradle assembleDebug smoke tests",
            toolsUsed = 4
        )
    )

    fun initialCrons(): List<CronTask> = listOf(
        CronTask(
            id = "cron-1",
            name = "Heartbeat & Latency Telemetry",
            expression = "*/30 * * * * *",
            nextRun = "in 12 seconds",
            active = true
        ),
        CronTask(
            id = "cron-2",
            name = "Workspace Snapshot Backup",
            expression = "0 */15 * * * *",
            nextRun = "in 8 minutes",
            active = true
        ),
        CronTask(
            id = "cron-3",
            name = "Background Task Garbage Collection",
            expression = "0 0 * * * *",
            nextRun = "in 34 minutes",
            active = true
        )
    )

    fun initialTerminalLines(): List<TerminalLine> = listOf(
        TerminalLine("t-1", "[antigravity-bridge] Initialized WebSocket gateway on ws://0.0.0.0:4200", "system"),
        TerminalLine("t-2", "[auth] Client handshake authenticated via SHA-256 token", "system"),
        TerminalLine("t-3", "$ git status --short", "stdin"),
        TerminalLine("t-4", " M app/src/main/java/MainActivity.kt\n M app/build.gradle.kts\n?? res/drawable/ic_launcher.png", "stdout"),
        TerminalLine("t-5", "$ ./gradlew.bat compileDebugKotlin", "stdin"),
        TerminalLine("t-6", "> Task :app:compileDebugKotlin UP-TO-DATE\nBUILD SUCCESSFUL in 1.42s", "stdout")
    )

    fun initialArtifacts(): List<ArtifactDoc> = listOf(
        ArtifactDoc(
            id = "art-1",
            title = "Native Architecture Spec",
            filename = "architecture_spec.md",
            category = "spec",
            content = """
# Antigravity Native Engine Spec

### System Topology
- **UI Framework**: Android Jetpack Compose 1.7+ with Material Design 3
- **Reactive State**: Kotlin Coroutines `StateFlow` & `SharedFlow`
- **Network Engine**: OkHttp 4.12 WebSocket client with exponential backoff
- **Vision Subsystem**: Google ML Kit Barcode Analyzer + CameraX Preview

### Key Advantages over WebView
1. **0ms Frame Jitter**: Direct GPU buffer composition without browser DOM overhead.
2. **True Native Keyboards & Touch Handling**: Microsecond latency touch events.
3. **Deep Hardware Integration**: Direct vibrator actuator control for physical click haptics.
            """.trimIndent()
        ),
        ArtifactDoc(
            id = "art-2",
            title = "Subagent Mesh Protocol",
            filename = "subagent_mesh.md",
            category = "plan",
            content = """
# Subagent Mesh Protocol (SMP v2)

```mermaid
graph TD
    Parent[Antigravity Master Agent] --> Sub1[Codebase Architect]
    Parent --> Sub2[Security Auditor]
    Parent --> Sub3[Test Automation Runner]
    Sub1 --> Tool1[Gradle Build]
    Sub2 --> Tool2[Action Center Approval]
    Sub3 --> Tool3[Device Smoke Tests]
```

Every subagent communicates status, progress deltas, and tool intents over duplex JSON-RPC packets.
            """.trimIndent()
        )
    )

    fun defaultHosts(): List<HostProfile> = listOf(
        HostProfile(
            id = "host-1",
            name = "Local Desktop (Wi-Fi)",
            url = "ws://192.168.1.100:4200",
            token = "agy-sec-live-token",
            isDefault = true,
            lastConnected = System.currentTimeMillis()
        ),
        HostProfile(
            id = "host-2",
            name = "Tailscale / VPN Node",
            url = "ws://100.82.14.92:4200",
            token = "agy-sec-vpn-token",
            isDefault = false,
            lastConnected = 0L
        )
    )
}
