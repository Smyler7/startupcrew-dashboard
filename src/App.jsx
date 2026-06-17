import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Code2,
  Crown,
  Diamond,
  DollarSign,
  FileText,
  Folder,
  Home,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Paintbrush,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Presentation,
  Search,
  Send,
  Settings,
  Sparkles,
  Telescope,
  X,
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import "./App.css";

const agents = [
  {
    id: "ceo",
    name: "CEO Agent",
    role: "Strategy & Roadmap",
    shortDescription: "Helps you think like a founder and turn messy startup ideas into focused execution.",
    status: "Online",
    skills: ["Strategy", "MVP planning", "Business models", "Priorities", "Growth direction"],
    systemPrompt:
      "You are the CEO Agent for StartupCrew. Your job is to help the user think like a startup founder. Help with startup strategy, MVP planning, business models, priorities, product decisions, team planning, and growth direction. Keep advice practical, clear, and focused on building fast with limited resources.",
    exampleResponse:
      "Let’s break this startup idea into a clear MVP, target users, business model, and launch plan.",
    icon: Crown,
  },
  {
    id: "developer",
    name: "Developer Agent",
    role: "Product Build",
    shortDescription: "Helps you plan, build, debug, and ship software products step by step.",
    status: "Online",
    skills: ["Coding", "Debugging", "Architecture", "APIs", "Deployment"],
    systemPrompt:
      "You are the Developer Agent for StartupCrew. Your job is to help the user build software products. Help with coding, debugging, app architecture, APIs, databases, frontend, backend, deployment, and MVP development. Give complete working code when needed. Keep answers practical and beginner-friendly.",
    exampleResponse:
      "I can help you build this step by step. First, we should define the core features, then create the frontend, backend, and database.",
    icon: Code2,
  },
  {
    id: "designer",
    name: "Designer Agent",
    role: "UI/UX & Brand",
    shortDescription: "Helps you create clean, modern, professional interfaces and product flows.",
    status: "Online",
    skills: ["UI/UX", "Layouts", "Typography", "Dashboards", "Design systems"],
    systemPrompt:
      "You are the Designer Agent for StartupCrew. Your job is to help the user create clean, modern, professional UI/UX designs. Help with layouts, colors, spacing, typography, user flows, dashboards, landing pages, wireframes, and design systems. Preserve existing designs unless asked to redesign.",
    exampleResponse:
      "I’ll help you improve the user experience without destroying your current design. We can improve spacing, hierarchy, and visual consistency.",
    icon: Paintbrush,
  },
  {
    id: "marketing",
    name: "Marketing Agent",
    role: "Growth & Acquisition",
    shortDescription: "Helps you grow with practical, low-cost launch and acquisition strategies.",
    status: "Online",
    skills: ["Branding", "Social media", "Launch plans", "Ads", "Customer acquisition"],
    systemPrompt:
      "You are the Marketing Agent for StartupCrew. Your job is to help the user grow and promote their startup. Help with branding, social media, launch plans, content ideas, ads, positioning, target audience, and customer acquisition. Focus on low-cost and practical marketing strategies.",
    exampleResponse:
      "Let’s define your target audience first, then create a simple launch plan using TikTok, WhatsApp, Instagram, and campus marketing.",
    icon: Megaphone,
  },
  {
    id: "finance",
    name: "Finance Agent",
    role: "Budget & Forecasting",
    shortDescription: "Helps you understand pricing, costs, revenue, budgets, and runway.",
    status: "Online",
    skills: ["Pricing", "Revenue models", "Budgets", "Projections", "Monetization"],
    systemPrompt:
      "You are the Finance Agent for StartupCrew. Your job is to help the user understand the money side of their startup. Help with pricing, revenue models, budgets, costs, profit, fundraising plans, financial projections, and monetization. Keep explanations simple and realistic.",
    exampleResponse:
      "Let’s calculate your startup costs, possible pricing, revenue streams, and how much money you need to launch.",
    icon: DollarSign,
  },
  {
    id: "research",
    name: "Research Agent",
    role: "Market Insights",
    shortDescription: "Helps you research markets, competitors, customers, trends, and opportunities.",
    status: "Online",
    skills: ["Market research", "Competitors", "Customer problems", "Trends", "Opportunities"],
    systemPrompt:
      "You are the Research Agent for StartupCrew. Your job is to help the user research markets, competitors, customers, trends, problems, and startup opportunities. Help summarize findings clearly and turn research into startup decisions. Ask useful questions only when necessary.",
    exampleResponse:
      "Let’s study the market, competitors, customer problems, and what makes your idea different.",
    icon: Search,
  },
  {
    id: "pitch",
    name: "Pitch Agent",
    role: "Fundraising Story",
    shortDescription: "Helps you turn your startup into a clear, convincing, professional pitch.",
    status: "Online",
    skills: ["Pitch decks", "Elevator pitches", "Investor messages", "Demo scripts", "Traction slides"],
    systemPrompt:
      "You are the Pitch Agent for StartupCrew. Your job is to help the user create powerful startup pitches. Help with pitch decks, elevator pitches, investor messages, problem-solution statements, traction slides, business model slides, and demo scripts. Make the pitch clear, convincing, and professional.",
    exampleResponse:
      "Let’s turn your idea into a strong pitch: problem, solution, market, product, business model, traction, and ask.",
    icon: Presentation,
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "agent-chat", label: "Chat", icon: MessageCircle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

const DEFAULT_PROJECT = {
  name: "StartupCrew Default Project",
  idea: "Build StartupCrew, an AI startup team platform.",
  target_users: "Founders, students, makers, and small startup teams.",
  tech_stack: "React, Vite, Supabase, Gemini, OpenAI",
  design_rules: "Keep the existing clean monochrome dashboard UI. Do not redesign without request.",
};
const DEFAULT_MEMORY = {
  startup_idea: DEFAULT_PROJECT.idea,
  target_users: DEFAULT_PROJECT.target_users,
  tech_stack: DEFAULT_PROJECT.tech_stack,
  design_rules: DEFAULT_PROJECT.design_rules,
  current_goals: "Ship a useful MVP with agent chat, tasks, projects, documents, and persistent memory.",
  notes: "Use Supabase when configured and localStorage fallback otherwise.",
};

const defaultBoardColumns = [
  {
    title: "Backlog",
    count: 3,
    tasks: [
      { title: "User interview notes", tag: "Research", avatar: "A" },
      { title: "Competitor analysis", tag: "Research", avatar: "H" },
      { title: "Brand guidelines update", tag: "Design", avatar: "N" },
    ],
  },
  {
    title: "In Progress",
    count: 2,
    tasks: [
      { title: "Landing page refresh", tag: "Design", avatar: "H" },
      { title: "API integration", tag: "Development", avatar: "A" },
    ],
  },
  {
    title: "Review",
    count: 2,
    tasks: [
      { title: "Investor pitch deck", tag: "Strategy", avatar: "H" },
      { title: "Ad campaign test", tag: "Marketing", avatar: "N" },
    ],
  },
  {
    title: "Done",
    count: 2,
    tasks: [
      { title: "MVP user flow", tag: "Development", done: true },
      { title: "Financial forecast", tag: "Finance", done: true },
    ],
  },
];

const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn(`Could not read ${key} from localStorage.`, error);
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Could not save ${key} to localStorage.`, error);
    }
  },
};

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function scopedKey(userId, key) {
  return `startupcrew.${userId || "local"}.${key}`;
}

function boardColumnsToTasks(columns) {
  return columns.flatMap((column) =>
    column.tasks.map((task) => ({
      id: task.id || createId("task"),
      title: task.title,
      description: task.description || "",
      status: column.title,
      assigned_agent: task.tag || task.assigned_agent || "CEO",
      avatar: task.avatar || "",
      done: Boolean(task.done),
    })),
  );
}

function tasksToBoardColumns(tasks) {
  const fallbackColumns = defaultBoardColumns.map((column) => ({ ...column, tasks: [] }));

  tasks.forEach((task) => {
    const column = fallbackColumns.find((item) => item.title === task.status) || fallbackColumns[0];
    column.tasks.push({
      id: task.id,
      title: task.title,
      description: task.description,
      tag: task.assigned_agent,
      avatar: task.avatar || "F",
      done: task.status === "Done" || task.done,
    });
  });

  return fallbackColumns.map((column) => ({
    ...column,
    count: column.tasks.length,
  }));
}

const defaultTasks = boardColumnsToTasks(defaultBoardColumns);

const projects = [
  { title: "MVP Website", owner: "Designer Agent", progress: 74, detail: "Landing page, dashboard, onboarding" },
  { title: "Investor Pitch", owner: "Pitch Agent", progress: 48, detail: "Deck narrative and raise strategy" },
  { title: "Market Research", owner: "Research Agent", progress: 68, detail: "ICP, competitors, opportunity map" },
  { title: "Product Roadmap", owner: "CEO Agent", progress: 55, detail: "Milestones, release plan, sprint focus" },
];

const documents = [
  { title: "Business Plan", type: "Strategy", updated: "Updated today", icon: BriefcaseBusiness },
  { title: "Pitch Deck", type: "Presentation", updated: "Updated yesterday", icon: Presentation },
  { title: "Market Research Notes", type: "Research", updated: "Updated 2 days ago", icon: Telescope },
  { title: "Financial Plan", type: "Finance", updated: "Updated 3 days ago", icon: DollarSign },
];

const chatSeed = [
  {
    from: "agent",
    text: "Good morning, Founder! How can I help you move the startup forward today?",
    time: "9:41 AM",
  },
  {
    from: "user",
    text: "What are our top priorities for this quarter? I want to make sure we're focused on the right things.",
    time: "9:42 AM",
  },
  {
    from: "agent",
    text: "Based on our roadmap and current progress, here are the top priorities:\n\n1. Launch new landing page to improve conversion\n2. Complete API integration for MVP\n3. Prepare investor pitch deck for upcoming meeting\n4. Run ad campaign test to validate acquisition channels\n\nShall I break these down into tasks?",
    time: "9:43 AM",
  },
];

const quickReplies = ["Yes, create tasks", "Add to roadmap", "What about growth?"];

const aiProviders = [
  {
    id: "gemini",
    name: "Gemini Crew 1.1",
    shortName: "Crew 1.1",
  },
  {
    id: "openai",
    name: "OpenAI Crew 2.1",
    shortName: "Crew 2.1",
  },
];

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.5-flash";
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-4.1-mini";
const RESPONSE_FORMAT_INSTRUCTION =
  "Format your answer like ChatGPT: begin with a clear direct answer, then use short sections, bullets, or numbered steps when useful. Use **bold labels** for important points. Keep paragraphs short, practical, and easy to scan. Include code blocks only when code is needed.";

function hasGeminiKey() {
  return Boolean(
    GEMINI_API_KEY &&
      GEMINI_API_KEY !== "paste_your_gemini_api_key_here" &&
      GEMINI_API_KEY !== "your_gemini_api_key_here",
  );
}

function hasOpenAIKey() {
  return Boolean(
    OPENAI_API_KEY &&
      OPENAI_API_KEY !== "your_openai_api_key_here" &&
      OPENAI_API_KEY !== "paste_your_openai_api_key_here",
  );
}

function getProviderStatus(providerId) {
  if (providerId === "openai") {
    return hasOpenAIKey();
  }

  return hasGeminiKey();
}

function createProjectMemoryPrompt(memory) {
  return `StartupCrew project memory:
- Startup idea: ${memory?.startup_idea || "Not set"}
- Target users: ${memory?.target_users || "Not set"}
- Tech stack: ${memory?.tech_stack || "Not set"}
- Design rules: ${memory?.design_rules || "Not set"}
- Current goals: ${memory?.current_goals || "Not set"}
- Notes: ${memory?.notes || "Not set"}`;
}

function formatCrewResponse(responses) {
  const successfulResponses = responses.filter((response) => response.reply);
  const failedResponses = responses.filter((response) => response.error);

  const sections = [
    "**Crew Mode response**",
    "Here is what your StartupCrew agents recommend:",
    ...successfulResponses.map(({ agent, reply }) => `## ${agent.name}\n${reply}`),
  ];

  if (failedResponses.length) {
    sections.push(
      "## Agents that could not respond",
      ...failedResponses.map(({ agent, error }) => `- **${agent.name}:** ${error}`),
    );
  }

  return sections.join("\n\n");
}

