import { Logger } from 'winston';

interface ParallelWithJitterOptions {
	/**
	 * Maximum number of concurrent operations
	 * @default 5
	 */
	maxConcurrent?: number;
	/**
	 * Minimum delay between operations in milliseconds
	 * @default 100
	 */
	minDelay?: number;
	/**
	 * Maximum delay between operations in milliseconds
	 * @default 500
	 */
	maxDelay?: number;
	/**
	 * Logger instance for debugging
	 */
	logger?: Logger;
}

/**
 * Process an array of items in parallel with jittered delays between operations
 * to prevent rate limiting and provide a more natural request pattern.
 *
 * @param items Array of items to process
 * @param processFn Function to process each item
 * @param options Configuration options
 * @returns Array of processed results
 */
export async function parallelWithJitter<T, R>(
	items: T[],
	processFn: (item: T) => Promise<R>,
	options: ParallelWithJitterOptions = {},
): Promise<R[]> {
	const { maxConcurrent = 5, minDelay = 100, maxDelay = 500, logger } = options;

	const results: R[] = [];
	const chunks: T[][] = [];
	const chunkSize = Math.ceil(items.length / maxConcurrent);

	// Split items into chunks for parallel processing
	for (let i = 0; i < items.length; i += chunkSize) {
		chunks.push(items.slice(i, i + chunkSize));
	}

	// Process chunks in parallel
	await Promise.all(
		chunks.map(async (chunk, chunkIndex) => {
			// Add initial delay between chunks
			if (chunkIndex > 0) {
				const delay = Math.floor(Math.random() * (maxDelay - minDelay) + minDelay);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			// Process items in chunk with jittered delays
			for (const item of chunk) {
				const result = await processFn(item);
				results.push(result);

				// Add jittered delay between items
				const delay = Math.floor(Math.random() * (maxDelay - minDelay) + minDelay);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}),
	);

	return results;
}
