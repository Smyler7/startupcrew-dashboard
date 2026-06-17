import { useMemo, useState } from "react";
import {
  Bot,
  Briefcase,
  Palette,
  Code2,
  Megaphone,
  Wallet,
  Search,
  Presentation,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Paperclip,
  Plus,
  Save,
  ArrowRightToLine,
  FolderPlus,
  Sparkles,
  Circle,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import "./AgentChat.css";

const agents = [
  {
    id: "ceo",
    name: "CEO Agent",
    role: "Strategy & leadership",
    icon: Briefcase,
    status: "Active",
    description: "Plans vision, priorities, and startup direction.",
    starter:
      "I’m your CEO Agent. I can help you define the startup vision, business model, priorities, roadmap, and execution plan.",
  },
  {
    id: "designer",
    name: "Designer Agent",
    role: "UI/UX & branding",
    icon: Palette,
    status: "Idle",
    description: "Creates clean interfaces, flows, and brand direction.",
    starter:
      "I’m your Designer Agent. I can help you create polished UI layouts, user flows, landing pages, dashboards, and product branding.",
  },
  {
    id: "developer",
    name: "Developer Agent",
    role: "Frontend & backend",
    icon: Code2,
    status: "Active",
    description: "Builds features, fixes bugs, and writes code.",
    starter:
      "I’m your Developer Agent. I can help you build React components, connect APIs, debug errors, and structure your SaaS app.",
  },
  {
    id: "marketing",
    name: "Marketing Agent",
    role: "Growth & content",
    icon: Megaphone,
    status: "Idle",
    description: "Creates campaigns, content, and launch plans.",
    starter:
      "I’m your Marketing Agent. I can help you create launch campaigns, social posts, positioning, growth strategies, and customer funnels.",
  },
  {
    id: "finance",
    name: "Finance Agent",
    role: "Pricing & budgets",
    icon: Wallet,
    status: "Idle",
    description: "Plans pricing, revenue, costs, and projections.",
    starter:
      "I’m your Finance Agent. I can help you plan pricing, startup costs, revenue models, budgets, and financial projections.",
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Market research",
    icon: Search,
    status: "Active",
    description: "Finds insights, competitors, and opportunities.",
    starter:
      "I’m your Research Agent. I can help you research markets, competitors, users, trends, and startup opportunities.",
  },
  {
    id: "pitch",
    name: "Pitch Agent",
    role: "Pitch decks & scripts",
    icon: Presentation,
    status: "Idle",
    description: "Creates investor pitches and presentation content.",
    starter:
      "I’m your Pitch Agent. I can help you create pitch decks, startup scripts, investor stories, and presentation outlines.",
  },
];

const promptChips = [
  "Create MVP plan",
  "Improve this idea",
  "Write tasks",
  "Design dashboard",
];

export default function AgentChat() {
  const [selectedAgentId, setSelectedAgentId] = useState("ceo");
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId),
    [selectedAgentId]
  );

  const [messagesByAgent, setMessagesByAgent] = useState(() =>
    agents.reduce((acc, agent) => {
      acc[agent.id] = [
        {
          id: crypto.randomUUID(),
          sender: "agent",
          text: agent.starter,
        },
        {
          id: crypto.randomUUID(),
          sender: "user",
          text: "Help me move this startup forward today.",
        },
        {
          id: crypto.randomUUID(),
          sender: "agent",
          text: "Great. I’ll turn that into a clear action plan with priorities, next steps, and outputs you can save to the project.",
        },
      ];
      return acc;
    }, {})
  );

  const messages = messagesByAgent[selectedAgentId] || [];

  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    setInput("");
    setIsTyping(false);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmed,
    };

    setMessagesByAgent((prev) => ({
      ...prev,
      [selectedAgentId]: [...prev[selectedAgentId], userMessage],
    }));

    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage = {
        id: crypto.randomUUID(),
        sender: "agent",
        text: `I’ll help with that as your ${selectedAgent.name}. Here is the next move: define the goal, break it into small tasks, create the first output, then save it to your StartupCrew project.`,
      };

      setMessagesByAgent((prev) => ({
        ...prev,
        [selectedAgentId]: [...prev[selectedAgentId], aiMessage],
      }));

      setIsTyping(false);
    }, 900);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="agent-page">
      <aside className={`agent-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark">
              <Bot size={20} />
            </div>

            {!collapsed && (
              <div>
                <h1>StartupCrew</h1>
                <p>AI startup team</p>
              </div>
            )}
          </div>

          <button
            className="collapse-btn"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        </div>

        <div className="agent-list">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isSelected = agent.id === selectedAgentId;

            return (
              <button
                key={agent.id}
                className={`agent-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelectAgent(agent.id)}
                title={collapsed ? agent.name : undefined}
              >
                <div className="agent-icon">
                  <Icon size={19} />
                </div>

                {!collapsed && (
                  <>
                    <div className="agent-copy">
                      <div className="agent-row">
                        <h3>{agent.name}</h3>
                        <span
                          className={`mini-status ${
                            agent.status === "Active" ? "active" : "idle"
                          }`}
                        >
                          <Circle size={7} fill="currentColor" />
                          {agent.status}
                        </span>
                      </div>
                      <p>{agent.description}</p>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      <main className="chat-shell">
        <header className="chat-header">
          <div className="chat-agent-title">
            <div className="chat-agent-icon">
              <selectedAgent.icon size={22} />
            </div>

            <div>
              <h2>{selectedAgent.name}</h2>
              <p>{selectedAgent.role}</p>
            </div>
          </div>

          <div className="header-actions">
            <span className="status-badge">
              <Sparkles size={14} />
              Active
            </span>
          </div>
        </header>

        <section className="messages-area">
          <div className="message-date">Today</div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-row ${
                message.sender === "user" ? "user" : "agent"
              }`}
            >
              {message.sender === "agent" && (
                <div className="message-avatar">
                  <selectedAgent.icon size={16} />
                </div>
              )}

              <div className="message-bubble">
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-row agent">
              <div className="message-avatar">
                <selectedAgent.icon size={16} />
              </div>

              <div className="typing-bubble">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </section>

        <section className="composer-section">
          <div className="prompt-chips">
            {promptChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="prompt-chip"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="composer">
            <button className="icon-btn" aria-label="Attach file">
              <Paperclip size={19} />
            </button>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${selectedAgent.name}...`}
              rows={1}
            />

            <button className="send-btn" onClick={handleSend}>
              <Send size={18} />
            </button>
          </div>
        </section>
      </main>

      <aside className="context-panel">
        <div className="panel-card project-card">
          <div className="panel-label">Current Project</div>
          <h3>StartupCrew MVP</h3>
          <p>
            Building a multi-agent SaaS dashboard for startup planning and
            execution.
          </p>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3>Agent Task</h3>
            <span className="task-status">
              <Clock3 size={14} />
              In Progress
            </span>
          </div>

          <div className="task-box">
            <p className="task-title">Create agent chat workspace</p>

            <div className="task-grid">
              <div>
                <span>Status</span>
                <strong>Active</strong>
              </div>
              <div>
                <span>Priority</span>
                <strong>High</strong>
              </div>
              <div>
                <span>Stage</span>
                <strong>MVP Build</strong>
              </div>
              <div>
                <span>Owner</span>
                <strong>{selectedAgent.name}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-card">
          <h3>Quick Actions</h3>

          <div className="quick-actions">
            <button>
              <Plus size={16} />
              Create Task
            </button>
            <button>
              <Save size={16} />
              Save Output
            </button>
            <button>
              <ArrowRightToLine size={16} />
              Send to Developer
            </button>
            <button>
              <FolderPlus size={16} />
              Add to Project
            </button>
          </div>
        </div>

        <div className="panel-card recent-card">
          <h3>Recent Outputs</h3>

          <div className="recent-list">
            <div className="recent-item">
              <CheckCircle2 size={16} />
              <div>
                <strong>Dashboard structure</strong>
                <span>Saved 12 min ago</span>
              </div>
            </div>

            <div className="recent-item">
              <CheckCircle2 size={16} />
              <div>
                <strong>Agent role list</strong>
                <span>Saved 28 min ago</span>
              </div>
            </div>

            <div className="recent-item">
              <CheckCircle2 size={16} />
              <div>
                <strong>Startup task board</strong>
                <span>Saved today</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}