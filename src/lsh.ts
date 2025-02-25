import { createHash } from "crypto";

export interface LSHOptions {
  dimensions: number; // Input vector dimensions
  numProjections: number; // Number of random projections
  numBands: number; // Number of bands for bucketing
  bucketSize?: number; // Size of each bucket for quantization (default: 4)
  distanceMetric?: (v1: number[], v2: number[]) => number; // Distance metric to use (default: Euclidean)
}

export class LSH {
  private projectionVectors: number[][];
  private buckets: Map<string, Set<string>>[];
  private vectors: Map<string, number[]>;
  private readonly bucketSize: number;
  private readonly rowsPerBand: number;
  private distanceMetric: (v1: number[], v2: number[]) => number;
  constructor(private options: LSHOptions) {
    if (options.numProjections % options.numBands !== 0) {
      throw new Error(
        `Number of projections (${options.numProjections}) must be a multiple of number of bands (${options.numBands})`
      );
    }
    this.bucketSize = options.bucketSize || 4;
    this.rowsPerBand = Math.floor(options.numProjections / options.numBands);
    this.projectionVectors = this.initializeProjections();
    this.buckets = Array(options.numBands)
      .fill(null)
      .map(() => new Map());
    this.vectors = new Map();
    this.distanceMetric = options.distanceMetric || this.euclideanDistance;
  }

  private initializeProjections(): number[][] {
    return Array(this.options.numProjections)
      .fill(0)
      .map(() => {
        // Generate random unit vector for projection
        const vector = Array(this.options.dimensions)
          .fill(0)
          .map(() => Math.random() * 2 - 1);

        // Normalize to unit vector
        const magnitude = Math.sqrt(
          vector.reduce((sum, val) => sum + val * val, 0)
        );
        return vector.map((v) => v / magnitude);
      });
  }

  private projectVector(vector: number[]): number[] {
    return this.projectionVectors.map((projVector) =>
      vector.reduce((sum, val, idx) => sum + val * projVector[idx], 0)
    );
  }

  private getBucketHash(projections: number[], bandIndex: number): string {
    const start = bandIndex * this.rowsPerBand;
    const bandProjections = projections
      .slice(start, start + this.rowsPerBand)
      // Quantize projections into discrete buckets
      .map((p) => Math.floor(p * this.bucketSize));

    const hash = createHash("sha256");
    hash.update(bandProjections.join(":"));
    return hash.digest("hex");
  }

  insert(params: { id: string; vector: number[] }): void {
    const { id, vector } = params;
    if (vector.length !== this.options.dimensions) {
      throw new Error(`Vector must have ${this.options.dimensions} dimensions`);
    }

    // Store original vector
    this.vectors.set(id, vector);

    // Project vector and hash to buckets
    const projections = this.projectVector(vector);

    for (let i = 0; i < this.options.numBands; i++) {
      const bucketHash = this.getBucketHash(projections, i);
      if (!this.buckets[i].has(bucketHash)) {
        this.buckets[i].set(bucketHash, new Set());
      }
      this.buckets[i].get(bucketHash)!.add(id);
    }
  }

  query(params: { vector: number[]; maxDistance: number }): string[] {
    const { vector, maxDistance } = params;
    if (vector.length !== this.options.dimensions) {
      throw new Error(
        `Query vector must have ${this.options.dimensions} dimensions`
      );
    }

    const projections = this.projectVector(vector);
    const candidates = new Set<string>();

    // Collect candidates from all bands
    for (let i = 0; i < this.options.numBands; i++) {
      const bucketHash = this.getBucketHash(projections, i);
      const bucket = this.buckets[i].get(bucketHash);
      if (bucket) {
        bucket.forEach((id) => candidates.add(id));
      }
    }

    // Filter candidates by actual distance
    return Array.from(candidates).filter((id) => {
      const candidateVector = this.vectors.get(id)!;
      return this.distanceMetric(vector, candidateVector) <= maxDistance;
    });
  }

  private euclideanDistance(v1: number[], v2: number[]): number {
    return Math.sqrt(
      v1.reduce((sum, val, idx) => sum + Math.pow(val - v2[idx], 2), 0)
    );
  }

  clear(): void {
    this.buckets = Array(this.options.numBands)
      .fill(null)
      .map(() => new Map());
    this.vectors.clear();
  }

  export() {
    return {
      options: this.options,
      projectionVectors: this.projectionVectors,
      buckets: this.buckets.map((bucket) =>
        Array.from(bucket.entries()).map(([key, value]) => [
          key,
          Array.from(value)
        ])
      ),
      vectors: Array.from(this.vectors.entries())
    };
  }
}
