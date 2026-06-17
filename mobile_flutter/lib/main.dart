import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';

const String defaultGeminiKey = String.fromEnvironment('GEMINI_API_KEY');
const String defaultGeminiModel = String.fromEnvironment(
  'GEMINI_MODEL',
  defaultValue: 'gemini-3.5-flash',
);
const String defaultOpenAiKey = String.fromEnvironment('OPENAI_API_KEY');
const String defaultOpenAiModel = String.fromEnvironment(
  'OPENAI_MODEL',
  defaultValue: 'gpt-4.1-mini',
);

void main() {
  runApp(const StartupCrewApp());
}

class StartupCrewApp extends StatelessWidget {
  const StartupCrewApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'StartupCrew',
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10A37F),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF0F0F10),
        fontFamily: 'Roboto',
      ),
      home: const ChatHomePage(),
    );
  }
}

class AgentProfile {
  const AgentProfile({
    required this.id,
    required this.name,
    required this.role,
    required this.prompt,
    required this.fallback,
    required this.icon,
  });

  final String id;
  final String name;
  final String role;
  final String prompt;
  final String fallback;
  final IconData icon;
}

class ChatMessage {
  const ChatMessage({
    required this.sender,
    required this.text,
    required this.time,
  });

  final MessageSender sender;
  final String text;
  final DateTime time;
}

enum MessageSender { user, agent, system }

enum AiProvider { gemini, openai }

const agents = <AgentProfile>[
  AgentProfile(
    id: 'ceo',
    name: 'CEO Agent',
    role: 'Strategy',
    icon: Icons.workspace_premium_outlined,
    prompt: 'You are the CEO Agent for StartupCrew. Help with startup strategy, MVP planning, priorities, business models, and practical founder decisions.',
    fallback: 'Focus on one clear customer, one painful problem, and one tiny MVP you can ship this week.',
  ),
  AgentProfile(
    id: 'developer',
    name: 'Developer Agent',
    role: 'Build',
    icon: Icons.code_rounded,
    prompt: 'You are the Developer Agent for StartupCrew. Help with software architecture, coding, APIs, debugging, deployment, and practical MVP implementation.',
    fallback: 'Start with the smallest working version: auth, one core workflow, persistence, and a simple deploy path.',
  ),
  AgentProfile(
    id: 'designer',
    name: 'Designer Agent',
    role: 'UI/UX',
    icon: Icons.brush_outlined,
    prompt: 'You are the Designer Agent for StartupCrew. Help with clean mobile UI, layout hierarchy, product flows, typography, spacing, and design systems.',
    fallback: 'Keep the interface calm: clear navigation, readable spacing, strong contrast, and one obvious primary action.',
  ),
  AgentProfile(
    id: 'marketing',
    name: 'Marketing Agent',
    role: 'Growth',
    icon: Icons.campaign_outlined,
    prompt: 'You are the Marketing Agent for StartupCrew. Help with positioning, launch plans, acquisition, content, ads, and practical growth experiments.',
    fallback: 'Pick one audience, write one simple promise, and test it on one channel before scaling.',
  ),
  AgentProfile(
    id: 'finance',
    name: 'Finance Agent',
    role: 'Money',
    icon: Icons.attach_money_rounded,
    prompt: 'You are the Finance Agent for StartupCrew. Help with pricing, revenue, budget, costs, runway, projections, and monetization.',
    fallback: 'Estimate costs, price simply, track runway, and validate willingness to pay before adding complexity.',
  ),
  AgentProfile(
    id: 'pitch',
    name: 'Pitch Agent',
    role: 'Pitch',
    icon: Icons.slideshow_outlined,
    prompt: 'You are the Pitch Agent for StartupCrew. Help make startup pitches clear, convincing, and investor-ready.',
    fallback: 'Use this pitch spine: problem, user, solution, traction, market, business model, ask, next milestone.',
  ),
];

class ChatHomePage extends StatefulWidget {
  const ChatHomePage({super.key});

  @override
  State<ChatHomePage> createState() => _ChatHomePageState();
}

