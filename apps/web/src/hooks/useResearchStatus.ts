import { cache, useModel } from '@/cache/cache';
import { useCurrentProductId } from '@/cache/currentProductStore';
import { usePrevious } from '@uidotdev/usehooks';
import { subHours } from 'date-fns';
import { useEffect, useMemo } from 'react';

export const useResearchStatus = () => {
	const currentProductId = useCurrentProductId();
	const lastResearch = useModel('product', currentProductId, (state) => {
		return state?.researches?.sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)[0];
	});
	const failedResearchStep = useMemo(() => {
		if (!lastResearch) return null;
		return lastResearch.researchSteps.find((step) => step.status === 'FAILED');
	}, [lastResearch]);
	const isRunningAnalysis = useMemo(() => {
		if (!lastResearch) return false;
		return lastResearch.researchSteps.some(
			(step) => step.status === 'IN_PROGRESS' || step.status === 'PENDING',
		);
	}, [lastResearch]);
	const lastAttemptFailed = useMemo(() => {
		if (!lastResearch) return false;
		return (
			!isRunningAnalysis && lastResearch.researchSteps.some((step) => step.status === 'FAILED')
		);
	}, [lastResearch, isRunningAnalysis]);
	const canRefreshAnalysis = useMemo(() => {
		if (isRunningAnalysis) return false;
		if (lastAttemptFailed) return true;
		if (!lastResearch) return true;
		if (lastResearch.researchSteps.length === 0) return true;
		if (subHours(new Date(), 1).getTime() > new Date(lastResearch.createdAt).getTime()) return true;
		return false;
	}, [isRunningAnalysis, lastAttemptFailed]);
	const previousIsAnalyzingPainPoints = usePrevious(isRunningAnalysis);

	useEffect(() => {
		if (previousIsAnalyzingPainPoints && !isRunningAnalysis) {
			cache.fetchData('company', {
				url: '/1/me/companies',
				force: true,
			});
		}
	}, [isRunningAnalysis, previousIsAnalyzingPainPoints]);

	return {
		failedResearchStep,
		isRunningAnalysis,
		lastAttemptFailed,
		canRefreshAnalysis,
	};
};
