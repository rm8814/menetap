import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { DataModel } from "./_generated/dataModel";

const MenetapPassword = Password<DataModel>({
  profile(params) {
    const now = Date.now();
    return {
      email: params.email as string,
      name: params.name as string | undefined,
      role: "guest",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [MenetapPassword],
});