async function generateAgentReply(providerId, agent, history, userMessage, memory) {
  if (providerId === "openai") {
    return generateOpenAIReply(agent, history, userMessage, memory);
  }

  return generateGeminiReply(agent, history, userMessage, memory);
}

async function generateGeminiReply(agent, history, userMessage, memory) {
  if (!hasGeminiKey()) {
    return agent.exampleResponse;
  }

  const contents = [
    ...history.map((item) => ({
      role: item.from === "agent" ? "model" : "user",
      parts: [{ text: item.text }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: `${agent.systemPrompt}\n\n${createProjectMemoryPrompt(memory)}\n\n${RESPONSE_FORMAT_INSTRUCTION}` }],
        },
        contents,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || "Gemini request failed.";
    throw new Error(message);
  }

  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n").trim() || agent.exampleResponse;
}

async function generateOpenAIReply(agent, history, userMessage, memory) {
  if (!hasOpenAIKey()) {
    return agent.exampleResponse;
  }

  const input = [
    ...history.map((item) => ({
      role: item.from === "agent" ? "assistant" : "user",
      content: item.text,
    })),
    {
      role: "user",
      content: userMessage,
    },
  ];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: `${agent.systemPrompt}\n\n${createProjectMemoryPrompt(memory)}\n\n${RESPONSE_FORMAT_INSTRUCTION}`,
      input,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || "OpenAI request failed.";
    throw new Error(message);
  }

  return (
    data?.output_text ||
    data?.output
      ?.flatMap((item) => item.content || [])
      ?.map((content) => content.text)
      ?.filter(Boolean)
      ?.join("\n")
      ?.trim() ||
    agent.exampleResponse
  );
}

