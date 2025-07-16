import { useMemo } from 'react';
import { Source } from '@/types/Source';
import { useSourceFilters } from '@/cache/sourceFilters';
import { isValidHttpUrl } from '@/utils/isValidUrl';

export const useFilteredSources = (sources: Source[] | undefined) => {
	const filters = useSourceFilters();

	return useMemo(() => {
		if (!sources?.length) return [];

		let filtered = [...sources];

		// Apply search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				(source) =>
					source.title?.toLowerCase().includes(searchLower) ||
					source.summary?.toLowerCase().includes(searchLower) ||
					source.url?.toLowerCase().includes(searchLower),
			);
		}

		// Apply relevance filter
		if (filters.relevance !== 'all') {
			filtered = filtered.filter((source) => {
				switch (filters.relevance) {
					case 'critical':
						return source.relevanceScore >= 90;
					case 'high':
						return source.relevanceScore >= 75 && source.relevanceScore < 90;
					case 'medium':
						return source.relevanceScore >= 50 && source.relevanceScore < 75;
					case 'low':
						return source.relevanceScore < 50;
					default:
						return true;
				}
			});
		}

		// Apply engagement filter
		if (filters.engagement !== 'all') {
			filtered = filtered.filter((source) => {
				switch (filters.engagement) {
					case 'critical':
						return source.engagementScore >= 90;
					case 'high':
						return source.engagementScore >= 75 && source.engagementScore < 90;
					case 'medium':
						return source.engagementScore >= 50 && source.engagementScore < 75;
					case 'low':
						return source.engagementScore < 50;
					default:
						return true;
				}
			});
		}

		// Apply severity filter
		if (filters.severity !== 'all') {
			filtered = filtered.filter((source) => {
				switch (filters.severity) {
					case 'critical':
						return source.severity >= 90;
					case 'high':
						return source.severity >= 75 && source.severity < 90;
					case 'medium':
						return source.severity >= 50 && source.severity < 75;
					case 'low':
						return source.severity < 50;
					default:
						return true;
				}
			});
		}

		// Apply tone filter
		if (filters.tone !== 'all') {
			filtered = filtered.filter((source) => {
				if (!source.tone) return false;
				const toneLower = source.tone.toLowerCase();

				switch (filters.tone) {
					case 'positive':
						return (
							toneLower.includes('positive') ||
							toneLower.includes('happy') ||
							toneLower.includes('satisfied')
						);
					case 'negative':
						return (
							toneLower.includes('negative') ||
							toneLower.includes('angry') ||
							toneLower.includes('frustrated')
						);
					case 'neutral':
						return toneLower.includes('neutral') || toneLower.includes('informative');
					case 'concerned':
						return toneLower.includes('concerned') || toneLower.includes('worried');
					case 'mixed':
						return (
							toneLower.includes('mixed') ||
							(!toneLower.includes('positive') &&
								!toneLower.includes('negative') &&
								!toneLower.includes('neutral') &&
								!toneLower.includes('concerned'))
						);
					default:
						return true;
				}
			});
		}

		// Apply platform filter
		if (filters.platform !== 'all') {
			filtered = filtered.filter((source) => {
				if (!source.url || !isValidHttpUrl(source.url)) return false;
				try {
					const hostname = new URL(source.url).hostname;
					return hostname.toLowerCase().includes(filters.platform.toLowerCase());
				} catch {
					return false;
				}
			});
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (filters.sortBy) {
				case 'relevance':
					comparison = b.relevanceScore - a.relevanceScore;
					break;
				case 'engagement':
					comparison = b.engagementScore - a.engagementScore;
					break;
				case 'severity':
					comparison = b.severity - a.severity;
					break;
				case 'title':
					comparison = (a.title || '').localeCompare(b.title || '');
					break;
				case 'platform':
					const getPlatform = (source: Source) => {
						try {
							return source.url && isValidHttpUrl(source.url) ? new URL(source.url).hostname : '';
						} catch {
							return '';
						}
					};
					comparison = getPlatform(a).localeCompare(getPlatform(b));
					break;
				case 'recent':
					comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
					break;
				default:
					comparison = b.relevanceScore - a.relevanceScore;
			}

			// Apply sort order
			return filters.sortOrder === 'asc' ? -comparison : comparison;
		});

		return filtered;
	}, [sources, filters]);
};
