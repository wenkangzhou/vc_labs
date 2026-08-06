"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { launchpadCopy, projects } from "../src/data/projects";
import type { Project } from "../src/types/project";

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

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? "brand-mark-small" : ""}`}>
      <Image src="/brand-mark.png" alt="" width={small ? 27 : 42} height={small ? 27 : 42} priority={!small} />
    </span>
  );
}

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (project: Project) => void;
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
  onClose,
  onOpenProject,
  onCopy,
  onPrevious,
  onNext,
}: {
  project: Project;
  onClose: () => void;
  onOpenProject: (project: Project) => void;
  onCopy: (url: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const productLink = project.links.find((link) => link.type === "product" || link.type === "demo" || link.type === "github");

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
        </div>

        <div className="detail-body">
          <div className="detail-main-copy">
            <p className="detail-description">{project.description}</p>
            <div className="detail-note">
              <span>WHY IT EXISTS</span>
              <p>“{project.motivation}”</p>
            </div>
          </div>
          {project.qrCode ? (
            <div className="detail-qr-card">
              <Image src={project.qrCode} alt="biu_calendar 微信小程序二维码" width={132} height={132} />
              <span>SCAN WITH WECHAT</span>
              <small>打开 biu_calendar</small>
            </div>
          ) : (
            <div className="detail-signal-card">
              <span>BUILD SIGNAL</span>
              <strong>{project.progress ?? 0}%</strong>
              <div className="signal-lines"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
          )}
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
                {productLink.type === "github" ? "打开 Release" : "打开项目"} <span>↗</span>
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

export default function Home() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
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
  }, [updateUrl]);

  const closeDetail = useCallback(() => {
    setActiveProject(null);
    updateUrl(null);
  }, [updateUrl]);

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
    const link = project.links.find((candidate) => candidate.type === "product" || candidate.type === "demo" || candidate.type === "github");
    if (link) openInNewTab(link.url);
    else showToast("这个节点还在实验室里，入口尚未公开");
  };

  const visibleProjects = useMemo(() => [...projects].sort((a, b) => {
      if (a.priority || b.priority) return (a.priority ?? 99) - (b.priority ?? 99);
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    }), []);

  const moveDetail = (direction: 1 | -1) => {
    if (!activeProject) return;
    const currentIndex = projects.findIndex((project) => project.id === activeProject.id);
    const nextIndex = (currentIndex + direction + projects.length) % projects.length;
    openDetail(projects[nextIndex]);
  };

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
        <div className="header-status"><i /> SYSTEM ONLINE</div>
        <div className="header-actions">
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
        </div>
        <div className="hero-instrument" aria-label="实验室项目状态概览">
          <div className="instrument-topline"><span>LAB STATUS / 2026</span><span>LIVE FEED <i /></span></div>
          <div className="instrument-core">
            <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit orbit-c" />
            <div className="core-node"><BrandMark small /><span>∞</span></div>
            <i className="orbit-node node-one" /><i className="orbit-node node-two" /><i className="orbit-node node-three" />
            <span className="instrument-label label-one">IDEAS / OPEN</span>
            <span className="instrument-label label-two">SHIPPED / LIVE</span>
            <span className="instrument-label label-three">NEXT / ?</span>
          </div>
          <div className="instrument-bottomline"><span>KEEP MAKING</span><span>● ● ● ○ ○</span></div>
        </div>
      </section>

      <section className="projects-section page-width" aria-labelledby="projects-heading">
        <div className="section-header"><div><p className="eyebrow"><span className="eyebrow-line" />ACTIVE CONSTELLATION</p><h2 id="projects-heading">Project nodes</h2></div><p className="section-aside">每一个项目都是一个正在运行的实验。<br />点击节点，查看它的完整轨迹。</p></div>
        <div className="project-grid">
          {visibleProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onOpen={openDetail} />)}
        </div>
      </section>

      <footer className="site-footer page-width"><div className="footer-brand"><BrandMark small /><div><strong>CHOU&apos;S INFINITE LABS</strong><p>{launchpadCopy.footer}</p></div></div><div className="footer-links"><a href="https://github.com/wenkangzhou" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><span>BUILT WITH AI + CURIOSITY</span></div><div className="footer-base"><span>© 2026 / ALL EXPERIMENTS RESERVED</span><span>LAUNCHPAD v1.0.0</span></div></footer>

      {activeProject && <DetailPanel project={activeProject} onClose={closeDetail} onOpenProject={openProject} onCopy={copyLink} onPrevious={() => moveDetail(-1)} onNext={() => moveDetail(1)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
