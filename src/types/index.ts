import type { ReactNode } from "react";

export interface NavLink {
  id: number;
  link: string;
}

export interface AboutItem {
  text: string;
}

export interface Certification {
  id: number;
  img: string;
  src: string;
  title: string;
}

export interface Skill {
  id: number;
  src: string;
  title: string;
  style: string;
  level: string;
}

export type SkillCategory = "Frontend" | "Backend" | "Databases" | "Tools";

export type Skills = Record<SkillCategory, Skill[]>;

export interface PortfolioSummary {
  id: number;
  src: string;
  title: string;
  techs: string[];
}

export interface ProjectPicture {
  lower: string;
  big: string;
}

export interface ProjectDetailsBody {
  introduction: string;
  pictures: ProjectPicture[];
  secondTitle?: string;
  secondText?: string;
  thirdTitle?: string;
  thirdText?: string;
  videos?: string[];
  demo?: string;
  download?: string;
  git?: string;
}

export interface ProjectDetails {
  id: number;
  title: string;
  details: ProjectDetailsBody;
}

export interface SocialLink {
  id: number;
  child: ReactNode;
  href: string;
  style?: string;
}