const createInitialChatHistories = () =>
  agents.reduce((histories, agent) => {
    histories[agent.id] =
      agent.id === "ceo"
        ? chatSeed
        : [
            {
              from: "agent",
              text: `${agent.name} online. ${agent.shortDescription}`,
              time: "9:41 AM",
            },
          ];
    return histories;
  }, {});

async function loadOrCreateProject(userId) {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase project load skipped. Login requires Supabase configuration.");
    const fallbackProject = storage.get(scopedKey(userId, "project"), {
      id: "local-startupcrew-project",
      user_id: userId,
      ...DEFAULT_PROJECT,
    });
    storage.set(scopedKey(userId, "project"), fallbackProject);
    return fallbackProject;
  }

  const { data: existingProject, error: selectError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .eq("name", DEFAULT_PROJECT.name)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingProject) {
    return existingProject;
  }

  const { data: newProject, error: insertError } = await supabase
    .from("projects")
    .insert({ user_id: userId, ...DEFAULT_PROJECT })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newProject;
}

async function loadProjectMemory(projectId) {
  if (!isSupabaseConfigured || !supabase) {
    return storage.get("startupcrew.projectMemory", {
      id: "local-project-memory",
      project_id: projectId,
      ...DEFAULT_MEMORY,
    });
  }

  const { data, error } = await supabase
    .from("project_memory")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const { data: createdMemory, error: insertError } = await supabase
    .from("project_memory")
    .insert({ project_id: projectId, ...DEFAULT_MEMORY })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return createdMemory;
}

async function saveProjectMemory(projectId, memory) {
  const payload = {
    project_id: projectId,
    startup_idea: memory.startup_idea || "",
    target_users: memory.target_users || "",
    tech_stack: memory.tech_stack || "",
    design_rules: memory.design_rules || "",
    current_goals: memory.current_goals || "",
    notes: memory.notes || "",
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured || !supabase) {
    storage.set("startupcrew.projectMemory", { id: "local-project-memory", ...payload });
    return;
  }

  const { data: existingMemory, error: selectError } = await supabase
    .from("project_memory")
    .select("id")
    .eq("project_id", projectId)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingMemory?.id) {
    const { error } = await supabase.from("project_memory").update(payload).eq("id", existingMemory.id);
    if (error) {
      throw error;
    }
    return;
  }

  const { error } = await supabase.from("project_memory").insert(payload);

  if (error) {
    throw error;
  }
}

