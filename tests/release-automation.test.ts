import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readConfig(file: string) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

describe("release automation", () => {
  it("runs the complete verification sequence for dev and main", () => {
    const workflow = readConfig(".github/workflows/verify.yml");

    expect(workflow).toContain("branches: [dev, main]");
    expect(workflow).toContain("npm ci");
    expect(workflow).toContain("npm run lint");
    expect(workflow).toContain("npx tsc --noEmit");
    expect(workflow).toContain("npm run test -- --run");
    expect(workflow).toContain("npm run test:rules");
    expect(workflow).toContain("npm run build");
  });

  it("keeps deployed browser credentials in GitHub secrets", () => {
    const workflow = readConfig(".github/workflows/deployed-e2e.yml");

    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("secrets.E2E_STUDENT_EMAIL");
    expect(workflow).toContain("secrets.E2E_STUDENT_PASSWORD");
    expect(workflow).toContain("PLAYWRIGHT_BASE_URL");
    expect(workflow).not.toContain("@farmingdale.edu");
  });

  it("checks npm dependencies every week", () => {
    const dependabot = readConfig(".github/dependabot.yml");

    expect(dependabot).toContain("package-ecosystem: npm");
    expect(dependabot).toContain("interval: weekly");
  });
});
