export type Activity = {
  date: string;
  label: string;
  detail: string;
  projectId: string;
  tone: "blue" | "green" | "amber" | "violet";
};

export const activities: Activity[] = [
  {
    date: "AUG 05",
    label: "更新了 Run Blue 的游客模式",
    detail: "让第一次打开的人也能看到训练档案的节奏。",
    projectId: "run-blue",
    tone: "blue",
  },
  {
    date: "AUG 03",
    label: "完成 PDF 转图片工具",
    detail: "本地处理、批量导出，文件不离开浏览器。",
    projectId: "pdf-frames",
    tone: "green",
  },
  {
    date: "AUG 02",
    label: "给 Math Train 加了一轮反馈",
    detail: "把正确答案变成更清楚的节奏，而不是更多噪音。",
    projectId: "math-train",
    tone: "amber",
  },
  {
    date: "JUL 28",
    label: "开始整理 Runcoach Agent",
    detail: "先让它记住训练上下文，再谈更聪明的建议。",
    projectId: "runcoach-agent",
    tone: "violet",
  },
];
