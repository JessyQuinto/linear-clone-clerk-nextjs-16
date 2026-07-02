import { ComponentType } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { IssueProjectCyclePanel } from "@/components/projects/issue-project-cycle-panel";

/**
 * Issue detail extension slots.
 *
 * PARALLEL-TRACK REGISTRY FILE: tracks register their issue-detail panels
 * here with one-line additions (import your component, append to the array).
 *
 * - `issueDetailMainSlots` render under the description (Track C: comments,
 *   activity feed, sub-issues; Track D: AI triage suggestions).
 * - `issueDetailSidebarSlots` render at the bottom of the properties sidebar
 *   (Track C: labels, attachments, relations).
 */
export type IssueDetailSlotProps = {
  issue: Doc<"issues">;
  team: Doc<"teams">;
};

import { ActivitySection } from "@/components/issue-detail/activity-section";
import { SubIssuesPanel } from "@/components/issue-detail/sub-issues-panel";
import { PresencePanel } from "@/components/issue-detail/presence-panel";
import { LabelsPanel } from "@/components/issue-detail/labels-panel";
import { RelationsPanel } from "@/components/issue-detail/relations-panel";
import { AttachmentsPanel } from "@/components/issue-detail/attachments-panel";
import { AiTriagePanel } from "@/components/ai/triage-panel";

export const issueDetailMainSlots: ComponentType<IssueDetailSlotProps>[] = [
  SubIssuesPanel,
  ActivitySection,
  AiTriagePanel,
];

export const issueDetailSidebarSlots: ComponentType<IssueDetailSlotProps>[] = [
  PresencePanel,
  LabelsPanel,
  RelationsPanel,
  AttachmentsPanel,
  IssueProjectCyclePanel,
];
