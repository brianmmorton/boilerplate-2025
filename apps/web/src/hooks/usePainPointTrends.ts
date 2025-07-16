import { useModel } from '@/cache/cache';
import { useMemo } from 'react';

export interface PainPointTrendSummary {
	hasTrends: boolean;
	trendingUp: number;
	trendingDown: number;
	stable: number;
	avgConfidence: number;
	significantTrends: number;
}

/**
 * Hook to get trend data for a specific pain point
 */
export const usePainPointTrend = (productId: number | null, painPointId: number) => {
	return useModel('product', productId, (product) => {
		const painPoint = product?.painPoints?.find((p) => p.id === painPointId);
		if (!painPoint) return null;

		return {
			severity: {
				trend: painPoint.severityTrend,
				changePercent: painPoint.severityChangePercent,
				previous: painPoint.previousSeverity,
				current: painPoint.severity,
			},
			frequency: {
				trend: painPoint.frequencyTrend,
				changePercent: painPoint.frequencyChangePercent,
				previous: painPoint.previousFrequency,
				current: painPoint.frequency,
			},
			confidence: painPoint.trendConfidence,
			lastCalculation: painPoint.lastTrendCalculation,
		};
	});
};

/**
 * Hook to get trend summary for all pain points of a product
 */
export const usePainPointTrendSummary = (productId: number | null): PainPointTrendSummary => {
	const painPoints = useModel('product', productId, (product) => product?.painPoints);

	return useMemo(() => {
		if (!painPoints || painPoints.length === 0) {
			return {
				hasTrends: false,
				trendingUp: 0,
				trendingDown: 0,
				stable: 0,
				avgConfidence: 0,
				significantTrends: 0,
			};
		}

		const painPointsWithTrends = painPoints.filter(
			(p) => p.trendConfidence && p.trendConfidence > 0.2 && (p.severityTrend || p.frequencyTrend),
		);

		if (painPointsWithTrends.length === 0) {
			return {
				hasTrends: false,
				trendingUp: 0,
				trendingDown: 0,
				stable: 0,
				avgConfidence: 0,
				significantTrends: 0,
			};
		}

		let trendingUp = 0;
		let trendingDown = 0;
		let stable = 0;
		let totalConfidence = 0;
		let significantTrends = 0;

		painPointsWithTrends.forEach((p) => {
			const hasUpTrend = p.severityTrend === 'up' || p.frequencyTrend === 'up';
			const hasDownTrend = p.severityTrend === 'down' || p.frequencyTrend === 'down';

			if (hasUpTrend) {
				trendingUp++;
			} else if (hasDownTrend) {
				trendingDown++;
			} else {
				stable++;
			}

			totalConfidence += p.trendConfidence || 0;

			if (p.trendConfidence && p.trendConfidence > 0.5) {
				significantTrends++;
			}
		});

		return {
			hasTrends: true,
			trendingUp,
			trendingDown,
			stable,
			avgConfidence: totalConfidence / painPointsWithTrends.length,
			significantTrends,
		};
	}, [painPoints]);
};

/**
 * Hook to check if any pain points have concerning upward trends
 */
export const useHasConcerningTrends = (productId: number | null): boolean => {
	return (
		useModel('product', productId, (product) => {
			if (!product?.painPoints) return false;

			return product.painPoints.some(
				(p) =>
					p.trendConfidence &&
					p.trendConfidence > 0.5 &&
					(p.severityTrend === 'up' || p.frequencyTrend === 'up') &&
					(p.severity > 60 || p.frequency > 10), // High severity or frequency
			);
		}) || false
	);
};
