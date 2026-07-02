/* eslint-disable */
/**
 * Mock implementation of Convex React hooks (useQuery, useMutation, etc.).
 * Connects to our reactive localStorage mock database in db.ts.
 */

import { useState, useEffect, useMemo, startTransition } from "react";
import {
  getTable,
  insertRow,
  updateRow,
  deleteRow,
  subscribe,
  generateId,
} from "./db";

// Helper to resolve queries synchronously
function executeQuerySync(queryName: string, args: any): any {
  if (typeof window === "undefined") {
    // Return empty state or seeded items during server-side pre-rendering
    return undefined;
  }

  // Parse path, e.g. "issues.listByTeam" -> namespace: "issues", func: "listByTeam"
  const [namespace, func] = queryName.split(".");

  if (namespace === "users") {
    if (func === "current") {
      return getTable("users")[0] || null;
    }
  }

  if (namespace === "organizations") {
    if (func === "current") {
      return getTable("organizations")[0] || null;
    }
    if (func === "listMembers") {
      const members = getTable("members");
      const users = getTable("users");
      return members.map((m) => {
        const u = users.find((usr) => usr._id === m.userId);
        return {
          memberId: m._id,
          userId: m.userId,
          role: m.role,
          name: u?.name || "Unknown Member",
          email: u?.email || "",
          imageUrl: u?.imageUrl,
        };
      });
    }
  }

  if (namespace === "teams") {
    if (func === "list") {
      return getTable("teams");
    }
    if (func === "get") {
      return getTable("teams").find((t) => t._id === args?.teamId) || null;
    }
  }

  if (namespace === "issues") {
    if (func === "listByTeam") {
      return getTable("issues")
        .filter((i) => i.teamId === args?.teamId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }
    if (func === "get") {
      return getTable("issues").find((i) => i._id === args?.issueId) || null;
    }
  }

  if (namespace === "cycles") {
    if (func === "listWithProgress") {
      const cycles = getTable("cycles");
      const teams = getTable("teams");
      const issues = getTable("issues");
      return cycles.map((c) => {
        const t = teams.find((team) => team._id === c.teamId);
        const cycleIssues = issues.filter((i) => i.cycleId === c._id);
        const progress = {
          total: cycleIssues.length,
          backlog: cycleIssues.filter((i) => i.status === "backlog").length,
          todo: cycleIssues.filter((i) => i.status === "todo").length,
          in_progress: cycleIssues.filter((i) => i.status === "in_progress").length,
          in_review: cycleIssues.filter((i) => i.status === "in_review").length,
          done: cycleIssues.filter((i) => i.status === "done").length,
          canceled: cycleIssues.filter((i) => i.status === "canceled").length,
        };
        return {
          ...c,
          teamName: t?.name || "Unknown",
          teamKey: t?.key || "UNK",
          progress,
        };
      });
    }
    if (func === "get") {
      return getTable("cycles").find((c) => c._id === args?.cycleId) || null;
    }
    if (func === "listIssues") {
      return getTable("issues").filter((i) => i.cycleId === args?.cycleId);
    }
    if (func === "candidateIssues") {
      const cycle = getTable("cycles").find((c) => c._id === args?.cycleId);
      if (!cycle) return [];
      return getTable("issues").filter(
        (i) => i.teamId === cycle.teamId && i.cycleId !== args?.cycleId
      );
    }
    if (func === "currentForTeam") {
      const cycles = getTable("cycles").filter((c) => c.teamId === args?.teamId);
      const now = Date.now();
      const active = cycles
        .filter((c) => c.startDate <= now && now <= c.endDate)
        .sort((a, b) => b.startDate - a.startDate);
      return active[0] || null;
    }
  }

  if (namespace === "projects") {
    if (func === "list") {
      return getTable("projects");
    }
    if (func === "listWithProgress") {
      const projects = getTable("projects");
      const issues = getTable("issues");
      return projects.map((p) => {
        const projIssues = issues.filter((i) => i.projectId === p._id);
        const progress = {
          total: projIssues.length,
          backlog: projIssues.filter((i) => i.status === "backlog").length,
          todo: projIssues.filter((i) => i.status === "todo").length,
          in_progress: projIssues.filter((i) => i.status === "in_progress").length,
          in_review: projIssues.filter((i) => i.status === "in_review").length,
          done: projIssues.filter((i) => i.status === "done").length,
          canceled: projIssues.filter((i) => i.status === "canceled").length,
        };
        return { ...p, progress };
      });
    }
    if (func === "get") {
      return getTable("projects").find((p) => p._id === args?.projectId) || null;
    }
    if (func === "listIssues") {
      return getTable("issues").filter((i) => i.projectId === args?.projectId);
    }
    if (func === "candidateIssues") {
      return getTable("issues").filter((i) => i.projectId !== args?.projectId);
    }
  }

  if (namespace === "labels") {
    if (func === "list") {
      return getTable("labels");
    }
  }

  if (namespace === "views") {
    if (func === "list") {
      const views = getTable("views");
      return views.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (func === "teamIssueLabels") {
      const issues = getTable("issues").filter((i) => i.teamId === args?.teamId);
      const issueLabels = getTable("issueLabels");
      const labels = getTable("labels");
      const result = [];
      for (const issue of issues) {
        const links = issueLabels.filter((il) => il.issueId === issue._id);
        for (const link of links) {
          const lbl = labels.find((l) => l._id === link.labelId);
          if (lbl) {
            result.push({
              issueId: issue._id,
              labelId: link.labelId,
              name: lbl.name,
              color: lbl.color,
            });
          }
        }
      }
      return result;
    }
  }

  if (namespace === "comments") {
    if (func === "listByIssue") {
      const comments = getTable("comments").filter((c) => c.issueId === args?.issueId);
      const users = getTable("users");
      return comments.map((c) => {
        const author = users.find((u) => u._id === c.authorId);
        return {
          ...c,
          mentions: c.mentions || [],
          authorName: author?.name || "Unknown",
          authorImageUrl: author?.imageUrl,
          mentionedUsers: (c.mentions || []).map((mId: string) => {
            const u = users.find((usr) => usr._id === mId);
            return { userId: mId, name: u?.name || "User" };
          }),
        };
      });
    }
  }

  if (namespace === "activity") {
    if (func === "listByIssue") {
      const activities = getTable("activity").filter((a) => a.issueId === args?.issueId);
      const users = getTable("users");
      return activities.map((a) => {
        const actor = users.find((u) => u._id === a.actorId);
        return {
          ...a,
          actorName: actor?.name || "Unknown",
          actorImageUrl: actor?.imageUrl,
        };
      });
    }
  }

  if (namespace === "search") {
    if (func === "issues") {
      const queryStr = (args?.query || "").toLowerCase();
      let list = getTable("issues");
      if (args?.teamId) {
        list = list.filter((i) => i.teamId === args.teamId);
      }
      return list.filter(
        (i) =>
          i.title.toLowerCase().includes(queryStr) ||
          (i.description || "").toLowerCase().includes(queryStr)
      );
    }
  }

  if (namespace === "agent") {
    if (func === "chat") {
      // Mock threads and messages for AI chat
      if (args?.threadId) {
        return [];
      }
      return [];
    }
    if (func === "quota") {
      return {
        hasAccess: true,
        unlimited: true,
        remaining: 100,
        total: 100,
      };
    }
  }

  return undefined;
}

// React hooks implementation
export function useQuery(queryName: any, args?: any): any {
  const queryStr = typeof queryName === "string" ? queryName : String(queryName);
  const [data, setData] = useState(() => executeQuerySync(queryStr, args));

  useEffect(() => {
    // If skipping query
    if (args === "skip") {
      setData(undefined);
      return;
    }

    const updateData = () => {
      const fresh = executeQuerySync(queryStr, args);
      setData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(fresh)) {
          return prev;
        }
        return fresh;
      });
    };

    // Initial load
    updateData();

    // Subscribe to DB changes
    return subscribe(updateData);
  }, [queryStr, JSON.stringify(args)]);

  return data;
}

