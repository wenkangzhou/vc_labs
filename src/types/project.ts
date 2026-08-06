export type ProjectStatus =
  | "building"
  | "available"
  | "experimental"
  | "paused"
  | "archived"
  | "incubating";

export type ProjectLink = {
  type: "product" | "github" | "demo" | "article";
  label: string;
  url: string;
};

export type Project = {
  id: string;
  name: string;
  englishName?: string;
  shortDescription: string;
  description: string;
  motivation: string;
  category: string[];
  tags: string[];
  status: ProjectStatus;
  featured?: boolean;
  favorite?: boolean;
  private?: boolean;
  priority?: number;
  techStack: string[];
  cover?: string;
  qrCode?: string;
  mark: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  note?: string;
  links: ProjectLink[];
  limitation?: string;
};
