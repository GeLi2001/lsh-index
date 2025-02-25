# LSH Index

A TypeScript implementation of Locality-Sensitive Hashing for indexing similar items using random buckets.

## References

- [Random Projection for Locality Sensitive Hashing](https://www.pinecone.io/learn/series/faiss/locality-sensitive-hashing-random-projection/)

## Installation

Install the package using npm.

```bash
npm install lsh-index
```

## Usage

Import and use the LSH class with your desired configuration:

```typescript
import { LSH } from "lsh-index";

const lsh = new LSH({
  dimensions: 3,
  numProjections: 10,
  numBands: 5,
  bucketSize: 4
});

// Insert vectors
lsh.insert({ id: "point1", vector: [1, 2, 3] });
lsh.insert({ id: "point2", vector: [1.1, 2.1, 3.1] });

// Query similar vectors
const results = lsh.query({ vector: [1, 2, 3], maxDistance: 0.5 });
```

## API

### LSH(options)

Creates a new LSH instance for similarity search.

#### options

- `dimensions` (number): Number of dimensions in your input vectors
- `numProjections` (number): Number of random projections to use
- `numBands` (number): Number of bands for LSH bucketing
- `bucketSize` (number, optional): Size of each bucket for quantization (default: 4)
- `distanceMetric` (function, optional): Custom distance metric function (default: Euclidean)

### Methods

#### insert(params)

Inserts a vector into the LSH index.

- `params.id` (string): Unique identifier for the vector
- `params.vector` (number[]): Vector to insert

#### query(params)

Finds similar vectors within the specified distance.

- `params.vector` (number[]): Query vector
- `params.maxDistance` (number): Maximum distance threshold
- Returns: Array of IDs of similar vectors

#### clear()

Removes all vectors from the index.

#### export()

Exports the current state of the LSH index.

## License

MIT
