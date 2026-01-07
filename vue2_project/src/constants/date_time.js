import { Lang } from '@/localization';
import { getDateRange } from '@/helpers';

const datePickerShortcuts1 = [
	{
		text: 'constants.today',
		rangeName: 'today',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.yesterday',
		rangeName: 'yesterday',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.last_7_days',
		rangeName: 'last_7_days',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		disabledForCompare: true,
		text: 'constants.last_30_days',
		rangeName: 'last_30_days',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		disabledForCompare: true,
		text: 'constants.last_60_days',
		rangeName: 'last_60_days',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		disabledForCompare: true,
		text: 'constants.last_90_days',
		rangeName: 'last_90_days',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	}
	/*{
		disabledForCompare: true,
		text: 'constants.this_month',
		rangeName: 'this_month',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		disabledForCompare: true,
		text: 'constants.last_month',
		rangeName: 'last_month',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	}*/
];

const datePickerAdditionalShortcuts1 = [
	{
		text: 'constants.last_1_hour',
		rangeName: '1_hour',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.last_3_hours',
		rangeName: '3_hours',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.last_12_hours',
		rangeName: '12_hours',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	}
];

const datePickerYearQuartersShortcuts1 = [
	{
		text: 'constants.year_to_date',
		rangeName: 'this_year',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.first_quarter',
		rangeName: 'first_quarter',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.second_quarter',
		rangeName: 'second_quarter',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.third_quarter',
		rangeName: 'third_quarter',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.fourth_quarter',
		rangeName: 'fourth_quarter',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	}
];

/*export const utcZonesList = [
	{ id:1, label:'UTC-12:00', value: -12 },
	{ id:2, label:'UTC-11:00', value: -11 },
	{ id:3, label:'UTC-10:00', value: -10 },
	{ id:4, label:'UTC-09:00', value: -9 },
	{ id:5, label:'UTC-08:00', value: -8 },
	{ id:6, label:'UTC-07:00', value: -7 },
	{ id:7, label:'UTC-06:00', value: -6 },
	{ id:8, label:'UTC-05:00', value: -5 },
	{ id:9, label:'UTC-04:00', value: -4 },
	{ id:10, label:'UTC-03:00', value: -3 },
	{ id:11, label:'UTC-02:00', value: -2 },
	{ id:12, label:'UTC-01:00', value: -1 },
	{ id:13, label:'UTC 00:00', value: 0 },
	{ id:14, label:'UTC+01:00', value: 1 },
	{ id:15, label:'UTC+02:00', value: 2 },
	{ id:16, label:'UTC+03:00', value: 3 },
	{ id:17, label:'UTC+04:00', value: 4 },
	{ id:18, label:'UTC+05:00', value: 5 },
	{ id:19, label:'UTC+06:00', value: 6 },
	{ id:20, label:'UTC+07:00', value: 7 },
	{ id:21, label:'UTC+08:00', value: 8 },
	{ id:22, label:'UTC+09:00', value: 9 },
	{ id:23, label:'UTC+10:00', value: 10 },
	{ id:24, label:'UTC+11:00', value: 11 },
	{ id:25, label:'UTC+12:00', value: 12 },
	{ id:26, label:'UTC+13:00', value: 13 },
	{ id:27, label:'UTC+14:00', value: 14 }
];*/
export const TIME_ZONES = {
	UTC: 0,
	CANADA_ATLANTIC: 1,
	CANADA_CENTRAL: 2,
	CANADA_EASTERN: 3,
	CANADA_MOUNTAIN: 4,
	CANADA_NEWFOUNDLAND: 5,
	CANADA_PACIFIC: 6,
	CANADA_SASKATCHEWAN: 7,
	CANADA_YUKON: 8
};

const timeZonesList1 = [
	{ id: TIME_ZONES.UTC, label: 'UTC' },
	{ id: TIME_ZONES.CANADA_ATLANTIC, label: 'Canada/Atlantic' },
	{ id: TIME_ZONES.CANADA_CENTRAL, label: 'Canada/Central' },
	{ id: TIME_ZONES.CANADA_EASTERN, label: 'Canada/Eastern' },
	{ id: TIME_ZONES.CANADA_MOUNTAIN, label: 'Canada/Mountain' },
	{ id: TIME_ZONES.CANADA_NEWFOUNDLAND, label: 'Canada/Newfoundland' },
	{ id: TIME_ZONES.CANADA_PACIFIC, label: 'Canada/Pacific' },
	{ id: TIME_ZONES.CANADA_SASKATCHEWAN, label: 'Canada/Saskatchewan' },
	{ id: TIME_ZONES.CANADA_YUKON, label: 'Canada/Yukon' }
	// { id: 5, label: 'PST (-8:00)', value: -8 }
];

const localeMonths1 = [
	'constants.jan',
	'constants.feb',
	'constants.mar',
	'constants.apr',
	'constants.may',
	'constants.jun',
	'constants.jul',
	'constants.aug',
	'constants.sept',
	'constants.oct',
	'constants.nov',
	'constants.dec'
];

const localeMonthsFull1 = [
	'constants.january',
	'constants.february',
	'constants.march',
	'constants.april',
	'constants.may_f',
	'constants.june',
	'constants.july',
	'constants.august',
	'constants.september',
	'constants.october',
	'constants.november',
	'constants.december'
];

const weekdays1 = [
	'constants.sunday',
	'constants.monday',
	'constants.tuesday',
	'constants.wednesday',
	'constants.thursday',
	'constants.friday',
	'constants.satday'
];

export const datePickerShortcuts = () =>
	Lang.translate(datePickerShortcuts1, { key: 'text' });
export const datePickerAdditionalShortcuts = () =>
	Lang.translate(datePickerAdditionalShortcuts1, { key: 'text' });
export const datePickerYearQuartersShortcuts = () =>
	Lang.translate(datePickerYearQuartersShortcuts1, { key: 'text' });
export const timeZonesList = () => timeZonesList1;
export const localeMonths = translate =>
	translate ? localeMonths1.map(wi => Lang.tt(wi)) : localeMonths1;
export const localeMonthsFull = () => localeMonthsFull1.map(wi => Lang.tt(wi));
export const weekdays = () => weekdays1.map(wi => Lang.tt(wi));

/*export {
	datePickerShortcuts,
	datePickerAdditionalShortcuts,
	timeZonesList,
	localeMonths
};*/