class _ChatHomePageState extends State<ChatHomePage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = <ChatMessage>[
    ChatMessage(
      sender: MessageSender.agent,
      text: 'Welcome to StartupCrew mobile. Pick an agent and ask what to build next.',
      time: DateTime.now(),
    ),
  ];

  AgentProfile _selectedAgent = agents.first;
  AiProvider _provider = AiProvider.gemini;
  bool _crewMode = false;
  bool _isLoading = false;

  String _geminiKey = defaultGeminiKey;
  String _geminiModel = defaultGeminiModel;
  String _openAiKey = defaultOpenAiKey;
  String _openAiModel = defaultOpenAiModel;

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isLoading) return;

    setState(() {
      _messages.add(ChatMessage(sender: MessageSender.user, text: text, time: DateTime.now()));
      _messageController.clear();
      _isLoading = true;
    });
    _scrollToBottom();

    try {
      final reply = _crewMode
          ? await _generateCrewReply(text)
          : await _generateReply(_selectedAgent, text);
      setState(() {
        _messages.add(ChatMessage(sender: MessageSender.agent, text: reply, time: DateTime.now()));
      });
    } catch (error) {
      setState(() {
        _messages.add(
          ChatMessage(
            sender: MessageSender.agent,
            text: '${_providerLabel()} could not respond yet: $error\n\nLocal ${_selectedAgent.name} fallback:\n${_selectedAgent.fallback}',
            time: DateTime.now(),
          ),
        );
      });
    } finally {
      setState(() => _isLoading = false);
      _scrollToBottom();
    }
  }

  Future<String> _generateCrewReply(String userMessage) async {
    final replies = <String>[];
    for (final agent in agents) {
      try {
        final reply = await _generateReply(agent, userMessage);
        replies.add('${agent.name}\n$reply');
      } catch (error) {
        replies.add('${agent.name}\nCould not respond: $error\n${agent.fallback}');
      }
    }
    return replies.join('\n\n');
  }

  Future<String> _generateReply(AgentProfile agent, String userMessage) {
    if (_provider == AiProvider.openai) {
      if (_openAiKey.trim().isEmpty) return Future.value(agent.fallback);
      return _callOpenAi(agent, userMessage);
    }

    if (_geminiKey.trim().isEmpty) return Future.value(agent.fallback);
    return _callGemini(agent, userMessage);
  }

  Future<String> _callGemini(AgentProfile agent, String userMessage) async {
    final uri = Uri.parse(
      'https://generativelanguage.googleapis.com/v1beta/models/$_geminiModel:generateContent',
    );
    final response = await _postJson(
      uri,
      headers: <String, String>{
        'Content-Type': 'application/json',
        'x-goog-api-key': _geminiKey,
      },
      body: <String, dynamic>{
        'system_instruction': {
          'parts': [
            {'text': _systemPrompt(agent)},
          ],
        },
        'contents': [
          {
            'role': 'user',
            'parts': [
              {'text': userMessage},
            ],
          },
        ],
      },
    );

    final error = response['error'];
    if (error is Map && error['message'] is String) {
      throw Exception(error['message']);
    }

    final candidates = response['candidates'];
    if (candidates is List && candidates.isNotEmpty) {
      final content = candidates.first['content'];
      final parts = content is Map ? content['parts'] : null;
      if (parts is List) {
        return parts
            .map((part) => part is Map ? part['text'] : null)
            .whereType<String>()
            .join('\n')
            .trim();
      }
    }

    return agent.fallback;
  }

  Future<String> _callOpenAi(AgentProfile agent, String userMessage) async {
    final response = await _postJson(
      Uri.parse('https://api.openai.com/v1/responses'),
      headers: <String, String>{
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_openAiKey',
      },
      body: <String, dynamic>{
        'model': _openAiModel,
        'instructions': _systemPrompt(agent),
        'input': [
          {'role': 'user', 'content': userMessage},
        ],
      },
    );

    final error = response['error'];
    if (error is Map && error['message'] is String) {
      throw Exception(error['message']);
    }

    final outputText = response['output_text'];
    if (outputText is String && outputText.trim().isNotEmpty) {
      return outputText.trim();
    }

    final output = response['output'];
    if (output is List) {
      final buffer = StringBuffer();
      for (final item in output) {
        if (item is! Map) continue;
        final content = item['content'];
        if (content is! List) continue;
        for (final block in content) {
          if (block is Map && block['text'] is String) {
            buffer.writeln(block['text']);
          }
        }
      }
      final value = buffer.toString().trim();
      if (value.isNotEmpty) return value;
    }

    return agent.fallback;
  }

  Future<Map<String, dynamic>> _postJson(
    Uri uri, {
    required Map<String, String> headers,
    required Map<String, dynamic> body,
  }) async {
    final client = HttpClient();
    try {
      final request = await client.postUrl(uri);
      headers.forEach(request.headers.set);
      request.write(jsonEncode(body));
      final response = await request.close().timeout(const Duration(seconds: 45));
      final text = await response.transform(utf8.decoder).join();
      final decoded = jsonDecode(text);
      if (decoded is Map<String, dynamic>) return decoded;
      return <String, dynamic>{'error': {'message': 'Unexpected API response.'}};
    } on TimeoutException {
      throw Exception('Request timed out.');
    } finally {
      client.close(force: true);
    }
  }

  String _systemPrompt(AgentProfile agent) {
    return '${agent.prompt}\n\nProject memory: StartupCrew is an AI startup team app for founders. Answer like ChatGPT: clear direct answer first, then short bullets or steps. Keep it practical and mobile-readable.';
  }

  String _providerLabel() {
    return _provider == AiProvider.gemini ? 'Gemini' : 'OpenAI';
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 260),
        curve: Curves.easeOut,
      );
    });
  }

  void _openSettings() {
    final geminiKeyController = TextEditingController(text: _geminiKey);
    final geminiModelController = TextEditingController(text: _geminiModel);
    final openAiKeyController = TextEditingController(text: _openAiKey);
    final openAiModelController = TextEditingController(text: _openAiModel);

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF171717),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.fromLTRB(
            18,
            14,
            18,
            MediaQuery.of(context).viewInsets.bottom + 18,
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 38,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(99),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'AI settings',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Keys entered here stay in this app session. For production, use a backend.',
                  style: TextStyle(color: Colors.white60, height: 1.35),
                ),
                const SizedBox(height: 18),
                _SettingsField(label: 'Gemini API key', controller: geminiKeyController, obscure: true),
                _SettingsField(label: 'Gemini model', controller: geminiModelController),
                _SettingsField(label: 'OpenAI API key', controller: openAiKeyController, obscure: true),
                _SettingsField(label: 'OpenAI model', controller: openAiModelController),
                const SizedBox(height: 10),
                FilledButton(
                  onPressed: () {
                    setState(() {
                      _geminiKey = geminiKeyController.text.trim();
                      _geminiModel = geminiModelController.text.trim().isEmpty
                          ? defaultGeminiModel
                          : geminiModelController.text.trim();
                      _openAiKey = openAiKeyController.text.trim();
                      _openAiModel = openAiModelController.text.trim().isEmpty
                          ? defaultOpenAiModel
                          : openAiModelController.text.trim();
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('Save settings'),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _TopBar(
              provider: _provider,
              providerLabel: _providerLabel(),
              onSettings: _openSettings,
              onProviderChanged: (provider) => setState(() => _provider = provider),
            ),
            _AgentSelector(
              selectedAgent: _selectedAgent,
              onSelected: (agent) => setState(() => _selectedAgent = agent),
            ),
            Expanded(
              child: _MessageList(
                controller: _scrollController,
                messages: _messages,
                isLoading: _isLoading,
                loadingLabel: _crewMode ? 'StartupCrew is thinking' : '${_selectedAgent.name} is thinking',
              ),
            ),
            _Composer(
              controller: _messageController,
              isLoading: _isLoading,
              crewMode: _crewMode,
              onCrewModeChanged: (value) => setState(() => _crewMode = value),
              onSend: _sendMessage,
            ),
          ],
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.provider,
    required this.providerLabel,
    required this.onSettings,
    required this.onProviderChanged,
  });

  final AiProvider provider;
  final String providerLabel;
  final VoidCallback onSettings;
  final ValueChanged<AiProvider> onProviderChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: const Color(0xFF10A37F),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.auto_awesome, color: Colors.white),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('StartupCrew', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                Text('AI startup team', style: TextStyle(color: Colors.white60, fontSize: 12)),
              ],
            ),
          ),
          PopupMenuButton<AiProvider>(
            tooltip: 'AI provider',
            initialValue: provider,
            onSelected: onProviderChanged,
            itemBuilder: (context) => const [
              PopupMenuItem(value: AiProvider.gemini, child: Text('Gemini')),
              PopupMenuItem(value: AiProvider.openai, child: Text('OpenAI')),
            ],
            child: _Pill(text: providerLabel),
          ),
          const SizedBox(width: 8),
          IconButton.filledTonal(
            onPressed: onSettings,
            icon: const Icon(Icons.tune_rounded),
          ),
        ],
      ),
    );
  }
}

