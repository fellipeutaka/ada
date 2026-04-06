import { execSync } from "node:child_process";

export default function globalSetup() {
  execSync("pnpm run db:seed", { stdio: "inherit" });
}
