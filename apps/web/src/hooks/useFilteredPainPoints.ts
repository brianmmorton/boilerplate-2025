import { useMemo } from 'react';
import { PainPoint } from '@/types/PainPoint';
import { usePainPointFilters } from '@/cache/painPointFilters';

export const useFilteredPainPoints = (painPoints: PainPoint[] | undefined) => {
	const filters = usePainPointFilters();

	return useMemo(() => {
		if (!painPoints?.length) return [];

		let filtered = [...painPoints];

		// Apply search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				(painPoint) =>
					painPoint.title.toLowerCase().includes(searchLower) ||
					painPoint.summary.toLowerCase().includes(searchLower) ||
					painPoint.description.toLowerCase().includes(searchLower),
			);
		}

		// Apply status filter
		if (filters.status !== 'all') {
			filtered = filtered.filter((painPoint) => painPoint.status === filters.status);
		}

		// Apply severity filter
		if (filters.severity !== 'all') {
			filtered = filtered.filter((painPoint) => {
				switch (filters.severity) {
					case 'critical':
						return painPoint.severity >= 8;
					case 'high':
						return painPoint.severity >= 6 && painPoint.severity < 8;
					case 'medium':
						return painPoint.severity >= 4 && painPoint.severity < 6;
					case 'low':
						return painPoint.severity < 4;
					default:
						return true;
				}
			});
		}

		// Apply frequency filter
		if (filters.frequency !== 'all') {
			filtered = filtered.filter((painPoint) => {
				switch (filters.frequency) {
					case 'critical':
						return painPoint.frequency >= 8;
					case 'high':
						return painPoint.frequency >= 6 && painPoint.frequency < 8;
					case 'medium':
						return painPoint.frequency >= 4 && painPoint.frequency < 6;
					case 'low':
						return painPoint.frequency < 4;
					default:
						return true;
				}
			});
		}

		// Apply trend filter
		if (filters.trend !== 'all') {
			filtered = filtered.filter((painPoint) => {
				// Check if either severity or frequency trend matches
				return (
					painPoint.severityTrend === filters.trend || painPoint.frequencyTrend === filters.trend
				);
			});
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let comparison = 0;

			switch (filters.sortBy) {
				case 'impact':
					comparison = b.severity * b.frequency - a.severity * a.frequency;
					break;
				case 'severity':
					comparison = b.severity - a.severity;
					break;
				case 'frequency':
					comparison = b.frequency - a.frequency;
					break;
				case 'sources':
					comparison = (b.sources?.length || 0) - (a.sources?.length || 0);
					break;
				case 'title':
					comparison = a.title.localeCompare(b.title);
					break;
				case 'recent':
					comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
					break;
				default:
					comparison = b.severity * b.frequency - a.severity * a.frequency;
			}

			// Apply sort order
			return filters.sortOrder === 'asc' ? -comparison : comparison;
		});

		return filtered;
	}, [painPoints, filters]);
};