class _AgentSelector extends StatelessWidget {
  const _AgentSelector({
    required this.selectedAgent,
    required this.onSelected,
  });

  final AgentProfile selectedAgent;
  final ValueChanged<AgentProfile> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 92,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        itemCount: agents.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final agent = agents[index];
          final selected = selectedAgent.id == agent.id;
          return InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => onSelected(agent),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 160),
              width: 132,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: selected ? const Color(0xFF202123) : const Color(0xFF171717),
                border: Border.all(color: selected ? const Color(0xFF10A37F) : Colors.white10),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Icon(agent.icon, color: selected ? const Color(0xFF10A37F) : Colors.white70),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          agent.name.replaceAll(' Agent', ''),
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                        Text(
                          agent.role,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white54, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _MessageList extends StatelessWidget {
  const _MessageList({
    required this.controller,
    required this.messages,
    required this.isLoading,
    required this.loadingLabel,
  });

  final ScrollController controller;
  final List<ChatMessage> messages;
  final bool isLoading;
  final String loadingLabel;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: controller,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      itemCount: messages.length + (isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == messages.length) {
          return _TypingBubble(label: loadingLabel);
        }

        final message = messages[index];
        return _MessageBubble(message: message);
      },
    );
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});

  final ChatMessage message;

  @override
  Widget build(BuildContext context) {
    final isUser = message.sender == MessageSender.user;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.84,
        ),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.fromLTRB(15, 13, 15, 12),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF10A37F) : const Color(0xFF202123),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(isUser ? 20 : 6),
            bottomRight: Radius.circular(isUser ? 6 : 20),
          ),
          border: Border.all(color: isUser ? Colors.transparent : Colors.white10),
        ),
        child: Text(
          message.text,
          style: TextStyle(
            height: 1.45,
            fontSize: 15,
            color: isUser ? Colors.white : Colors.white.withOpacity(0.92),
          ),
        ),
      ),
    );
  }
}