export function useQueries(queries: Record<string, { query: any; args: any }>): any {
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    const updateData = () => {
      const result: Record<string, any> = {};
      for (const [key, q] of Object.entries(queries)) {
        if (!q) continue;
        const queryStr = typeof q.query === "string" ? q.query : String(q.query);
        result[key] = executeQuerySync(queryStr, q.args);
      }
      setData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(result)) {
          return prev;
        }
        return result;
      });
    };

    updateData();
    return subscribe(updateData);
  }, [JSON.stringify(queries)]);

  return data;
}

export async function executeMutationSync(mutationName: any, args: any) {
  const mutationStr = typeof mutationName === "string" ? mutationName : String(mutationName);
  const [namespace, func] = mutationStr.split(".");
  const org = getTable("organizations")[0];
  const user = getTable("users")[0];

  if (namespace === "issues") {
    if (func === "create") {
      const team = getTable("teams").find((t) => t._id === args.teamId);
      const number = team ? team.nextIssueNumber : 1;
      if (team) {
        updateRow("teams", team._id, { nextIssueNumber: number + 1 });
      }
      const newIssue = insertRow("issues", {
        orgId: org?._id || "org_acme",
        creatorId: user?._id || "user_jessy",
        number,
        status: args.status || "backlog",
        priority: args.priority || "none",
        ...args,
        sortOrder: Date.now() / 1000,
      });

      // Log activity
      insertRow("activity", {
        orgId: org?._id || "org_acme",
        issueId: newIssue._id,
        actorId: user?._id || "user_jessy",
        type: "created",
      });

      return newIssue._id;
    }

    if (func === "update") {
      const issueId = args.id || args.issueId;
      const current = getTable("issues").find((i) => i._id === issueId);
      if (!current) throw new Error("Issue not found");

      const cleanUpdates = { ...args };
      delete cleanUpdates.id;
      delete cleanUpdates.issueId;

      // Log activities based on changes
      for (const [key, val] of Object.entries(cleanUpdates)) {
        const oldVal = current[key];
        if (oldVal !== val) {
          insertRow("activity", {
            orgId: org?._id || "org_acme",
            issueId,
            actorId: user?._id || "user_jessy",
            type: key === "status" ? "status_changed" : key === "assigneeId" ? "assigned" : "updated",
            field: key,
            oldValue: String(oldVal),
            newValue: String(val),
          });
        }
      }

      updateRow("issues", issueId, cleanUpdates);
      return null;
    }
  }

  if (namespace === "comments") {
    if (func === "create") {
      const newComment = insertRow("comments", {
        orgId: org?._id || "org_acme",
        authorId: user?._id || "user_jessy",
        issueId: args.issueId,
        body: args.body,
        mentions: args.mentions || [],
      });
      return newComment._id;
    }
    if (func === "update") {
      updateRow("comments", args.commentId, { body: args.body });
      return null;
    }
    if (func === "remove") {
      deleteRow("comments", args.commentId);
      return null;
    }
  }

  if (namespace === "teams") {
    if (func === "create") {
      const newTeam = insertRow("teams", {
        orgId: org?._id || "org_acme",
        nextIssueNumber: 1,
        ...args,
      });
      return newTeam._id;
    }
  }

  if (namespace === "projects") {
    if (func === "create") {
      const newProj = insertRow("projects", {
        orgId: org?._id || "org_acme",
        status: args.status || "planned",
        ...args,
      });
      return newProj._id;
    }
    if (func === "update") {
      const projId = args.id || args.projectId;
      const cleanUpdates = { ...args };
      delete cleanUpdates.id;
      delete cleanUpdates.projectId;
      updateRow("projects", projId, cleanUpdates);
      return null;
    }
    if (func === "remove") {
      deleteRow("projects", args.projectId);
      return null;
    }
  }

  if (namespace === "cycles") {
    if (func === "create") {
      const latest = getTable("cycles")
        .filter((c) => c.teamId === args.teamId)
        .sort((a, b) => b.number - a.number)[0];
      const num = (latest?.number || 0) + 1;
      const newCycle = insertRow("cycles", {
        orgId: org?._id || "org_acme",
        number: num,
        ...args,
      });
      return newCycle._id;
    }
    if (func === "update") {
      const cycleId = args.id || args.cycleId;
      const cleanUpdates = { ...args };
      delete cleanUpdates.id;
      delete cleanUpdates.cycleId;
      updateRow("cycles", cycleId, cleanUpdates);
      return null;
    }
  }

  if (namespace === "labels") {
    if (func === "create") {
      const newLabel = insertRow("labels", {
        orgId: org?._id || "org_acme",
        ...args,
      });
      return newLabel._id;
    }
    if (func === "toggleOnIssue") {
      const { issueId, labelId } = args;
      const currentLinks = getTable("issueLabels");
      const existing = currentLinks.find(
        (il) => il.issueId === issueId && il.labelId === labelId
      );
      if (existing) {
        deleteRow("issueLabels", existing._id);
      } else {
        insertRow("issueLabels", { issueId, labelId });
      }
      return null;
    }
  }

  if (namespace === "views") {
    if (func === "create") {
      const newView = insertRow("views", {
        orgId: org?._id || "org_acme",
        creatorId: user?._id || "user_jessy",
        ...args,
      });
      return newView._id;
    }
    if (func === "remove") {
      deleteRow("views", args.viewId);
      return null;
    }
  }

  if (namespace === "issueRelations") {
    if (func === "create") {
      const newRel = insertRow("issueRelations", args);
      return newRel._id;
    }
    if (func === "remove") {
      deleteRow("issueRelations", args.relationId);
      return null;
    }
    if (func === "setParent") {
      updateRow("issues", args.issueId, { parentIssueId: args.parentIssueId || undefined });
      return null;
    }
  }

  if (namespace === "seed") {
    if (func === "demoData") {
      return null;
    }
  }

  return null;
}

export function useMutation(mutationName: any): any {
  const mutationFn = async (args: any) => {
    return executeMutationSync(mutationName, args);
  };

  const wrapper = (args: any) => mutationFn(args);
  wrapper.withOptimisticUpdate = () => wrapper;

  return wrapper;
}

export function useAction(actionName: any): any {
  return async () => {
    return null;
  };
}

export class ConvexReactClient {
  constructor() {}
  async query(queryName: any, args: any) {
    const name = typeof queryName === "string" ? queryName : queryName?.toString() || "";
    return executeQuerySync(name, args);
  }
  async mutation(mutationName: any, args: any) {
    const name = typeof mutationName === "string" ? mutationName : mutationName?.toString() || "";
    return executeMutationSync(name, args);
  }
}

const clientInstance = new ConvexReactClient();

export function useConvex() {
  return clientInstance;
}

