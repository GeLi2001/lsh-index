import { LSH } from "../src";

describe("LSH", () => {
  let lsh: LSH;

  beforeEach(() => {
    lsh = new LSH({
      dimensions: 128,
      numProjections: 100,
      numBands: 20,
      bucketSize: 4
    });
  });

  it("should insert and find similar vectors", () => {
    // Create a base vector
    const baseVector = Array(128)
      .fill(0)
      .map(() => Math.random());

    // Create a similar vector (small perturbation)
    const similarVector = baseVector.map((v) => v + Math.random() * 0.05);

    // Create a different random vector
    const differentVector = Array(128)
      .fill(0)
      .map(() => Math.random());

    lsh.insert({ id: "vec1", vector: baseVector });
    lsh.insert({ id: "vec2", vector: similarVector });
    lsh.insert({ id: "vec3", vector: differentVector });

    console.log(lsh.export());

    const results = lsh.query({
      vector: baseVector,
      maxDistance: 0.5
    });
    expect(results).toContain("vec1");
    expect(results).toContain("vec2");
    expect(results).not.toContain("vec3");
  });

  it("should handle zero vectors", () => {
    const zeroVector = Array(128).fill(0);
    lsh.insert({ id: "zero1", vector: zeroVector });
    lsh.insert({ id: "zero2", vector: zeroVector });

    const results = lsh.query({
      vector: zeroVector,
      maxDistance: 0.1
    });
    expect(results).toContain("zero1");
    expect(results).toContain("zero2");
  });

  it("should clear all vectors", () => {
    const vector = Array(128)
      .fill(0)
      .map(() => Math.random());
    lsh.insert({ id: "vec1", vector });
    lsh.clear();

    const results = lsh.query({
      vector,
      maxDistance: 1.0
    });
    expect(results).toHaveLength(0);
  });

  it("should throw error for incorrect dimensions", () => {
    const wrongVector = Array(64)
      .fill(0)
      .map(() => Math.random());
    expect(() => lsh.insert({ id: "wrong", vector: wrongVector })).toThrow();
    expect(() =>
      lsh.query({ vector: wrongVector, maxDistance: 1.0 })
    ).toThrow();
  });

  it("should handle vectors at different distances", () => {
    const baseVector = Array(128)
      .fill(0)
      .map(() => Math.random());

    // Create vectors at different distances
    const closeVector = baseVector.map((v) => v + Math.random() * 0.01);
    const mediumVector = baseVector.map((v) => v + Math.random() * 0.05);
    const farVector = baseVector.map((v) => v + Math.random() * 1.0);

    lsh.insert({ id: "base", vector: baseVector });
    lsh.insert({ id: "close", vector: closeVector });
    lsh.insert({ id: "medium", vector: mediumVector });
    lsh.insert({ id: "far", vector: farVector });

    // Test with different distance thresholds
    expect(lsh.query({ vector: baseVector, maxDistance: 0.2 })).toContain(
      "close"
    );
    expect(lsh.query({ vector: baseVector, maxDistance: 0.6 })).toContain(
      "medium"
    );
    expect(lsh.query({ vector: baseVector, maxDistance: 1.0 })).not.toContain(
      "far"
    );
  });
});
