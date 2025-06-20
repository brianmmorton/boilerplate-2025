type ExtractKey<PathString extends string> =
	PathString extends `${infer RoutePath}::${infer Method}`
		? { routePath: RoutePath; method: Method }
		: { error: 'Cannot parse string' };

export class Registry<
	Things extends { [key: string]: any }[],
	Extractor = (thing: Things[number]) => `${string}::${string}`,
> {
	private registry: Record<`${string}::${string}`, Things[number]> = {} as Record<
		`${string}::${string}`,
		Things[number]
	>;
	private extractor: Extractor;

	constructor(extractor: Extractor) {
		this.extractor = extractor;
	}

	register<TThing extends Things[number]>(thing: TThing) {
		const key = (this.extractor as (thing: TThing) => string)(thing) as keyof typeof this.registry;
		this.registry[key] = thing;
	}

	get<A extends ExtractKey<keyof typeof this.registry>>(a: A) {
		const key = `${a.routePath}::${a.method}` as keyof typeof this.registry;
		return this.registry[key];
	}
}
