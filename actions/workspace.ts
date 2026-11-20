"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { WorkspaceData, WorkspaceUser } from "@/types/workspace";

export async function getWorkspaceUser(): Promise<WorkspaceUser> {
  const user = await checkUser();
  if (!user) redirect("/");

  return {
    id: user.id,
    credits: user.credits,
    plan: user.plan,
  };
}

export async function getWorkspaceById(
  workspaceId: string,
  userId: string
): Promise<WorkspaceData> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId, userId },
    select: {
      id: true,
      title: true,
      messages: true,
      fileData: true,
    },
  });

  if (!workspace) redirect("/");

  return workspace;
}

export async function exportWorkspace(
  workspaceId: string,
  userId: string
): Promise<WorkspaceData | null> {
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId, userId },
    select: {
      id: true,
      title: true,
      messages: true,
      fileData: true,
    },
  });

  return workspace;
}
