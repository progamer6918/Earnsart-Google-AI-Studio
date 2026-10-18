import test from "node:test";
import assert from "node:assert/strict";
import { buildPanSetMesh, PAN_STRIDE } from "./panGeometry.ts";
import type { StageShape } from "./panGeometry.ts";

test("buildPanSetMesh generates valid non-empty buffers for all 6 baking pan shapes", () => {
  const shapes: StageShape[] = ["love", "bulat", "segi", "bronis", "rigi", "pai"];
  for (const s of shapes) {
    const mesh = buildPanSetMesh(s);
    assert.ok(mesh.vertices > 500, `shape ${s} should have >500 vertices`);
    assert.equal(mesh.data.length, mesh.vertices * PAN_STRIDE);
    assert.ok(mesh.index.length > 1000, `shape ${s} should have >1000 indices`);
    assert.ok(mesh.radius >= 1.0 && mesh.radius < 2.5);
    assert.equal(mesh.outlineRings.length, 6); // 2 rings per pan * 3 nested pans
  }
});
