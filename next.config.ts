import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { NextConfig } from "next";

// EN: Local dev only. Load the shared secrets file when it exists. Already set
// variables win (loadEnvFile never overrides), and the file is absent on Vercel.
// FR : Developpement local uniquement. Charge le fichier de secrets central s'il
// existe. Les variables deja definies gagnent, et le fichier n'existe pas sur Vercel.
const centralEnvFile =
  process.env.CENTRAL_ENV_FILE ?? join(homedir(), ".secrets", "projets.env");
if (existsSync(centralEnvFile)) process.loadEnvFile(centralEnvFile);

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
