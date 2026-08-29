package com.antigravity.mobile.nativeapp.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antigravity.mobile.nativeapp.data.model.ConnectionStatus
import com.antigravity.mobile.nativeapp.ui.theme.*

@Composable
fun TopHeaderBar(
    connectionStatus: ConnectionStatus,
    hostName: String,
    latencyMs: Int = 18,
    modelName: String = "3.7 Flash",
    onDisconnect: () -> Unit,
    onQrClick: () -> Unit,
    onSettingsClick: () -> Unit
) {
    val gradientBrush = Brush.linearGradient(
        colors = listOf(PrimaryPurple, AccentCyan)
    )

    Surface(
        color = SurfaceDark.copy(alpha = 0.95f),
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .border(0.5.dp, BorderDark)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Left: Brand & Connection Status
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(14.dp))
                    .background(SurfaceCard)
                    .border(1.dp, BorderDark, RoundedCornerShape(14.dp))
                    .clickable { onDisconnect() }
                    .padding(horizontal = 8.dp, vertical = 5.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Antigravity 'A' Logo Badge
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(RoundedCornerShape(7.dp))
                        .background(gradientBrush),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "A",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontWeight = FontWeight.Black,
                            fontSize = 13.sp,
                            color = Color.White
                        )
                    )
                }

                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = hostName.take(16),
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            ),
                            color = TextPrimary
                        )
                        StatusIndicatorDot(connectionStatus)
                    }
                    Text(
                        text = when (connectionStatus) {
                            ConnectionStatus.CONNECTED -> "${latencyMs}ms • live"
                            ConnectionStatus.CONNECTING -> "connecting..."
                            ConnectionStatus.SIMULATED -> "native companion"
                            ConnectionStatus.DISCONNECTED -> "disconnected"
                        },
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 9.sp
                        ),
                        color = if (connectionStatus == ConnectionStatus.CONNECTED) AccentEmerald else TextMuted
                    )
                }

                Icon(
                    imageVector = Icons.Default.Logout,
                    contentDescription = "Switch Workspace",
                    tint = TextMuted,
                    modifier = Modifier.size(13.dp)
                )
            }

            // Right: Model Chip, QR & Settings
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Model Selector Chip
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(PrimaryPurple.copy(alpha = 0.15f))
                        .border(1.dp, PrimaryPurple.copy(alpha = 0.35f), RoundedCornerShape(10.dp))
                        .clickable { onSettingsClick() }
                        .padding(horizontal = 8.dp, vertical = 5.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = AccentCyan,
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = modelName,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 11.sp
                            ),
                            color = Color(0xFFC7D2FE)
                        )
                    }
                }

                // QR Quick Button
                IconButton(
                    onClick = onQrClick,
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(SurfaceCard)
                        .border(1.dp, BorderDark, RoundedCornerShape(10.dp))
                ) {
                    Icon(
                        imageVector = Icons.Outlined.QrCodeScanner,
                        contentDescription = "Scan Pairing QR",
                        tint = AccentCyan,
                        modifier = Modifier.size(16.dp)
                    )
                }

                // Settings Button
                IconButton(
                    onClick = onSettingsClick,
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(SurfaceCard)
                        .border(1.dp, BorderDark, RoundedCornerShape(10.dp))
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Settings,
                        contentDescription = "Settings",
                        tint = TextSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun StatusIndicatorDot(status: ConnectionStatus) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dotAlpha"
    )

    val color = when (status) {
        ConnectionStatus.CONNECTED -> AccentEmerald
        ConnectionStatus.CONNECTING -> AccentAmber
        ConnectionStatus.SIMULATED -> AccentCyan
        ConnectionStatus.DISCONNECTED -> AccentRose
    }

    Box(
        modifier = Modifier
            .size(7.dp)
            .clip(CircleShape)
            .background(color.copy(alpha = if (status == ConnectionStatus.CONNECTING) alpha else 1.0f))
    )
}

enum class NavigationTab(val label: String, val icon: ImageVector) {
    CHAT("Chat", Icons.Default.ChatBubbleOutline),
    APPROVALS("Approvals", Icons.Default.CheckCircleOutline),
    TERMINAL("Terminal", Icons.Default.Terminal),
    SUBAGENTS("Subagents", Icons.Default.Hub),
    ARTIFACTS("Artifacts", Icons.Default.Description)
}

@Composable
fun BottomNavigationBar(
    currentTab: NavigationTab,
    pendingApprovalCount: Int,
    onTabSelected: (NavigationTab) -> Unit
) {
    Surface(
        color = SurfaceDark,
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .border(0.5.dp, BorderDark)
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NavigationTab.entries.forEach { tab ->
                val selected = currentTab == tab
                NavigationBarItem(
                    selected = selected,
                    onClick = { onTabSelected(tab) },
                    icon = {
                        BadgedBox(
                            badge = {
                                if (tab == NavigationTab.APPROVALS && pendingApprovalCount > 0) {
                                    Badge(
                                        containerColor = AccentRose,
                                        contentColor = Color.White
                                    ) {
                                        Text(text = pendingApprovalCount.toString(), fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = tab.icon,
                                contentDescription = tab.label,
                                tint = if (selected) PrimaryPurple else TextMuted
                            )
                        }
                    },
                    label = {
                        Text(
                            text = tab.label,
                            fontSize = 11.sp,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                            color = if (selected) PrimaryPurple else TextMuted
                        )
                    },
                    colors = NavigationBarItemDefaults.colors(
                        indicatorColor = SurfaceCard
                    )
                )
            }
        }
    }
}

@Composable
fun ThinkingBlock(
    thinking: String,
    expanded: Boolean,
    onToggle: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(SurfaceCard)
            .border(1.dp, BorderDark, RoundedCornerShape(10.dp))
            .padding(10.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onToggle() },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Psychology,
                    contentDescription = null,
                    tint = AccentCyan,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = "Thinking Process",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                    color = AccentCyan
                )
            }
            Icon(
                imageVector = if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = null,
                tint = TextMuted,
                modifier = Modifier.size(16.dp)
            )
        }

        AnimatedVisibility(visible = expanded) {
            Text(
                text = thinking,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    lineHeight = 16.sp
                ),
                color = TextSecondary,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}
