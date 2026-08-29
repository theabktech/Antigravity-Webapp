package com.antigravity.mobile.nativeapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Share
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
import com.antigravity.mobile.nativeapp.data.model.ArtifactDoc
import com.antigravity.mobile.nativeapp.ui.theme.*

@Composable
fun ArtifactsScreen(
    artifacts: List<ArtifactDoc>
) {
    var selectedArtifactId by remember { mutableStateOf(artifacts.firstOrNull()?.id ?: "") }
    val currentArtifact = artifacts.find { it.id == selectedArtifactId } ?: artifacts.firstOrNull()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .padding(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "SPEC & ARTIFACT VIEWER",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp,
                        letterSpacing = 1.sp
                    ),
                    color = TextPrimary
                )
                Text(
                    text = "${artifacts.size} Project Specifications Synchronized",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
            }

            IconButton(
                onClick = { /* Share */ },
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(SurfaceCard)
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = "Share Document",
                    tint = TextSecondary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        // Tabs
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 14.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(artifacts) { art ->
                val isSelected = art.id == selectedArtifactId
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) PrimaryPurple else SurfaceCard)
                        .border(1.dp, if (isSelected) PrimaryPurple else BorderDark, RoundedCornerShape(8.dp))
                        .clickable { selectedArtifactId = art.id }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Description,
                            contentDescription = null,
                            tint = if (isSelected) Color.White else TextMuted,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = art.title,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            ),
                            color = if (isSelected) Color.White else TextPrimary
                        )
                    }
                }
            }
        }

        // Document Body
        if (currentArtifact != null) {
            Card(
                modifier = Modifier
                    .fillMaxSize()
                    .border(1.dp, BorderDark, RoundedCornerShape(12.dp)),
                colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                shape = RoundedCornerShape(12.dp)
            ) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text(
                            text = currentArtifact.filename,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontSize = 10.sp
                            ),
                            color = AccentCyan
                        )
                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = BorderDark
                        )
                    }

                    item {
                        // Render document paragraphs / markdown cleanly
                        currentArtifact.content.lines().forEach { line ->
                            when {
                                line.startsWith("# ") -> {
                                    Text(
                                        text = line.removePrefix("# "),
                                        style = MaterialTheme.typography.titleLarge.copy(fontSize = 18.sp),
                                        color = TextPrimary,
                                        modifier = Modifier.padding(top = 10.dp, bottom = 4.dp)
                                    )
                                }
                                line.startsWith("### ") -> {
                                    Text(
                                        text = line.removePrefix("### "),
                                        style = MaterialTheme.typography.titleMedium.copy(fontSize = 14.sp),
                                        color = PrimaryPurple,
                                        modifier = Modifier.padding(top = 8.dp, bottom = 2.dp)
                                    )
                                }
                                line.startsWith("- ") || line.startsWith("* ") -> {
                                    Row(
                                        modifier = Modifier.padding(start = 6.dp, top = 2.dp),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(text = "•", color = AccentCyan)
                                        Text(
                                            text = line.substring(2),
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = TextSecondary
                                        )
                                    }
                                }
                                line.startsWith("```") -> {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(TerminalBg)
                                            .padding(8.dp)
                                    ) {
                                        Text(
                                            text = line,
                                            style = MaterialTheme.typography.bodySmall.copy(
                                                fontFamily = FontFamily.Monospace,
                                                fontSize = 11.sp
                                            ),
                                            color = TerminalPrompt
                                        )
                                    }
                                }
                                else -> {
                                    if (line.isNotEmpty()) {
                                        Text(
                                            text = line,
                                            style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 19.sp),
                                            color = TextPrimary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
