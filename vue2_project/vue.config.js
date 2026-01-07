const Dotenv = require('dotenv-webpack');
const client = process.env.CLIENT || 'testmatrix';

module.exports = {
	productionSourceMap: false,
	chainWebpack: config => {
		config.plugins.delete('prefetch');

		const dotenvPath = process.env.DOTENV_PATH;

		if (dotenvPath) {
			config
			.plugin('dotenv')
			.use(Dotenv, [{ path: dotenvPath }]);
		}

		/*config.plugin('dotenv')
		.use(Dotenv, [
			{
				path:	process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development',
			},
			{
				path: `./.env.${client}`,
			},

		]);*/

		config.module
			.rule('highcharts')
			.test(/\.js$/)
			.include.add(/node_modules\/highcharts/)
			.end()
			.use('babel-loader')
			.loader('babel-loader')
			.options({
				presets: ['@babel/preset-env']
			});

		config.resolve.alias
			// .set('highcharts-vue', require.resolve('highcharts-vue'))
			// .set('highcharts', require.resolve('highcharts'))
			.set('highcharts_old', require.resolve('highcharts_old'))
			.set('highcharts_old/modules/stock', require.resolve('highcharts_old/modules/stock'))
			.set('highcharts_old/modules/boost', require.resolve('highcharts_old/modules/boost'));
	}
	// configureWebpack: {
	// 	module: {
	// 		rules: [
	// 			{
	// 				test: /\.js$/,
	// 				include: /node_modules\/highcharts/,
	// 				use: {
	// 					loader: 'babel-loader',
	// 					options: {
	// 						presets: ['@babel/preset-env'],
	// 					},
	// 				},
	// 			},
	// 		],
	// 	},
	// },
};