async function loadTasks(projectId) {
  if (!isSupabaseConfigured || !supabase) {
    return storage.get("startupcrew.tasks", defaultTasks);
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  if (data?.length) {
    return data;
  }

  await saveTasks(projectId, defaultTasks);
  return defaultTasks;
}

async function saveTasks(projectId, tasks) {
  const payload = tasks.map((task) => ({
    id: task.id,
    project_id: projectId,
    title: task.title,
    description: task.description || "",
    status: task.status,
    assigned_agent: task.assigned_agent,
  }));

  if (!isSupabaseConfigured || !supabase) {
    storage.set("startupcrew.tasks", tasks);
    return;
  }

  const { error } = await supabase.from("tasks").upsert(payload);

  if (error) {
    throw error;
  }
}

async function loadChatHistories(projectId) {
  if (!isSupabaseConfigured || !supabase) {
    return storage.get("startupcrew.chatHistories", createInitialChatHistories());
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  if (!data?.length) {
    const seedHistories = createInitialChatHistories();
    const seedMessages = Object.entries(seedHistories).flatMap(([agentId, messages]) =>
      messages.map((item) => ({
        agent_id: agentId,
        sender: item.from,
        message: item.text,
      })),
    );
    await saveChatMessages(projectId, seedMessages);
    return seedHistories;
  }

  const histories = createInitialChatHistories();
  agents.forEach((agent) => {
    histories[agent.id] = [];
  });

  data.forEach((item) => {
    if (!histories[item.agent_id]) {
      histories[item.agent_id] = [];
    }

    histories[item.agent_id].push({
      id: item.id,
      from: item.sender,
      text: item.message,
      time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Now",
    });
  });

  return histories;
}

async function saveChatMessages(projectId, messages) {
  if (!messages.length) return;

  if (!isSupabaseConfigured || !supabase) {
    saveChatMessagesToLocal(messages);
    return;
  }

  const payload = messages.map((message) => ({
    project_id: projectId,
    agent_id: message.agent_id,
    sender: message.sender,
    message: message.message,
  }));

  const { error } = await supabase.from("chat_messages").insert(payload);

  if (error) {
    throw error;
  }
}

function saveChatMessagesToLocal(messages, userId) {
  const histories = storage.get(scopedKey(userId, "chatHistories"), createInitialChatHistories());
  messages.forEach((message) => {
    histories[message.agent_id] = [
      ...(histories[message.agent_id] || []),
      {
        from: message.sender,
        text: message.message,
        time: "Now",
      },
    ];
  });
  storage.set(scopedKey(userId, "chatHistories"), histories);
}

function App() {
  const [user, setUser] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseConfigured);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [project, setProject] = useState(null);
  const [projectMemory, setProjectMemory] = useState(DEFAULT_MEMORY);
  const [taskItems, setTaskItems] = useState(() => storage.get("startupcrew.tasks", defaultTasks));
  const [selectedAgentId, setSelectedAgentId] = useState("ceo");
  const [selectedProviderId, setSelectedProviderId] = useState("gemini");
  const [crewMode, setCrewMode] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistories, setChatHistories] = useState(() =>
    storage.get("startupcrew.chatHistories", createInitialChatHistories()),
  );
  const [fetchingAgents, setFetchingAgents] = useState({});

  const boardColumns = useMemo(() => tasksToBoardColumns(taskItems), [taskItems]);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) || agents[0],
    [selectedAgentId],
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsSessionLoading(false);
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn("Could not restore Supabase session.", error);
      }
      setUser(data.session?.user || null);
      setIsSessionLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthError("");
      setIsSessionLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    let isMounted = true;

    async function loadWorkspace() {
      try {
        const loadedProject = await loadOrCreateProject(user.id);
        if (!isMounted) return;
        setProject(loadedProject);

        const [loadedMemory, loadedTasks, loadedChats] = await Promise.all([
          loadProjectMemory(loadedProject.id),
          loadTasks(loadedProject.id),
          loadChatHistories(loadedProject.id),
        ]);

        if (!isMounted) return;
        setProjectMemory(loadedMemory || DEFAULT_MEMORY);
        setTaskItems(loadedTasks?.length ? loadedTasks : defaultTasks);
        setChatHistories(loadedChats || createInitialChatHistories());
      } catch (error) {
        console.warn("Supabase load failed. StartupCrew is using localStorage fallback.", error);
        if (!isMounted) return;
        setProject(storage.get(scopedKey(user.id, "project"), { id: "local-startupcrew-project", user_id: user.id, ...DEFAULT_PROJECT }));
        setProjectMemory(storage.get(scopedKey(user.id, "projectMemory"), { id: "local-project-memory", ...DEFAULT_MEMORY }));
        setTaskItems(storage.get(scopedKey(user.id, "tasks"), defaultTasks));
        setChatHistories(storage.get(scopedKey(user.id, "chatHistories"), createInitialChatHistories()));
      }
    }

    loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function persistTasks(nextTasks) {
    setTaskItems(nextTasks);

    try {
      await saveTasks(project?.id || "local-startupcrew-project", nextTasks);
    } catch (error) {
      console.warn("Could not save tasks to Supabase. Saved to localStorage fallback.", error);
      storage.set(scopedKey(user?.id, "tasks"), nextTasks);
    }
  }

  async function updateProjectMemory(nextMemory) {
    setProjectMemory(nextMemory);

    try {
      await saveProjectMemory(project?.id || "local-startupcrew-project", nextMemory);
    } catch (error) {
      console.warn("Could not save project memory to Supabase. Saved to localStorage fallback.", error);
      storage.set(scopedKey(user?.id, "projectMemory"), nextMemory);
    }
  }

  async function addTask(status) {
    const nextTask = {
      id: createId("task"),
      title: `New ${status.toLowerCase()} task`,
      description: "Created from StartupCrew dashboard.",
      status,
      assigned_agent: selectedAgent.name.replace(" Agent", ""),
      avatar: "F",
      done: status === "Done",
    };

    await persistTasks([...taskItems, nextTask]);
  }

  const openChat = (agentId) => {
    setSelectedAgentId(agentId);
    setActivePage("agent-chat");
  };

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");

    if (!isSupabaseConfigured || !supabase) {
      setAuthError("Supabase is not configured yet. Add your Supabase URL and anon key to .env.local.");
      return;
    }

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Enter your email and password to continue.");
      return;
    }

    setIsAuthLoading(true);

    try {
      const { data, error } =
        authMode === "signup"
          ? await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword })
          : await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });

      if (error) {
        throw error;
      }

      if (authMode === "signup" && !data.session) {
        setAuthError("Account created. Check your email to confirm signup, then log in.");
      }
    } catch (error) {
      setAuthError(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn("Logout failed.", error);
      return;
    }

    setProject(null);
    setProjectMemory(DEFAULT_MEMORY);
    setTaskItems(defaultTasks);
    setChatHistories(createInitialChatHistories());
    setSelectedAgentId("ceo");
    setActivePage("dashboard");
  }

  const sendMessage = async (event) => {
    event?.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage) return;
    const agent = selectedAgent;
    const agentId = agent.id;
    const targetAgents = crewMode ? agents : [agent];
    const targetAgentIds = targetAgents.map((targetAgent) => targetAgent.id);
    if (targetAgentIds.some((targetAgentId) => fetchingAgents[targetAgentId])) return;
    const currentHistory = chatHistories[agentId] || [];

    setChatHistories((current) => ({
      ...current,
      [agentId]: [
        ...(current[agentId] || []),
        { from: "user", text: cleanMessage, time: "Now" },
      ],
    }));
    setMessage("");
    setFetchingAgents((current) => ({
      ...current,
      ...Object.fromEntries(targetAgentIds.map((targetAgentId) => [targetAgentId, true])),
    }));

    try {
      try {
        await saveChatMessages(
          project?.id || "local-startupcrew-project",
          crewMode
            ? targetAgents.map((targetAgent) => ({
                agent_id: targetAgent.id,
                sender: "user",
                message: cleanMessage,
              }))
            : [
                {
                  agent_id: agentId,
                  sender: "user",
                  message: cleanMessage,
                },
              ],
        );
      } catch (saveError) {
        console.warn("Could not save user chat message to Supabase. Saved to localStorage fallback.", saveError);
        saveChatMessagesToLocal(
          crewMode
            ? targetAgents.map((targetAgent) => ({
                agent_id: targetAgent.id,
                sender: "user",
                message: cleanMessage,
              }))
            : [
                {
                  agent_id: agentId,
                  sender: "user",
                  message: cleanMessage,
                },
              ],
          user?.id,
        );
      }

      if (crewMode) {
        const responses = await Promise.all(
          targetAgents.map(async (targetAgent) => {
            try {
              const reply = await generateAgentReply(
                selectedProviderId,
                targetAgent,
                chatHistories[targetAgent.id] || [],
                cleanMessage,
                projectMemory,
              );

              return { agent: targetAgent, reply };
            } catch (error) {
              return { agent: targetAgent, error: error.message || "Could not respond." };
            }
          }),
        );

        const combinedReply = formatCrewResponse(responses);

        setChatHistories((current) => {
          const nextHistories = { ...current };

          responses.forEach(({ agent: responseAgent, reply, error }) => {
            const responseText = reply || `**${responseAgent.name} could not respond:** ${error}`;
            nextHistories[responseAgent.id] = [
              ...(nextHistories[responseAgent.id] || []),
              { from: "agent", text: responseText, time: "Now" },
            ];
          });

          nextHistories[agentId] = [
            ...(nextHistories[agentId] || []),
            { from: "agent", text: combinedReply, time: "Now" },
          ];

          return nextHistories;
        });

        try {
          await saveChatMessages(
            project?.id || "local-startupcrew-project",
            responses.map(({ agent: responseAgent, reply, error }) => ({
              agent_id: responseAgent.id,
              sender: "agent",
              message: reply || `**${responseAgent.name} could not respond:** ${error}`,
            })),
          );
        } catch (saveError) {
          console.warn("Could not save crew chat messages to Supabase. Saved to localStorage fallback.", saveError);
          saveChatMessagesToLocal(
            responses.map(({ agent: responseAgent, reply, error }) => ({
              agent_id: responseAgent.id,
              sender: "agent",
              message: reply || `**${responseAgent.name} could not respond:** ${error}`,
            })),
            user?.id,
          );
        }

        return;
      }

      const reply = await generateAgentReply(selectedProviderId, agent, currentHistory, cleanMessage, projectMemory);
      setChatHistories((current) => ({
        ...current,
        [agentId]: [...(current[agentId] || []), { from: "agent", text: reply, time: "Now" }],
      }));
      try {
        await saveChatMessages(project?.id || "local-startupcrew-project", [
          {
            agent_id: agentId,
            sender: "agent",
            message: reply,
          },
        ]);
      } catch (saveError) {
        console.warn("Could not save AI chat message to Supabase. Saved to localStorage fallback.", saveError);
        saveChatMessagesToLocal(
          [
          {
            agent_id: agentId,
            sender: "agent",
            message: reply,
          },
          ],
          user?.id,
        );
      }
    } catch (error) {
      setChatHistories((current) => ({
        ...current,
        [agentId]: [
          ...(current[agentId] || []),
          {
            from: "agent",
            text: `**${selectedProviderId === "openai" ? "OpenAI" : "Gemini"} could not respond yet:** ${error.message}\n\nFor now, here is the local ${agent.name} fallback:\n\n${agent.exampleResponse}`,
            time: "Now",
          },
        ],
      }));
    } finally {
      setFetchingAgents((current) => ({
        ...current,
        ...Object.fromEntries(targetAgentIds.map((targetAgentId) => [targetAgentId, false])),
      }));
    }
  };

  const pageProps = {
    openChat,
    boardColumns,
    onAddTask: addTask,
    projectMemory,
    updateProjectMemory,
    selectedAgent,
    setSelectedAgentId,
    selectedProviderId,
    setSelectedProviderId,
    crewMode,
    setCrewMode,
    providerHasKey: getProviderStatus(selectedProviderId),
    messages: chatHistories[selectedAgent.id] || [],
    isFetching: crewMode
      ? agents.some((agent) => fetchingAgents[agent.id])
      : Boolean(fetchingAgents[selectedAgent.id]),
    message,
    setMessage,
    sendMessage,
  };

  if (isSessionLoading) {
    return <AuthShell title="Loading StartupCrew..." text="Checking your Supabase session." />;
  }

  if (!isSupabaseConfigured || !supabase) {
    return (
      <AuthShell
        title="Connect Supabase to continue"
        text="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart the dev server."
        setupMode
      />
    );
  }

  if (!user) {
    return (
      <AuthPage
        authMode={authMode}
        setAuthMode={setAuthMode}
        email={authEmail}
        setEmail={setAuthEmail}
        password={authPassword}
        setPassword={setAuthPassword}
        error={authError}
        isLoading={isAuthLoading}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-shell">
        <Topbar />
        {activePage === "dashboard" && <Dashboard {...pageProps} />}
        {activePage === "agents" && <AgentsPage openChat={openChat} />}
        {activePage === "tasks" && <TasksPage boardColumns={boardColumns} onAddTask={addTask} />}
        {activePage === "projects" && <ProjectsPage />}
        {activePage === "documents" && <DocumentsPage />}
        {activePage === "agent-chat" && <AgentChatPage {...pageProps} />}
        {activePage === "analytics" && <AnalyticsPage />}
        {activePage === "settings" && (
          <SettingsPage
            user={user}
            onLogout={handleLogout}
            projectMemory={projectMemory}
            updateProjectMemory={updateProjectMemory}
          />
        )}
      </main>
    </div>
  );
}

