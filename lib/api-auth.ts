import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: String((session.user as Record<string, unknown>).role || "employee"),
    };
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json({ error: "Forbidden - insufficient role" }, { status: 403 });
  }
  return result;
}
