import { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from 'utils/fetchWithAuth';
import { PaginatedSourcesResponse, Source } from '@/types/Source';

interface UsePaginatedSourcesProps {
	productId: number;
	painPointId: number;
	initialSources?: Source[];
}

export const usePaginatedSources = ({
	productId,
	painPointId,
	initialSources = [],
}: UsePaginatedSourcesProps) => {
	const [sources, setSources] = useState<Source[]>(initialSources);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pagination, setPagination] = useState({
		page: 0,
		limit: 10,
		totalCount: initialSources.length,
		totalPages: Math.ceil(initialSources.length / 10),
		hasNextPage: false,
		hasPrevPage: false,
	});

	const loadMoreSources = useCallback(async () => {
		if (isLoading || !pagination.hasNextPage) return;

		setIsLoading(true);
		setError(null);

		try {
			const nextPage = pagination.page + 1;
			const response = await fetchWithAuth(
				`/1/products/${productId}/pain-points/${painPointId}/sources?page=${nextPage}&limit=${pagination.limit}&sortBy=relevanceScore&order=desc`,
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: PaginatedSourcesResponse = await response.json();

			setSources((prevSources) => [...prevSources, ...data.sources]);
			setPagination(data.pagination);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load sources');
		} finally {
			setIsLoading(false);
		}
	}, [
		productId,
		painPointId,
		pagination.page,
		pagination.limit,
		pagination.hasNextPage,
		isLoading,
	]);

	// Initialize pagination based on the initial sources
	useEffect(() => {
		if (initialSources.length > 0) {
			// Assume we're showing the first page with the initial sources
			setPagination((prev) => ({
				...prev,
				page: 0,
				totalCount: initialSources.length >= 5 ? initialSources.length + 1 : initialSources.length, // Estimate there might be more
				hasNextPage: initialSources.length >= 5, // If we have 5 sources (the limit from the main query), there might be more
			}));
		}
	}, [initialSources]);

	return {
		sources,
		isLoading,
		error,
		pagination,
		loadMoreSources,
		hasMoreSources: pagination.hasNextPage,
	};
};