function AuthShell({ title, text }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">
          <span>
            <Bot size={26} />
          </span>
          <strong>StartupCrew</strong>
        </div>
        <h1>{title}</h1>
        <p>{text}</p>
      </section>
    </main>
  );
}

function AuthPage({ authMode, setAuthMode, email, setEmail, password, setPassword, error, isLoading, onSubmit }) {
  const isSignup = authMode === "signup";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">
          <span>
            <Bot size={26} />
          </span>
          <strong>StartupCrew</strong>
        </div>
        <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p>{isSignup ? "Start building your startup with your AI crew." : "Log in to continue your StartupCrew workspace."}</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="founder@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
          </button>
        </form>

        <button className="auth-toggle" onClick={() => setAuthMode(isSignup ? "login" : "signup")}>
          {isSignup ? "Already have an account? Log in" : "New to StartupCrew? Create an account"}
        </button>
      </section>
    </main>
  );
}

function Sidebar({ activePage, setActivePage, collapsed, setCollapsed, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <button className="brand" onClick={() => setActivePage("dashboard")} aria-label="Open dashboard">
          <span className="brand-icon">
            <Bot size={27} strokeWidth={2.7} />
          </span>
          <span className="brand-text">StartupCrew</span>
        </button>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="nav-list" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={item.label}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="plan-card">
        <Diamond size={22} />
        <div>
          <h3>Pro Plan</h3>
          <p>Team workspace</p>
        </div>
        <strong>42 / 100 AI tasks used</strong>
        <div className="usage-bar">
          <span />
        </div>
        <button>Upgrade Plan</button>
      </div>

      <div className="profile-card">
        <span>{user?.email?.[0]?.toUpperCase() || "F"}</span>
        <div>
          <strong>Founder</strong>
          <p>{user?.email || "Signed in"}</p>
          <button className="logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
        <ChevronDown size={18} />
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <div className="search-box">
        <Search size={19} />
        <input placeholder="Search everything..." aria-label="Search everything" />
        <kbd>⌘ K</kbd>
      </div>
      <div className="top-actions">
        <button className="top-icon" aria-label="Notifications">
          <Bell size={21} />
        </button>
        <button className="top-icon" aria-label="Calendar">
          <CalendarDays size={21} />
        </button>
        <button className="top-icon" aria-label="AI actions">
          <Sparkles size={21} />
        </button>
        <button className="user-menu" aria-label="User menu">
          <span>F</span>
          <ChevronDown size={17} />
        </button>
      </div>
    </header>
  );
}

