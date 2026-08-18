import Highcharts from 'highcharts';

Highcharts.setOptions({
	lang: {
		locale: 'en-En',
		decimalPoint: '.',
		thousandsSep: ' ',
	},
	xAxis: {
		dateTimeLabelFormats: {
			millisecond: { main: '%H:%M:%S.%L', range: false },
			second: { main: '%H:%M:%S', range: false },
			minute: { main: '%H:%M', range: false },
			hour: { main: '%H:%M', range: false },
		},
	},
	tooltip: {
		dateTimeLabelFormats: {
			millisecond: '%A, %e %b, %H:%M:%S.%L',
			second: '%A, %e %b, %H:%M:%S',
			minute: '%A, %e %b, %H:%M',
			hour: '%A, %e %b, %H:%M',
		},
	},
});

export default Highcharts;
