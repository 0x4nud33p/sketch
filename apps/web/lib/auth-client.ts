import { createAuthClient } from "better-auth/client";

const authClient: ReturnType<typeof createAuthClient> = createAuthClient();

export { authClient };
