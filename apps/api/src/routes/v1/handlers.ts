import { handlersRegistry } from './handlersRegistry';

type ExtractKey<PathString extends string> =
	PathString extends `${infer RoutePath}::${infer Method}`
		? { routePath: RoutePath; method: Method }
		: { error: 'Cannot parse string' };

// Registry is now empty since all handlers register themselves directly with the router
const registry: Record<string, any> = handlersRegistry as Record<string, any>;

type HandlersUnion = ExtractKey<keyof typeof registry>;

// Legacy function - handlers now register themselves directly with the router
export function getHandler<A extends { routePath: string; method: string }>(a: A) {
	const key = `${a.routePath}::${a.method}` as keyof typeof registry;
	return registry[key];
}
