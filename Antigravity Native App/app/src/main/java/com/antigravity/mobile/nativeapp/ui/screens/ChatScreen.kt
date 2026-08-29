package com.antigravity.mobile.nativeapp.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antigravity.mobile.nativeapp.data.model.ChatMessage
import com.antigravity.mobile.nativeapp.data.model.ToolCallInfo
import com.antigravity.mobile.nativeapp.ui.components.ThinkingBlock
import com.antigravity.mobile.nativeapp.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun ChatScreen(
    messages: List<ChatMessage>,
    onSendMessage: (String) -> Unit,
    onVoiceClick: () -> Unit
) {
    var inputText by remember { mutableStateOf("") }
    var expandedThoughts by remember { mutableStateOf<Set<String>>(emptySet()) }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    val slashCommands = listOf(
        "/goal" to "Run autonomous goal",
        "/schedule" to "Set recurring cron",
        "/grill-me" to "Interactive design review",
        "/browser" to "Headless web automation",
        "/teamwork-preview" to "Multi-agent swarm",
        "/learn" to "Save learned rule"
    )

    val contextTags = listOf("@workspace", "@terminal", "@tasks", "@rules")

    LaunchedEffect(messages.size, messages.lastOrNull()?.content?.length) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
    ) {
        // Message Feed
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            items(messages, key = { it.id }) { msg ->
                if (msg.role == "user") {
                    UserMessageBubble(msg)
                } else {
                    AssistantMessageBubble(
                        msg = msg,
                        isThoughtExpanded = expandedThoughts.contains(msg.id),
                        onToggleThought = {
                            expandedThoughts = if (expandedThoughts.contains(msg.id)) {
                                expandedThoughts - msg.id
                            } else {
                                expandedThoughts + msg.id
                            }
                        }
                    )
                }
            }
        }

        // Context & Slash Command Bar
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceDark)
                .border(1.dp, BorderDark)
                .padding(top = 8.dp, bottom = 4.dp)
        ) {
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(contextTags) { tag ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(SurfaceCard)
                            .border(1.dp, BorderDark, RoundedCornerShape(12.dp))
                            .clickable {
                                inputText = if (inputText.isEmpty()) "$tag " else "$inputText $tag "
                            }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = tag,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            ),
                            color = AccentCyan
                        )
                    }
                }

                items(slashCommands) { (cmd, desc) ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(PrimaryPurple.copy(alpha = 0.15f))
                            .border(1.dp, PrimaryPurple.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                            .clickable {
                                inputText = "$cmd "
                            }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = cmd,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            ),
                            color = PrimaryPurple
                        )
                    }
                }
            }

            // Input Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Voice Dictation Button
                IconButton(
                    onClick = onVoiceClick,
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(SurfaceCard)
                        .border(1.dp, BorderDark, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = "Voice Input",
                        tint = PrimaryPurple,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Text Input Field
                TextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = {
                        Text(
                            text = "Message Antigravity or type /",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextMuted
                        )
                    },
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(22.dp))
                        .border(1.dp, BorderDark, RoundedCornerShape(22.dp)),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = SurfaceCard,
                        unfocusedContainerColor = SurfaceCard,
                        focusedTextColor = TextPrimary,
                        unfocusedTextColor = TextPrimary,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent
                    ),
                    maxLines = 4,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = {
                        if (inputText.isNotBlank()) {
                            onSendMessage(inputText.trim())
                            inputText = ""
                        }
                    })
                )

                // Send Button
                IconButton(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            onSendMessage(inputText.trim())
                            inputText = ""
                        }
                    },
                    enabled = inputText.isNotBlank(),
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(if (inputText.isNotBlank()) PrimaryPurple else SurfaceCard)
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowUpward,
                        contentDescription = "Send",
                        tint = if (inputText.isNotBlank()) Color.White else TextMuted,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun UserMessageBubble(msg: ChatMessage) {
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = Alignment.CenterEnd
    ) {
        Column(
            modifier = Modifier
                .widthIn(max = 310.dp)
                .clip(RoundedCornerShape(16.dp, 16.dp, 2.dp, 16.dp))
                .background(PrimaryPurple)
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Text(
                text = msg.content,
                style = MaterialTheme.typography.bodyLarge,
                color = Color.White
            )
        }
    }
}

@Composable
fun AssistantMessageBubble(
    msg: ChatMessage,
    isThoughtExpanded: Boolean,
    onToggleThought: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = Alignment.CenterStart
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth(0.96f)
                .clip(RoundedCornerShape(16.dp, 16.dp, 16.dp, 2.dp))
                .background(SurfaceDark)
                .border(1.dp, BorderDark, RoundedCornerShape(16.dp, 16.dp, 16.dp, 2.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Thinking Block if available
            if (!msg.thinking.isNullOrEmpty()) {
                ThinkingBlock(
                    thinking = msg.thinking,
                    expanded = isThoughtExpanded,
                    onToggle = onToggleThought
                )
            }

            // Message Body
            Text(
                text = msg.content,
                style = MaterialTheme.typography.bodyLarge.copy(lineHeight = 21.sp),
                color = TextPrimary
            )

            // Tool Calls summary if any
            if (msg.toolCalls.isNotEmpty()) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    msg.toolCalls.forEach { tool ->
                        ToolCallChip(tool)
                    }
                }
            }
        }
    }
}

@Composable
fun ToolCallChip(tool: ToolCallInfo) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(6.dp))
            .background(SurfaceCard)
            .border(1.dp, BorderDark, RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Build,
            contentDescription = null,
            tint = AccentAmber,
            modifier = Modifier.size(14.dp)
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = tool.toolName,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                ),
                color = AccentAmber
            )
            if (tool.summary.isNotEmpty()) {
                Text(
                    text = tool.summary,
                    style = MaterialTheme.typography.bodySmall.copy(fontSize = 10.sp),
                    color = TextSecondary
                )
            }
        }
        Text(
            text = "DONE",
            style = MaterialTheme.typography.bodySmall.copy(
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp
            ),
            color = AccentEmerald
        )
    }
}
