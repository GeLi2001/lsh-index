# LSH Index

A TypeScript implementation of Locality-Sensitive Hashing for clustering similar items.

## Installation

Install the package using npm.

```bash
npm install lsh-index
```

## Usage

Import and use the LSHCluster class with your desired configuration.

## API

### LSHCluster(options)

Creates a new LSH instance.

#### options

- `numHashes` (number): Number of hash functions to use
- `numBands` (number): Number of bands for LSH
- `similarity` (number, optional): Similarity threshold (default: 0.5)

## License

MIT
