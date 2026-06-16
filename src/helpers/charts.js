export const initHighchartsModule = (moduleInit, highchartsInstance) => {
	const init = typeof moduleInit === 'function'
		? moduleInit
		: typeof moduleInit?.default === 'function'
			? moduleInit.default
			: null;

	if (init) {
		init(highchartsInstance);
	}
};
