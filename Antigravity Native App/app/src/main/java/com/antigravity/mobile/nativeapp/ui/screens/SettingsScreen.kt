package com.antigravity.mobile.nativeapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antigravity.mobile.nativeapp.data.model.ExecutionPolicy
import com.antigravity.mobile.nativeapp.data.model.HostProfile
import com.antigravity.mobile.nativeapp.ui.theme.*

@Composable
fun SettingsScreen(
    hosts: List<HostProfile>,
    selectedHost: HostProfile?,
    executionPolicy: ExecutionPolicy,
    hapticsEnabled: Boolean,
    onSelectHost: (HostProfile) -> Unit,
    onAddHost: (String, String, String) -> Unit,
    onSetExecutionPolicy: (ExecutionPolicy) -> Unit,
    onToggleHaptics: (Boolean) -> Unit,
    onClose: () -> Unit
) {
    var showAddHostDialog by remember { mutableStateOf(false) }
    var newHostName by remember { mutableStateOf("") }
    var newHostUrl by remember { mutableStateOf("") }
    var newHostToken by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .statusBarsPadding()
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "SETTINGS & CONNECTION",
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Black,
                    fontSize = 16.sp,
                    letterSpacing = 1.sp
                ),
                color = TextPrimary
            )

            IconButton(
                onClick = onClose,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(SurfaceCard)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = TextSecondary
                )
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            // Execution Policy Section
            item {
                Text(
                    text = "TOOL EXECUTION POLICY",
                    style = MaterialTheme.typography.bodySmall.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    ),
                    color = TextMuted,
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(SurfaceDark)
                        .border(1.dp, BorderDark, RoundedCornerShape(12.dp))
                        .padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    ExecutionPolicy.entries.forEach { policy ->
                        val isSelected = policy == executionPolicy
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) PrimaryPurple.copy(alpha = 0.2f) else Color.Transparent)
                                .clickable { onSetExecutionPolicy(policy) }
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            RadioButton(
                                selected = isSelected,
                                onClick = { onSetExecutionPolicy(policy) },
                                colors = RadioButtonDefaults.colors(selectedColor = PrimaryPurple)
                            )
                            Column {
                                Text(
                                    text = policy.label,
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                    color = if (isSelected) PrimaryPurple else TextPrimary
                                )
                                Text(
                                    text = policy.description,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextSecondary
                                )
                            }
                        }
                    }
                }
            }

            // Host Profiles Section
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp, bottom = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "HOST CONNECTIONS",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        ),
                        color = TextMuted
                    )

                    TextButton(
                        onClick = { showAddHostDialog = true },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 0.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = AccentCyan
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "Add Host", fontSize = 12.sp, color = AccentCyan)
                    }
                }
            }

            items(hosts) { host ->
                val isCurrent = host.id == selectedHost?.id
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(SurfaceDark)
                        .border(1.dp, if (isCurrent) PrimaryPurple else BorderDark, RoundedCornerShape(10.dp))
                        .clickable { onSelectHost(host) }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = host.name,
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Text(
                            text = host.url,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 11.sp
                            ),
                            color = TextSecondary
                        )
                    }

                    if (isCurrent) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(PrimaryPurple)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "ACTIVE",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 9.sp
                                ),
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // Haptics Toggle
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(SurfaceDark)
                        .border(1.dp, BorderDark, RoundedCornerShape(10.dp))
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Haptic Vibrations",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                            color = TextPrimary
                        )
                        Text(
                            text = "Tactile feedback for approvals and keystrokes",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }

                    Switch(
                        checked = hapticsEnabled,
                        onCheckedChange = onToggleHaptics,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = PrimaryPurple
                        )
                    )
                }
            }

            // Native Architecture Information
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, BorderDark, RoundedCornerShape(10.dp)),
                    colors = CardDefaults.cardColors(containerColor = SurfaceCard),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "⚡ Pure Native Engine (Jetpack Compose)",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                            color = PrimaryPurple
                        )
                        Text(
                            text = "Compiled to Android ART bytecode with zero WebView latency, direct coroutine streaming, and hardware CameraX vision acceleration.",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary
                        )
                    }
                }
            }
        }
    }

    if (showAddHostDialog) {
        AlertDialog(
            onDismissRequest = { showAddHostDialog = false },
            title = { Text(text = "Add Custom Host", color = TextPrimary) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    TextField(
                        value = newHostName,
                        onValueChange = { newHostName = it },
                        placeholder = { Text("Host Name (e.g. Work PC)") }
                    )
                    TextField(
                        value = newHostUrl,
                        onValueChange = { newHostUrl = it },
                        placeholder = { Text("ws://192.168.1.x:4200") }
                    )
                    TextField(
                        value = newHostToken,
                        onValueChange = { newHostToken = it },
                        placeholder = { Text("Security Token (Optional)") }
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newHostUrl.isNotBlank()) {
                            onAddHost(
                                newHostName.ifEmpty { "Custom Host" },
                                newHostUrl.trim(),
                                newHostToken.trim()
                            )
                            showAddHostDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryPurple)
                ) {
                    Text(text = "Connect & Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddHostDialog = false }) {
                    Text(text = "Cancel", color = TextMuted)
                }
            },
            containerColor = SurfaceDark
        )
    }
}
