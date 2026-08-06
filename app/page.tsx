"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { activities } from "../src/data/activities";
import {
  launchpadCopy,
  projectCategories,
  projects,
  statusMeta,
} from "../src/data/projects";
import type { Project, ProjectStatus } from "../src/types/project";

const statusFilters: Array<"all" | ProjectStatus> = [
  "all",
  "building",
  "available",
  "experimental",
  "incubating",
];

const statusFilterLabels: Record<"all" | ProjectStatus, string> = {
  all: "全部",
  building: "正在开发",
  available: "可用",
  experimental: "实验中",
  paused: "暂停",
  archived: "已归档",
  incubating: "孵化中",
};

const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

function readStored<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function Kbd({ children }: { children: string }) {
  return <kbd className="kbd">{children}</kbd>;
}

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? "brand-mark-small" : ""}`}>
      <Image src="/brand-mark.png" alt="" width={small ? 27 : 42} height={small ? 27 : 42} priority={!small} />
    </span>
  );
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const meta = statusMeta[status];
  return (
    <span className={`status-pill status-${meta.tone}`}>
      <i aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function ProjectCard({
  project,
  index,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: {
  project: Project;
  index: number;
  isFavorite: boolean;
  onOpen: (project: Project) => void;
  onToggleFavorite: (event: MouseEvent<HTMLButtonElement>, id: string) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const cardStyle = { "--accent": project.theme, "--delay": `${index * 38}ms` } as CSSProperties;

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(project);
    }
  };

  const isCompact = index > 5 && !project.featured;
  return (
    <div
      ref={cardRef}
      role="button"
      className={`project-card ${project.featured ? "project-card-featured" : ""} ${
        isCompact ? "project-card-compact" : ""
      }`}
      style={cardStyle}
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      aria-label={`打开 ${project.name} 项目详情`}
    >
      <div className="card-spotlight" aria-hidden="true" />
      <div className="project-card-topline">
        <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="project-updated">UPDATED {project.updatedAt}</span>
        <button
          type="button"
          className={`favorite-button ${isFavorite ? "is-favorite" : ""}`}
          aria-label={isFavorite ? `取消收藏 ${project.name}` : `收藏 ${project.name}`}
          aria-pressed={isFavorite}
          onClick={(event) => onToggleFavorite(event, project.id)}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      <div className="project-card-heading">
        <span className="project-glyph" style={{ "--accent": project.theme } as CSSProperties}>
          {project.mark}
        </span>
        <div>
          <h3>{project.name}</h3>
          {project.englishName && <p>{project.englishName}</p>}
        </div>
      </div>

      <p className="project-description">{project.shortDescription}</p>

      <div className="project-card-footer">
        <StatusPill status={project.status} />
        <div className="project-categories">
          {project.category.slice(0, 2).map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
        <span className="project-arrow" aria-hidden="true">
          ↗
        </span>
      </div>

      {project.featured && (
        <div className="project-progress">
          <div className="progress-label">
            <span>PROJECT SIGNAL</span>
            <span>{project.progress}%</span>
          </div>
          <div className="progress-track">
            <span style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailPanel({
  project,
  favorite,
  onClose,
  onOpenProject,
  onToggleFavorite,
  onCopy,
  onPrevious,
  onNext,
}: {
  project: Project;
  favorite: boolean;
  onClose: () => void;
  onOpenProject: (project: Project) => void;
  onToggleFavorite: (id: string) => void;
  onCopy: (url: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const productLink = project.links.find((link) => link.type === "product" || link.type === "demo");

  useEffect(() => {
    panelRef.current?.focus();
  }, [project.id]);

  useEffect(() => {
    const handlePanelKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handlePanelKey);
    return () => window.removeEventListener("keydown", handlePanelKey);
  }, [onClose, onNext, onPrevious, project.id]);

  return (
    <div className="detail-layer" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        tabIndex={-1}
        ref={panelRef}
        style={{ "--accent": project.theme } as CSSProperties}
      >
        <div className="detail-orbit" aria-hidden="true"><span /><span /><span /></div>
        <header className="detail-header">
          <div className="detail-kicker">
            <span>PROJECT NODE / {project.id.toUpperCase()}</span>
            <StatusPill status={project.status} />
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label="关闭项目详情">
            ×
          </button>
        </header>

        <div className="detail-title-row">
          <span className="detail-glyph">{project.mark}</span>
          <div>
            <h2 id="detail-title">{project.name}</h2>
            {project.englishName && <p>{project.englishName}</p>}
          </div>
          <button
            type="button"
            className={`detail-favorite ${favorite ? "is-favorite" : ""}`}
            aria-label={favorite ? "取消收藏" : "收藏项目"}
            aria-pressed={favorite}
            onClick={() => onToggleFavorite(project.id)}
          >
            {favorite ? "★" : "☆"}
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-main-copy">
            <p className="detail-description">{project.description}</p>
            <div className="detail-note">
              <span>WHY IT EXISTS</span>
              <p>“{project.motivation}”</p>
            </div>
          </div>
          <div className="detail-signal-card">
            <span>BUILD SIGNAL</span>
            <strong>{project.progress ?? 0}%</strong>
            <div className="signal-lines"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <small>{statusMeta[project.status].short} / {project.updatedAt}</small>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-section">
            <span className="detail-label">CORE FUNCTION</span>
            <p>{project.shortDescription}</p>
          </div>
          <div className="detail-section">
            <span className="detail-label">TECH STACK</span>
            <div className="detail-tags">
              {project.techStack.map((tech) => <span key={tech}>{tech}</span>)}
            </div>
          </div>
          <div className="detail-section">
            <span className="detail-label">CATEGORIES</span>
            <div className="detail-tags">
              {project.category.map((category) => <span key={category}>{category}</span>)}
            </div>
          </div>
          <div className="detail-section">
            <span className="detail-label">TIMELINE</span>
            <p>{project.createdAt} — {project.updatedAt}</p>
          </div>
        </div>

        {(project.note || project.limitation) && (
          <div className="detail-bottom-note">
            <span>LAB NOTE</span>
            <p>{project.note ?? project.limitation}</p>
          </div>
        )}

        <footer className="detail-footer">
          <div className="detail-navigation">
            <button type="button" onClick={onPrevious} aria-label="上一个项目">← <span>PREV</span></button>
            <button type="button" onClick={onNext} aria-label="下一个项目"><span>NEXT</span> →</button>
          </div>
          <div className="detail-actions">
            {productLink ? (
              <button type="button" className="button button-primary" onClick={() => onOpenProject(project)}>
                打开项目 <span>↗</span>
              </button>
            ) : <span className="detail-private-label">ACCESS / BUILD IN PROGRESS</span>}
            {productLink && (
              <button type="button" className="button button-quiet" onClick={() => onCopy(productLink.url)}>
                复制地址
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

type Command = { id: string; label: string; hint: string; action: string; icon: string };

function CommandPalette({
  query,
  setQuery,
  index,
  setIndex,
  onClose,
  onAction,
  favoriteIds,
}: {
  query: string;
  setQuery: (value: string) => void;
  index: number;
  setIndex: (value: number) => void;
  onClose: () => void;
  onAction: (action: string) => void;
  favoriteIds: string[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const commands = useMemo<Command[]>(() => [
    { id: "all", label: "查看全部项目", hint: "RESET FILTERS", action: "all", icon: "⌘" },
    { id: "building", label: "只看正在开发", hint: "STATUS / BUILDING", action: "building", icon: "◉" },
    { id: "favorites", label: "查看收藏项目", hint: `${favoriteIds.length} SAVED`, action: "favorites", icon: "★" },
    { id: "recent", label: "查看最近访问", hint: "RECENT NODES", action: "recent", icon: "↺" },
    { id: "theme", label: "切换深浅主题", hint: "APPEARANCE", action: "theme", icon: "◐" },
    { id: "github", label: "打开 GitHub", hint: "EXTERNAL LINK", action: "github", icon: "↗" },
    ...projects.map((project) => ({
      id: project.id,
      label: project.name,
      hint: `${statusMeta[project.status].short} / ${project.category[0]}`,
      action: `project:${project.id}`,
      icon: project.mark,
    })),
  ], [favoriteIds.length]);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return commands;
    return commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(normalizedQuery));
  }, [commands, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (index >= filteredCommands.length) setIndex(Math.max(filteredCommands.length - 1, 0));
  }, [filteredCommands.length, index, setIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((index + 1) % Math.max(filteredCommands.length, 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((index - 1 + filteredCommands.length) % Math.max(filteredCommands.length, 1));
    }
    if (event.key === "Enter" && filteredCommands[index]) {
      event.preventDefault();
      onAction(filteredCommands[index].action);
    }
    if (event.key === "Escape") onClose();
  };

  return (
    <div className="command-layer" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="command-panel" role="dialog" aria-modal="true" aria-label="项目命令面板">
        <div className="command-input-row">
          <span className="command-search-icon">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="搜索项目或执行命令..."
            aria-label="搜索项目或执行命令"
          />
          <Kbd>ESC</Kbd>
        </div>
        <div className="command-heading"><span>QUICK ACTIONS</span><span>{filteredCommands.length} RESULTS</span></div>
        <div className="command-list" role="listbox" aria-label="命令结果">
          {filteredCommands.map((command, commandIndex) => (
            <button
              type="button"
              role="option"
              aria-selected={commandIndex === index}
              className={`command-item ${commandIndex === index ? "is-selected" : ""}`}
              key={command.id}
              onMouseEnter={() => setIndex(commandIndex)}
              onClick={() => onAction(command.action)}
            >
              <span className="command-item-icon">{command.icon}</span>
              <span className="command-item-label">{command.label}</span>
              <span className="command-item-hint">{command.hint}</span>
              {commandIndex === index && <span className="command-enter">↵</span>}
            </button>
          ))}
          {!filteredCommands.length && <div className="command-empty">没有匹配的项目节点。</div>}
        </div>
        <div className="command-footer"><span><Kbd>↑↓</Kbd> NAVIGATE</span><span><Kbd>↵</Kbd> SELECT</span><span><Kbd>⌘K</Kbd> TOGGLE</span></div>
      </div>
    </div>
  );
}

export default function Home() {
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("全部");
  const [tagFilter, setTagFilter] = useState("全部");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [commandIndex, setCommandIndex] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readStored<string[]>("launchpad-favorites", projects.filter((project) => project.favorite).map((project) => project.id)));
  const [recentIds, setRecentIds] = useState<string[]>(() => readStored<string[]>("launchpad-recents", []));
  const [specialFilter, setSpecialFilter] = useState<"all" | "favorites" | "recent">("all");
  const [theme, setTheme] = useState<"dark" | "light">(() => readStored<"dark" | "light">("launchpad-theme", "dark"));
  const [toast, setToast] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get("project");
    const project = projects.find((candidate) => candidate.id === projectId);
    if (!project) return;
    const frame = window.requestAnimationFrame(() => setActiveProject(project));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (toast) {
      const timeout = window.setTimeout(() => setToast(""), 2200);
      return () => window.clearTimeout(timeout);
    }
  }, [toast]);

  const updateUrl = useCallback((project: Project | null) => {
    const url = new URL(window.location.href);
    if (project) url.searchParams.set("project", project.id);
    else url.searchParams.delete("project");
    window.history.replaceState({}, "", url);
  }, []);

  const openDetail = useCallback((project: Project) => {
    setActiveProject(project);
    updateUrl(project);
    setRecentIds((current) => {
      const next = [project.id, ...current.filter((id) => id !== project.id)].slice(0, 5);
      window.localStorage.setItem("launchpad-recents", JSON.stringify(next));
      return next;
    });
  }, [updateUrl]);

  const closeDetail = useCallback(() => {
    setActiveProject(null);
    updateUrl(null);
  }, [updateUrl]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [id, ...current];
      window.localStorage.setItem("launchpad-favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleCardFavorite = useCallback((event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation();
    toggleFavorite(id);
  }, [toggleFavorite]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      window.localStorage.setItem("launchpad-theme", JSON.stringify(next));
      return next;
    });
  }, []);

  const showToast = (message: string) => setToast(message);

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("项目地址已复制");
    } catch {
      showToast("复制失败，请手动复制地址");
    }
  };

  const openProject = (project: Project) => {
    const link = project.links.find((candidate) => candidate.type === "product" || candidate.type === "demo");
    if (link) openInNewTab(link.url);
    else showToast("这个节点还在实验室里，入口尚未公开");
  };

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return projects.filter((project) => {
      const searchable = [project.name, project.englishName, project.shortDescription, project.description, ...project.category, ...project.tags, ...project.techStack].filter(Boolean).join(" ").toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesCategory = categoryFilter === "全部" || project.category.includes(categoryFilter);
      const matchesTag = tagFilter === "全部" || project.tags.includes(tagFilter);
      const matchesSpecial = specialFilter === "all" || (specialFilter === "favorites" ? favoriteIds.includes(project.id) : recentIds.includes(project.id));
      return matchesSearch && matchesStatus && matchesCategory && matchesTag && matchesSpecial;
    }).sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }, [categoryFilter, favoriteIds, recentIds, search, specialFilter, statusFilter, tagFilter]);

  const allTags = useMemo(() => ["全部", ...Array.from(new Set(projects.flatMap((project) => project.tags))).sort()], []);
  const buildingCount = projects.filter((project) => project.status === "building").length;
  const latestDate = projects.map((project) => project.updatedAt).sort().at(-1) ?? "2026.08.05";
  const recentProjects = recentIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean) as Project[];
  const isFiltered = Boolean(search || statusFilter !== "all" || categoryFilter !== "全部" || tagFilter !== "全部" || specialFilter !== "all");

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("全部");
    setTagFilter("全部");
    setSpecialFilter("all");
  };

  const handleCommandAction = (action: string) => {
    setCommandOpen(false);
    setCommandQuery("");
    setCommandIndex(0);
    if (action === "all") clearFilters();
    if (action === "building") { clearFilters(); setStatusFilter("building"); }
    if (action === "favorites") {
      clearFilters();
      setSearch("");
      setSpecialFilter("favorites");
      showToast(`${favoriteIds.length} 个收藏项目已标记`);
    }
    if (action === "recent") {
      clearFilters();
      setSearch("");
      setSpecialFilter("recent");
      showToast(recentIds.length ? "最近访问节点已回到顶部" : "还没有最近访问记录");
    }
    if (action === "theme") toggleTheme();
    if (action === "github") showToast("GitHub 入口将在下一版接入");
    if (action.startsWith("project:")) {
      const project = projects.find((candidate) => candidate.id === action.replace("project:", ""));
      if (project) openDetail(project);
    }
  };

  const moveDetail = (direction: 1 | -1) => {
    if (!activeProject) return;
    const currentIndex = projects.findIndex((project) => project.id === activeProject.id);
    const nextIndex = (currentIndex + direction + projects.length) % projects.length;
    openDetail(projects[nextIndex]);
  };

  useEffect(() => {
    const handleGlobalKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (event.key === "/" && !isTyping && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") {
        if (commandOpen) setCommandOpen(false);
        else if (activeProject) closeDetail();
        else if (search) setSearch("");
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [activeProject, closeDetail, commandOpen, search]);

  return (
    <main className="launchpad-shell">
      <div className="ambient-glow ambient-glow-one" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-two" aria-hidden="true" />
      <div className="noise-layer" aria-hidden="true" />

      <header className="site-header page-width">
        <Link className="brand-lockup" href="/" aria-label="返回无限实验室首页">
          <BrandMark />
          <span className="brand-copy"><strong>CHOU&apos;S</strong><span>INFINITE LABS</span></span>
        </Link>
        <div className="header-status"><i /> SYSTEM ONLINE <span>·</span> {projects.length} NODES</div>
        <div className="header-actions">
          <button type="button" className="icon-button" onClick={() => setCommandOpen(true)} aria-label="打开命令面板"><span>⌘K</span></button>
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="切换深浅主题" aria-pressed={theme === "light"}>
            <span>{theme === "dark" ? "☼" : "☾"}</span><b>{theme === "dark" ? "DARK" : "LIGHT"}</b>
          </button>
        </div>
      </header>

      <section className="hero page-width">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />{launchpadCopy.eyebrow}</p>
          <h1>Things <em>I</em> build<span className="title-dot">.</span></h1>
          <p className="hero-intro">{launchpadCopy.intro}</p>
          <div className="hero-meta">
            <div><strong>{projects.length}</strong><span>PROJECT NODES</span></div>
            <div><strong>{buildingCount}</strong><span>IN DEVELOPMENT</span></div>
            <div><strong>{latestDate}</strong><span>LAST SIGNAL</span></div>
          </div>
        </div>
        <div className="hero-instrument" aria-label="实验室项目状态概览">
          <div className="instrument-topline"><span>LAB STATUS / 2026</span><span>LIVE FEED <i /></span></div>
          <div className="instrument-core">
            <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
            <div className="core-node"><BrandMark small /><span>∞</span></div>
            <i className="orbit-node node-one" /><i className="orbit-node node-two" /><i className="orbit-node node-three" />
            <span className="instrument-label label-one">IDEAS / 12</span>
            <span className="instrument-label label-two">SHIPPED / 07</span>
            <span className="instrument-label label-three">NEXT / ?</span>
          </div>
          <div className="instrument-bottomline"><span>KEEP MAKING</span><span>● ● ● ○ ○</span></div>
        </div>
      </section>

      <section className="tools-section page-width" aria-label="项目搜索与筛选">
        <div className="search-row">
          <div className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input ref={searchRef} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索项目、技术栈、标签..." aria-label="搜索项目、技术栈、标签" />
            {search && <button type="button" className="clear-search" onClick={() => setSearch("")} aria-label="清除搜索">×</button>}
            <span className="search-hint"><Kbd>/</Kbd><span>SEARCH</span></span>
          </div>
          <button type="button" className={`filter-toggle ${filterOpen ? "is-open" : ""}`} onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen}>
            <span>FILTERS</span><span className="filter-count">{isFiltered ? "●" : ""}</span><span>⌄</span>
          </button>
        </div>
        <div className={`filter-panel ${filterOpen ? "is-open" : ""}`}>
          <div className="filter-group"><span>STATUS</span><div className="filter-chips">
            {statusFilters.map((status) => <button key={status} type="button" className={statusFilter === status ? "is-active" : ""} onClick={() => setStatusFilter(status)}>{status === "all" ? "全部" : statusFilterLabels[status]}</button>)}
          </div></div>
          <div className="filter-group"><span>TYPE</span><div className="filter-chips">
            {projectCategories.map((category) => <button key={category} type="button" className={categoryFilter === category ? "is-active" : ""} onClick={() => setCategoryFilter(category)}>{category}</button>)}
          </div></div>
          <div className="filter-group"><span>TAGS</span><div className="filter-chips tag-chips">
            {allTags.slice(0, 12).map((tag) => <button key={tag} type="button" className={tagFilter === tag ? "is-active" : ""} onClick={() => setTagFilter(tag)}>{tag}</button>)}
          </div></div>
        </div>
        {recentProjects.length > 0 && (
          <div className="recent-strip"><span className="recent-strip-label">RECENTLY VISITED</span>{recentProjects.map((project) => <button type="button" key={project.id} onClick={() => openDetail(project)}><i style={{ background: project.theme }} />{project.name}<span>↗</span></button>)}</div>
        )}
      </section>

      <section className="projects-section page-width" aria-labelledby="projects-heading">
        <div className="section-header"><div><p className="eyebrow"><span className="eyebrow-line" />ACTIVE CONSTELLATION</p><h2 id="projects-heading">Project nodes <span>{String(filteredProjects.length).padStart(2, "0")}</span></h2></div><p className="section-aside">每一个项目都是一个正在运行的实验。<br />点击节点，查看它的完整轨迹。</p></div>
        {filteredProjects.length ? (
          <div className="project-grid">
            {filteredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} isFavorite={favoriteIds.includes(project.id)} onOpen={openDetail} onToggleFavorite={handleCardFavorite} />)}
          </div>
        ) : (
          <div className="empty-state"><span>⌁</span><h3>没有找到这个实验节点</h3><p>试试换一个关键词，或者清除当前筛选。</p><button type="button" className="button button-primary" onClick={clearFilters}>查看全部项目</button></div>
        )}
      </section>

      <section className="activity-section page-width" aria-labelledby="activity-heading">
        <div className="section-header activity-header"><div><p className="eyebrow"><span className="eyebrow-line" />SIGNAL LOG</p><h2 id="activity-heading">Recent activity <span>LIVE</span></h2></div><p className="section-aside">项目会变，想法会移动。<br />这里记录最近留下的信号。</p></div>
        <div className="activity-list">{activities.map((activity) => <button type="button" className="activity-item" key={`${activity.date}-${activity.projectId}`} onClick={() => { const project = projects.find((candidate) => candidate.id === activity.projectId); if (project) openDetail(project); }}><span className="activity-date">{activity.date}</span><span className={`activity-dot dot-${activity.tone}`} /><span className="activity-copy"><strong>{activity.label}</strong><small>{activity.detail}</small></span><span className="activity-arrow">↗</span></button>)}</div>
      </section>

      <footer className="site-footer page-width"><div className="footer-brand"><BrandMark small /><div><strong>CHOU&apos;S INFINITE LABS</strong><p>{launchpadCopy.footer}</p></div></div><div className="footer-links"><a href="mailto:hello@yibuu.com">EMAIL ↗</a><a href="https://github.com" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><span>BUILT WITH AI + CURIOSITY</span></div><div className="footer-base"><span>© 2026 / ALL EXPERIMENTS RESERVED</span><span>LAUNCHPAD v1.0.0</span></div></footer>

      {activeProject && <DetailPanel project={activeProject} favorite={favoriteIds.includes(activeProject.id)} onClose={closeDetail} onOpenProject={openProject} onToggleFavorite={toggleFavorite} onCopy={copyLink} onPrevious={() => moveDetail(-1)} onNext={() => moveDetail(1)} />}
      {commandOpen && <CommandPalette query={commandQuery} setQuery={setCommandQuery} index={commandIndex} setIndex={setCommandIndex} onClose={() => setCommandOpen(false)} onAction={handleCommandAction} favoriteIds={favoriteIds} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
