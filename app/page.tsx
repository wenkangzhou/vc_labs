"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { projects } from "../src/data/projects";
import type { Project, ProjectLink } from "../src/types/project";

type Theme = "dark" | "light";

const primaryLink = (project: Project): ProjectLink | undefined =>
  project.links.find(
    (link) =>
      link.type === "product" ||
      link.type === "demo" ||
      link.type === "github",
  );

function BrandMark() {
  return (
    <span className="brand-mark">
      <Image src="/brand-mark.png" alt="" width={38} height={38} priority />
    </span>
  );
}

function ProjectTile({
  project,
  index,
  onOpenQr,
}: {
  project: Project;
  index: number;
  onOpenQr: (project: Project) => void;
}) {
  const tileRef = useRef<HTMLElement>(null);
  const link = primaryLink(project);
  const isFeatured = index < 2;
  const tileStyle = {
    "--accent": project.theme,
    "--delay": `${index * 35}ms`,
  } as CSSProperties;

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const tile = tileRef.current;
    if (!tile) return;

    const rect = tile.getBoundingClientRect();
    tile.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    tile.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  const content = (
    <>
      <span className="tile-spotlight" aria-hidden="true" />
      {isFeatured && (
        <span className="tile-orbit" aria-hidden="true">
          <i />
          <i />
        </span>
      )}

      <span className="tile-topline">
        <span>{project.englishName ?? project.id}</span>
        <span className="tile-open-label">{link ? "OPEN" : "WECHAT"}</span>
      </span>

      <span className="tile-copy">
        <strong>{project.name}</strong>
        <span>{project.shortDescription}</span>
      </span>

      <span className="tile-footer">
        <span className="tile-categories">
          {project.category.slice(0, 2).map((category) => (
            <span key={category}>{category}</span>
          ))}
        </span>
        <span className="tile-arrow" aria-hidden="true">
          ↗
        </span>
      </span>
    </>
  );

  return (
    <article
      ref={tileRef}
      className={`project-tile ${isFeatured ? "project-tile-featured" : ""}`}
      style={tileStyle}
      onPointerMove={handlePointerMove}
    >
      {link ? (
        <a
          className="tile-hit-area"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`打开 ${project.name}`}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          className="tile-hit-area"
          onClick={() => onOpenQr(project)}
          aria-label={`查看 ${project.name} 微信小程序二维码`}
        >
          {content}
        </button>
      )}
    </article>
  );
}

function QrDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="dialog-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="qr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-dialog-title"
        tabIndex={-1}
        style={{ "--accent": project.theme } as CSSProperties}
      >
        <button type="button" className="dialog-close" onClick={onClose} aria-label="关闭二维码">
          ×
        </button>
        <div className="qr-dialog-copy">
          <span>{project.englishName}</span>
          <h2 id="qr-dialog-title">{project.name}</h2>
          <p>使用微信扫码打开小程序</p>
        </div>
        {project.qrCode && (
          <div className="qr-frame">
            <Image src={project.qrCode} alt={`${project.name}微信小程序二维码`} width={244} height={244} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [qrProject, setQrProject] = useState<Project | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedTheme = window.localStorage.getItem("launchpad-theme");
        const nextTheme: Theme = storedTheme === "\"light\"" ? "light" : "dark";
        setTheme(nextTheme);
        document.documentElement.dataset.theme = nextTheme;
      } catch {
        document.documentElement.dataset.theme = "dark";
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const visibleProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (a.priority || b.priority) return (a.priority ?? 99) - (b.priority ?? 99);
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      }),
    [],
  );

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      window.localStorage.setItem("launchpad-theme", JSON.stringify(next));
      return next;
    });
  }, []);

  const closeQr = useCallback(() => setQrProject(null), []);
  const openQr = useCallback((project: Project) => setQrProject(project), []);

  return (
    <main className="project-dock">
      <div className="page-noise" aria-hidden="true" />

      <header className="dock-bar page-width">
        <Link href="/" className="dock-brand" aria-label="Chou's Vibe Projects 首页">
          <BrandMark />
        </Link>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
        >
          <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
        </button>
      </header>

      <section className="projects page-width" aria-labelledby="projects-heading">
        <div className="projects-heading">
          <div>
            <span>VIBE CODING</span>
            <h1 id="projects-heading">Projects</h1>
          </div>
          <p>Pick one. Open it.</p>
        </div>

        <div className="project-grid">
          {visibleProjects.map((project, index) => (
            <ProjectTile key={project.id} project={project} index={index} onOpenQr={openQr} />
          ))}
        </div>
      </section>

      <footer className="dock-footer page-width">
        <span>CHOU / LAB</span>
        <a href="https://github.com/wenkangzhou" target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
      </footer>

      {qrProject && <QrDialog project={qrProject} onClose={closeQr} />}
    </main>
  );
}