class _TypingBubble extends StatefulWidget {
  const _TypingBubble({required this.label});

  final String label;

  @override
  State<_TypingBubble> createState() => _TypingBubbleState();
}

class _TypingBubbleState extends State<_TypingBubble> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF202123),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: Colors.white10),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(widget.label, style: const TextStyle(color: Colors.white70)),
            const SizedBox(width: 10),
            AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                final value = (_controller.value * 3).floor() % 3;
                return Row(
                  children: List.generate(3, (index) {
                    return Container(
                      width: 6,
                      height: 6,
                      margin: const EdgeInsets.only(left: 4),
                      decoration: BoxDecoration(
                        color: index == value ? const Color(0xFF10A37F) : Colors.white30,
                        borderRadius: BorderRadius.circular(99),
                      ),
                    );
                  }),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  const _Composer({
    required this.controller,
    required this.isLoading,
    required this.crewMode,
    required this.onCrewModeChanged,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool isLoading;
  final bool crewMode;
  final ValueChanged<bool> onCrewModeChanged;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(16, 10, 16, MediaQuery.of(context).padding.bottom + 12),
      decoration: const BoxDecoration(
        color: Color(0xFF0F0F10),
        border: Border(top: BorderSide(color: Colors.white10)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              FilterChip(
                selected: crewMode,
                onSelected: isLoading ? null : onCrewModeChanged,
                label: Text(crewMode ? 'Crew mode on' : 'Crew mode off'),
                avatar: const Icon(Icons.groups_2_outlined, size: 18),
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Ask one agent or the full crew',
                  style: TextStyle(color: Colors.white54, fontSize: 12),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.fromLTRB(14, 6, 8, 6),
            decoration: BoxDecoration(
              color: const Color(0xFF202123),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white12),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    enabled: !isLoading,
                    minLines: 1,
                    maxLines: 5,
                    textInputAction: TextInputAction.newline,
                    decoration: const InputDecoration(
                      hintText: 'Message StartupCrew',
                      hintStyle: TextStyle(color: Colors.white38),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                IconButton.filled(
                  onPressed: isLoading ? null : onSend,
                  icon: const Icon(Icons.arrow_upward_rounded),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFF10A37F),
                    disabledBackgroundColor: Colors.white12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsField extends StatelessWidget {
  const _SettingsField({
    required this.label,
    required this.controller,
    this.obscure = false,
  });

  final String label;
  final TextEditingController controller;
  final bool obscure;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: const Color(0xFF202123),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Colors.white12),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Colors.white12),
          ),
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 36,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF202123),
        borderRadius: BorderRadius.circular(99),
        border: Border.all(color: Colors.white12),
      ),
      child: Center(
        child: Text(
          text,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}
