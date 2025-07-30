/**
 * Usage:  tsx scripts/gen-golden.ts
 * Walks every fixture folder; if expected.json missing => writes it.
 */
import { globby } from "globby";
import fs from "fs";
import path from "path";
import { emdfToDto } from "../tests/regress/parseEmdfToDto";
import { runEngine } from "../tests/regress/runEngine";

(async () => {
  const dirs = await globby("tests/regress/fixtures/*", { onlyDirectories: true });
  for (const dir of dirs) {
    const emdf = path.join(dir, "fixture.emdf");
    const exp  = path.join(dir, "expected.json");
    
    // Check if we should use directory structure instead of EMDF file
    const fixtureExists = fs.existsSync(emdf) || fs.existsSync(path.join(dir, "DF_Project.xml"));
    
    if (fs.existsSync(exp) || !fixtureExists) continue;
    
    console.log("Generating snapshot for", dir);
    
    try {
      // Use directory path if EMDF doesn't exist but XML files do
      const fixturePath = fs.existsSync(emdf) ? emdf : dir;
      const dto = await emdfToDto(fixturePath);
      const out = runEngine(dto);
      fs.writeFileSync(exp, JSON.stringify(out, null, 2));
      console.log(`✓ Generated ${exp}`);
    } catch (error) {
      console.error(`✗ Failed to generate snapshot for ${dir}:`, error);
    }
  }
  console.log("Golden snapshot generation complete!");
})();