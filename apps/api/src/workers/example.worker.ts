import { WorkerService } from '../services/Worker.service';

export const exampleWorker = new WorkerService(
	'example',
	async (job, logger) => {
		// Do something
	},
	{},
);