function Dashboard({
  openChat,
  boardColumns,
  onAddTask,
  selectedAgent,
  selectedProviderId,
  setSelectedProviderId,
  crewMode,
  setCrewMode,
  providerHasKey,
  messages,
  isFetching,
  message,
  setMessage,
  sendMessage,
}) {
  return (
    <div className="dashboard-layout">
      <section className="dashboard-main">
        <div className="dashboard-title">
          <div>
            <h1>Welcome back, Founder</h1>
            <p>Coordinate your AI startup team in one place.</p>
          </div>
          <button className="black-button">
            <Plus size={19} />
            New Task
          </button>
        </div>

        <div className="agent-grid">
          {agents.slice(0, 6).map((agent) => (
            <DashboardAgentCard agent={agent} key={agent.id} onOpen={() => openChat(agent.id)} />
          ))}
        </div>

        <TaskBoardHeader />
        <KanbanBoard boardColumns={boardColumns} onAddTask={onAddTask} compact />
      </section>

      <AssistantPanel
        agent={selectedAgent}
        selectedProviderId={selectedProviderId}
        setSelectedProviderId={setSelectedProviderId}
        crewMode={crewMode}
        setCrewMode={setCrewMode}
        providerHasKey={providerHasKey}
        messages={messages}
        isFetching={isFetching}
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
}

function DashboardAgentCard({ agent, onOpen }) {
  const Icon = agent.icon;

  return (
    <article className="agent-tile">
      <span className="agent-orb">
        <Icon size={25} />
      </span>
      <div>
        <h3>{agent.name}</h3>
        <p>{agent.role}</p>
        <span className="status-badge">{agent.status}</span>
      </div>
      <button onClick={onOpen} aria-label={`Open ${agent.name}`}>
        <ChevronRight size={22} />
      </button>
    </article>
  );
}

function TaskBoardHeader() {
  return (
    <div className="board-header">
      <h2>Task Board</h2>
      <div className="board-actions">
        <button>
          <Search size={16} />
          Filter
        </button>
        <button>
          Group: Status
          <ChevronDown size={16} />
        </button>
        <button className="square-button" aria-label="More task options">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}

function KanbanBoard({ boardColumns, onAddTask, compact = false }) {
  return (
    <div className={`kanban-board ${compact ? "compact" : ""}`}>
      {boardColumns.map((column) => (
        <section className="kanban-column" key={column.title}>
          <header>
            <div>
              <h3>{column.title}</h3>
              <span>{column.count}</span>
            </div>
            <MoreHorizontal size={18} />
          </header>
          <div className="kanban-tasks">
            {column.tasks.map((task) => (
              <article className="task-card" key={task.title}>
                <div className="task-title">
                  <FileText size={16} />
                  <strong>{task.title}</strong>
                </div>
                <div className="task-meta">
                  <span>{task.tag}</span>
                  {task.done ? (
                    <em className="done-mark">
                      <Check size={15} />
                    </em>
                  ) : (
                    <em>{task.avatar}</em>
                  )}
                </div>
              </article>
            ))}
          </div>
          <button className="add-task" onClick={() => onAddTask(column.title)}>
            <Plus size={17} />
            Add task
          </button>
        </section>
      ))}
    </div>
  );
}

function AssistantPanel({
  agent,
  selectedProviderId,
  setSelectedProviderId,
  crewMode,
  setCrewMode,
  providerHasKey,
  messages,
  isFetching,
  message,
  setMessage,
  sendMessage,
}) {
  const Icon = agent.icon;

  return (
    <aside className="assistant-panel">
      <header className="assistant-header">
        <span className="agent-orb small">
          <Icon size={22} />
        </span>
        <div>
          <h2>{agent.name}</h2>
          <p>
            {agent.role} <span /> {agent.status}
          </p>
          <small className="assistant-description">{agent.shortDescription}</small>
        </div>
        <div className="assistant-tools">
          <Pin size={18} />
          <MoreHorizontal size={19} />
          <X size={19} />
        </div>
      </header>

      <ProviderSelector
        selectedProviderId={selectedProviderId}
        setSelectedProviderId={setSelectedProviderId}
        crewMode={crewMode}
        setCrewMode={setCrewMode}
        providerHasKey={providerHasKey}
        isFetching={isFetching}
      />

      <div className="chat-thread">
        {messages.map((item, index) => (
          <div className={`chat-bubble ${item.from}`} key={`${item.time}-${index}`}>
            <FormattedMessage text={item.text} />
            <time>{item.time}</time>
          </div>
        ))}
        {isFetching && <FetchingBubble agentName={agent.name} />}
      </div>

      <div className="quick-replies">
        {quickReplies.map((reply) => (
          <button key={reply} onClick={() => setMessage(reply)} disabled={isFetching}>
            {reply}
          </button>
        ))}
      </div>

      <form className="chat-input" onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={isFetching ? `${agent.name} is fetching an answer...` : "Ask your agent team anything..."}
          disabled={isFetching}
        />
        <div>
          <span>
            <button type="button" aria-label="Add">
              <Plus size={19} />
            </button>
            <button type="button" aria-label="Attach">
              <Paperclip size={19} />
            </button>
            <button type="button" aria-label="AI tools">
              <Sparkles size={18} />
            </button>
          </span>
          <button className="send-button" type="submit" aria-label="Send" disabled={isFetching}>
            <Send size={19} />
          </button>
        </div>
      </form>
    </aside>
  );
}

function FormattedMessage({ text }) {
  const blocks = parseMessageBlocks(text);

  return (
    <div className="formatted-message">
      {blocks.map((block, index) => {
        if (block.type === "code") {
          return (
            <div className="code-block" key={index}>
              <div className="code-block-header">
                <span>{block.language || "code"}</span>
              </div>
              <pre>
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        if (block.type === "numbered-list") {
          return (
            <ol key={index}>
              {block.items.map((item) => (
                <li key={item}>{renderInlineText(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === "bullet-list") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{renderInlineText(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "heading") {
          return <h4 key={index}>{renderInlineText(block.content)}</h4>;
        }

        return <p key={index}>{renderInlineText(block.content)}</p>;
      })}
    </div>
  );
}

function parseMessageBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      const language = trimmedLine.replace("```", "").trim();
      const codeLines = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      blocks.push({
        type: "code",
        language,
        content: codeLines.join("\n"),
      });
      index += 1;
      continue;
    }

    if (/^#{1,4}\s+/.test(trimmedLine)) {
      blocks.push({
        type: "heading",
        content: trimmedLine.replace(/^#{1,4}\s+/, ""),
      });
      index += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      const items = [];

      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "numbered-list", items });
      continue;
    }

    if (/^[-*]\s+/.test(trimmedLine)) {
      const items = [];

      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "bullet-list", items });
      continue;
    }

    const paragraphLines = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("```") &&
      !/^#{1,4}\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim()) &&
      !/^[-*]\s+/.test(lines[index].trim())
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      content: paragraphLines.join(" "),
    });
  }

  return blocks;
}

function ProviderSelector({ selectedProviderId, setSelectedProviderId, crewMode, setCrewMode, providerHasKey, isFetching }) {
  const selectedProvider = aiProviders.find((provider) => provider.id === selectedProviderId);

  return (
    <section className="provider-selector" aria-label="AI provider selector">
      <div>
        <span>AI Engine</span>
        <strong>{selectedProvider?.name}</strong>
      </div>
      <div className="provider-options">
        {aiProviders.map((provider) => (
          <button
            key={provider.id}
            className={selectedProviderId === provider.id ? "active" : ""}
            type="button"
            onClick={() => setSelectedProviderId(provider.id)}
            disabled={isFetching}
          >
            {provider.name}
          </button>
        ))}
      </div>
      <small className={providerHasKey ? "ready" : "missing"}>
        {providerHasKey ? `${selectedProvider?.shortName} key ready` : `Add ${selectedProvider?.name} API key in .env.local`}
      </small>
      <button
        className={`crew-mode-toggle ${crewMode ? "active" : ""}`}
        type="button"
        onClick={() => setCrewMode(!crewMode)}
        disabled={isFetching}
      >
        <span>{crewMode ? "Crew Mode On" : "Crew Mode Off"}</span>
        <small>{crewMode ? "All agents will answer together" : "Only selected agent answers"}</small>
      </button>
    </section>
  );
}

function renderInlineText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code className="inline-code" key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}

function FetchingBubble({ agentName }) {
  return (
    <div className="chat-bubble agent fetching-bubble">
      <div className="fetching-row">
        <span />
        <span />
        <span />
        <p>{agentName} is fetching an answer...</p>
      </div>
    </div>
  );
}

function AgentsPage({ openChat }) {
  return (
    <section className="content-page">
      <PageHeader title="Agents" text="Specialist AI teammates for every startup workflow." />
      <div className="directory-grid">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <article className="directory-card" key={agent.id}>
              <span className="agent-orb">
                <Icon size={24} />
              </span>
              <h3>{agent.name}</h3>
              <p className="role">{agent.role}</p>
              <p>{agent.shortDescription}</p>
              <div className="skill-row">
                {agent.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              <button className="outline-button" onClick={() => openChat(agent.id)}>
                Open Chat
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TasksPage({ boardColumns, onAddTask }) {
  return (
    <section className="content-page">
      <PageHeader title="Tasks" text="A startup task board for research, design, engineering, marketing, and fundraising." />
      <TaskBoardHeader />
      <KanbanBoard boardColumns={boardColumns} onAddTask={onAddTask} />
    </section>
  );
}

function ProjectsPage() {
  return (
    <section className="content-page">
      <PageHeader title="Projects" text="Track the big workstreams your AI crew is helping move forward." />
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <Folder size={24} />
            <h3>{project.title}</h3>
            <p>{project.detail}</p>
            <div className="progress">
              <span style={{ width: `${project.progress}%` }} />
            </div>
            <footer>
              <span>{project.owner}</span>
              <strong>{project.progress}%</strong>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function DocumentsPage() {
  return (
    <section className="content-page">
      <PageHeader title="Documents" text="Core strategy, finance, research, and fundraising documents." />
      <div className="document-grid">
        {documents.map((doc) => {
          const Icon = doc.icon;
          return (
            <article className="document-card" key={doc.title}>
              <span>
                <Icon size={22} />
              </span>
              <div>
                <h3>{doc.title}</h3>
                <p>{doc.type}</p>
                <small>{doc.updated}</small>
              </div>
              <ChevronRight size={20} />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AgentChatPage({
  selectedAgent,
  setSelectedAgentId,
  selectedProviderId,
  setSelectedProviderId,
  crewMode,
  setCrewMode,
  providerHasKey,
  messages,
  isFetching,
  message,
  setMessage,
  sendMessage,
}) {
  return (
    <div className="chat-page-layout">
      <aside className="chat-agent-list">
        <h2>Chat</h2>
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <button
              className={selectedAgent.id === agent.id ? "selected" : ""}
              onClick={() => setSelectedAgentId(agent.id)}
              key={agent.id}
            >
              <span className="agent-orb tiny">
                <Icon size={18} />
              </span>
              <span>
                <strong>{agent.name}</strong>
                <small>{agent.role}</small>
              </span>
            </button>
          );
        })}
      </aside>
      <AssistantPanel
        agent={selectedAgent}
        selectedProviderId={selectedProviderId}
        setSelectedProviderId={setSelectedProviderId}
        crewMode={crewMode}
        setCrewMode={setCrewMode}
        providerHasKey={providerHasKey}
        messages={messages}
        isFetching={isFetching}
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
}

function AnalyticsPage() {
  const metrics = [
    ["Tasks Completed", "18"],
    ["Agent Replies", "142"],
    ["Docs Created", "9"],
    ["Launch Readiness", "72%"],
  ];

  return (
    <section className="content-page">
      <PageHeader title="Analytics" text="Lightweight operating metrics for the StartupCrew workspace." />
      <div className="metric-grid">
        {metrics.map(([label, value]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ user, onLogout, projectMemory, updateProjectMemory }) {
  const memoryFields = [
    ["startup_idea", "Startup idea"],
    ["target_users", "Target users"],
    ["tech_stack", "Tech stack"],
    ["design_rules", "Design rules"],
    ["current_goals", "Current goals"],
    ["notes", "Notes"],
  ];

  const handleMemoryChange = (field, value) => {
    updateProjectMemory({
      ...projectMemory,
      [field]: value,
    });
  };

  return (
    <section className="content-page">
      <PageHeader title="Settings" text="Manage profile, workspace theme, and agent preferences." />
      <div className="settings-grid">
        <article className="settings-card">
          <Settings size={23} />
          <div>
            <h3>Profile</h3>
            <p>{user?.email || "Signed in founder"}</p>
          </div>
          <button className="outline-button" onClick={onLogout}>
            Log out
          </button>
        </article>
        <article className="settings-card">
          <Sparkles size={23} />
          <div>
            <h3>Theme</h3>
            <p>StartupCrew light dashboard style.</p>
          </div>
          <button className="outline-button">Manage</button>
        </article>
        <article className="settings-card">
          <Bot size={23} />
          <div>
            <h3>Agent preferences</h3>
            <p>Agent prompts and project memory are used when generating responses.</p>
          </div>
          <button className="outline-button">Manage</button>
        </article>
        <article className="memory-card">
          <div>
            <h3>Project memory</h3>
            <p>Saved to Supabase for this account and used as context for your AI agents.</p>
          </div>
          <div className="memory-fields">
            {memoryFields.map(([field, label]) => (
              <label key={field}>
                {label}
                <textarea
                  value={projectMemory?.[field] || ""}
                  onChange={(event) => handleMemoryChange(field, event.target.value)}
                  rows={field === "notes" ? 4 : 2}
                />
              </label>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function PageHeader({ title, text }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <p>{text}</p>
    </header>
  );
}

export default App;
