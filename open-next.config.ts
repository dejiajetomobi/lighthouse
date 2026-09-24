import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// This game has no server data or revalidation, so it needs no external cache.
export default defineCloudflareConfig();
