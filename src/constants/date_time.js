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

const datePickerAdditionalShortcuts_2 = [
	{
		text: 'constants.last_1_month',
		rangeName: 'last_month',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.last_6_months',
		rangeName: 'last_6_months',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
	{
		text: 'constants.last_12_months',
		rangeName: 'last_12_months',
		onClick(picker) {
			picker.$emit('pick', getDateRange(this.rangeName));
		}
	},
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
	/*CANADA_ATLANTIC: 1,
	CANADA_CENTRAL: 2,
	CANADA_EASTERN: 3,
	CANADA_MOUNTAIN: 4,
	CANADA_NEWFOUNDLAND: 5,
	CANADA_PACIFIC: 6,
	CANADA_SASKATCHEWAN: 7,
	CANADA_YUKON: 8*/

	// America - North America - Canada
	AMERICA_HALIFAX: 1,
	AMERICA_WINNIPEG: 2,
	AMERICA_TORONTO: 3,
	AMERICA_EDMONTON: 4,
	AMERICA_ST_JOHNS: 5,
	AMERICA_VANCOUVER: 6,
	AMERICA_REGINA: 7,
	AMERICA_WHITEHORSE: 8,
	// America - North America - United States
	AMERICA_NEW_YORK: 9,
	AMERICA_CHICAGO: 10,
	AMERICA_DENVER: 11,
	AMERICA_LOS_ANGELES: 12,
	AMERICA_ANCHORAGE: 13,
	AMERICA_PHOENIX: 14,
	AMERICA_HONOLULU: 15,
	// America - North America - Mexico
	AMERICA_MEXICO_CITY: 16,
	AMERICA_CANCUN: 17,
	AMERICA_TIJUANA: 18,
	// America - Central America & Caribbean
	AMERICA_GUATEMALA: 19,
	AMERICA_PANAMA: 20,
	AMERICA_HAVANA: 21,
	AMERICA_JAMAICA: 22,
	// America - South America
	AMERICA_SAO_PAULO: 23,
	AMERICA_BUENOS_AIRES: 24,
	AMERICA_SANTIAGO: 25,
	AMERICA_LIMA: 26,
	AMERICA_BOGOTA: 27,
	AMERICA_CARACAS: 28,
	AMERICA_MONTEVIDEO: 29,
	// Europe - Western Europe
	EUROPE_LONDON: 30,
	EUROPE_DUBLIN: 31,
	EUROPE_LISBON: 32,
	EUROPE_PARIS: 33,
	EUROPE_MADRID: 34,
	EUROPE_ROME: 35,
	EUROPE_BERLIN: 36,
	EUROPE_AMSTERDAM: 37,
	EUROPE_BRUSSELS: 38,
	EUROPE_ZURICH: 39,
	EUROPE_VIENNA: 40,
	// Europe - Northern Europe
	EUROPE_STOCKHOLM: 41,
	EUROPE_OSLO: 42,
	EUROPE_COPENHAGEN: 43,
	EUROPE_HELSINKI: 44,
	// Europe - Eastern Europe
	EUROPE_WARSAW: 45,
	EUROPE_PRAGUE: 46,
	EUROPE_BUDAPEST: 47,
	EUROPE_BUCHAREST: 48,
	EUROPE_ATHENS: 49,
	EUROPE_ISTANBUL: 50,
	EUROPE_KIEV: 51,
	EUROPE_MOSCOW: 52,
	EUROPE_MINSK: 53,
	// Asia - Middle East
	ASIA_DUBAI: 54,
	ASIA_RIYADH: 55,
	ASIA_KUWAIT: 56,
	ASIA_BAGHDAD: 57,
	ASIA_TEHRAN: 58,
	ASIA_JERUSALEM: 59,
	ASIA_BEIRUT: 60,
	// Asia - South Asia
	ASIA_KARACHI: 61,
	ASIA_KOLKATA: 62,
	ASIA_DHAKA: 63,
	ASIA_KATHMANDU: 64,
	// Asia - Southeast Asia
	ASIA_YANGON: 65,
	ASIA_BANGKOK: 66,
	ASIA_HO_CHI_MINH: 67,
	ASIA_JAKARTA: 68,
	ASIA_SINGAPORE: 69,
	ASIA_MANILA: 70,
	// Asia - East Asia
	ASIA_HONG_KONG: 71,
	ASIA_SHANGHAI: 72,
	ASIA_TAIPEI: 73,
	ASIA_SEOUL: 74,
	ASIA_TOKYO: 75,
	// Asia - Central Asia
	ASIA_TASHKENT: 76,
	ASIA_ALMATY: 77,
	// Africa - North Africa
	AFRICA_CAIRO: 78,
	AFRICA_ALGIERS: 79,
	AFRICA_TUNIS: 80,
	AFRICA_CASABLANCA: 81,
	// Africa - West Africa
	AFRICA_LAGOS: 82,
	AFRICA_ACCRA: 83,
	AFRICA_DAKAR: 84,
	// Africa - East Africa
	AFRICA_NAIROBI: 85,
	AFRICA_ADDIS_ABABA: 86,
	// Africa - Southern Africa
	AFRICA_JOHANNESBURG: 87,
	AFRICA_MAPUTO: 88,
	// Australia
	AUSTRALIA_SYDNEY: 89,
	AUSTRALIA_MELBOURNE: 90,
	AUSTRALIA_BRISBANE: 91,
	AUSTRALIA_PERTH: 92,
	AUSTRALIA_ADELAIDE: 93,
	AUSTRALIA_DARWIN: 94,
	// Pacific
	PACIFIC_AUCKLAND: 95,
	PACIFIC_FIJI: 96,
	PACIFIC_HONOLULU: 97,
	PACIFIC_TAHITI: 98,
	PACIFIC_GUAM: 99,
	PACIFIC_SAMOA: 100,
	PACIFIC_TONGATAPU: 101,
	// Atlantic
	ATLANTIC_AZORES: 102,
	ATLANTIC_CAPE_VERDE: 103,
	ATLANTIC_REYKJAVIK: 104,
	ATLANTIC_BERMUDA: 105,
	// Indian Ocean
	INDIAN_MALDIVES: 106,
	INDIAN_MAURITIUS: 107,
	// Antarctica
	ANTARCTICA_MCMURDO: 108,
};

const timeZonesList1 = [
	{ id: TIME_ZONES.UTC, label: 'UTC' },
	{ id: TIME_ZONES.AMERICA_HALIFAX, label: 'America/Halifax' },
	{ id: TIME_ZONES.AMERICA_WINNIPEG, label: 'America/Winnipeg' },
	{ id: TIME_ZONES.AMERICA_TORONTO, label: 'America/Toronto' },
	{ id: TIME_ZONES.AMERICA_EDMONTON, label: 'America/Edmonton' },
	{ id: TIME_ZONES.AMERICA_ST_JOHNS, label: 'America/St_Johns' },
	{ id: TIME_ZONES.AMERICA_VANCOUVER, label: 'America/Vancouver' },
	{ id: TIME_ZONES.AMERICA_REGINA, label: 'America/Regina' },
	{ id: TIME_ZONES.AMERICA_WHITEHORSE, label: 'America/Whitehorse' },
	{ id: TIME_ZONES.AMERICA_NEW_YORK, label: 'America/New_York' },
	{ id: TIME_ZONES.AMERICA_CHICAGO, label: 'America/Chicago' },
	{ id: TIME_ZONES.AMERICA_DENVER, label: 'America/Denver' },
	{ id: TIME_ZONES.AMERICA_LOS_ANGELES, label: 'America/Los_Angeles' },
	{ id: TIME_ZONES.AMERICA_ANCHORAGE, label: 'America/Anchorage' },
	{ id: TIME_ZONES.AMERICA_PHOENIX, label: 'America/Phoenix' },
	{ id: TIME_ZONES.AMERICA_HONOLULU, label: 'America/Honolulu' },
	{ id: TIME_ZONES.AMERICA_MEXICO_CITY, label: 'America/Mexico_City' },
	{ id: TIME_ZONES.AMERICA_CANCUN, label: 'America/Cancun' },
	{ id: TIME_ZONES.AMERICA_TIJUANA, label: 'America/Tijuana' },
	{ id: TIME_ZONES.AMERICA_GUATEMALA, label: 'America/Guatemala' },
	{ id: TIME_ZONES.AMERICA_PANAMA, label: 'America/Panama' },
	{ id: TIME_ZONES.AMERICA_HAVANA, label: 'America/Havana' },
	{ id: TIME_ZONES.AMERICA_JAMAICA, label: 'America/Jamaica' },
	{ id: TIME_ZONES.AMERICA_SAO_PAULO, label: 'America/Sao_Paulo' },
	{ id: TIME_ZONES.AMERICA_BUENOS_AIRES, label: 'America/Buenos_Aires' },
	{ id: TIME_ZONES.AMERICA_SANTIAGO, label: 'America/Santiago' },
	{ id: TIME_ZONES.AMERICA_LIMA, label: 'America/Lima' },
	{ id: TIME_ZONES.AMERICA_BOGOTA, label: 'America/Bogota' },
	{ id: TIME_ZONES.AMERICA_CARACAS, label: 'America/Caracas' },
	{ id: TIME_ZONES.AMERICA_MONTEVIDEO, label: 'America/Montevideo' },
	
	{ id: TIME_ZONES.EUROPE_LONDON, label: 'Europe/London' },
	{ id: TIME_ZONES.EUROPE_DUBLIN, label: 'Europe/Dublin' },
	{ id: TIME_ZONES.EUROPE_LISBON, label: 'Europe/Lisbon' },
	{ id: TIME_ZONES.EUROPE_PARIS, label: 'Europe/Paris' },
	{ id: TIME_ZONES.EUROPE_MADRID, label: 'Europe/Madrid' },
	{ id: TIME_ZONES.EUROPE_ROME, label: 'Europe/Rome' },
	{ id: TIME_ZONES.EUROPE_BERLIN, label: 'Europe/Berlin' },
	{ id: TIME_ZONES.EUROPE_AMSTERDAM, label: 'Europe/Amsterdam' },
	{ id: TIME_ZONES.EUROPE_BRUSSELS, label: 'Europe/Brussels' },
	{ id: TIME_ZONES.EUROPE_ZURICH, label: 'Europe/Zurich' },
	{ id: TIME_ZONES.EUROPE_VIENNA, label: 'Europe/Vienna' },
	{ id: TIME_ZONES.EUROPE_STOCKHOLM, label: 'Europe/Stockholm' },
	{ id: TIME_ZONES.EUROPE_OSLO, label: 'Europe/Oslo' },
	{ id: TIME_ZONES.EUROPE_COPENHAGEN, label: 'Europe/Copenhagen' },
	{ id: TIME_ZONES.EUROPE_HELSINKI, label: 'Europe/Helsinki' },
	{ id: TIME_ZONES.EUROPE_WARSAW, label: 'Europe/Warsaw' },
	{ id: TIME_ZONES.EUROPE_PRAGUE, label: 'Europe/Prague' },
	{ id: TIME_ZONES.EUROPE_BUDAPEST, label: 'Europe/Budapest' },
	{ id: TIME_ZONES.EUROPE_BUCHAREST, label: 'Europe/Bucharest' },
	{ id: TIME_ZONES.EUROPE_ATHENS, label: 'Europe/Athens' },
	{ id: TIME_ZONES.EUROPE_ISTANBUL, label: 'Europe/Istanbul' },
	{ id: TIME_ZONES.EUROPE_KIEV, label: 'Europe/Kiev' },
	{ id: TIME_ZONES.EUROPE_MOSCOW, label: 'Europe/Moscow' },
	{ id: TIME_ZONES.EUROPE_MINSK, label: 'Europe/Minsk' },

	{ id: TIME_ZONES.ASIA_DUBAI, label: 'Asia/Dubai' },
	{ id: TIME_ZONES.ASIA_RIYADH, label: 'Asia/Riyadh' },
	{ id: TIME_ZONES.ASIA_KUWAIT, label: 'Asia/Kuwait' },
	{ id: TIME_ZONES.ASIA_BAGHDAD, label: 'Asia/Baghdad' },
	{ id: TIME_ZONES.ASIA_TEHRAN, label: 'Asia/Tehran' },
	{ id: TIME_ZONES.ASIA_JERUSALEM, label: 'Asia/Jerusalem' },
	{ id: TIME_ZONES.ASIA_BEIRUT, label: 'Asia/Beirut' },
	{ id: TIME_ZONES.ASIA_KARACHI, label: 'Asia/Karachi' },
	{ id: TIME_ZONES.ASIA_KOLKATA, label: 'Asia/Kolkata' },
	{ id: TIME_ZONES.ASIA_DHAKA, label: 'Asia/Dhaka' },
	{ id: TIME_ZONES.ASIA_KATHMANDU, label: 'Asia/Kathmandu' },
	{ id: TIME_ZONES.ASIA_YANGON, label: 'Asia/Yangon' },
	{ id: TIME_ZONES.ASIA_BANGKOK, label: 'Asia/Bangkok' },
	{ id: TIME_ZONES.ASIA_HO_CHI_MINH, label: 'Asia/Ho_Chi_Minh' },

	{ id: TIME_ZONES.ASIA_JAKARTA, label: 'Asia/Jakarta' },
	{ id: TIME_ZONES.ASIA_SINGAPORE, label: 'Asia/Singapore' },
	{ id: TIME_ZONES.ASIA_MANILA, label: 'Asia/Manila' },
	{ id: TIME_ZONES.ASIA_HONG_KONG, label: 'Asia/Hong_Kong' },
	{ id: TIME_ZONES.ASIA_SHANGHAI, label: 'Asia/Shanghai' },
	{ id: TIME_ZONES.ASIA_TAIPEI, label: 'Asia/Taipei' },
	{ id: TIME_ZONES.ASIA_SEOUL, label: 'Asia/Seoul' },
	{ id: TIME_ZONES.ASIA_TOKYO, label: 'Asia/Tokyo' },
	{ id: TIME_ZONES.ASIA_TASHKENT, label: 'Asia/Tashkent' },
	{ id: TIME_ZONES.ASIA_ALMATY, label: 'Asia/Almaty' },
	{ id: TIME_ZONES.AFRICA_CAIRO, label: 'Africa/Cairo' },
	{ id: TIME_ZONES.AFRICA_ALGIERS, label: 'Africa/Algiers' },
	{ id: TIME_ZONES.AFRICA_TUNIS, label: 'Africa/Tunis' },
	{ id: TIME_ZONES.AFRICA_CASABLANCA, label: 'Africa/Casablanca' },
	{ id: TIME_ZONES.AFRICA_LAGOS, label: 'Africa/Lagos' },
	{ id: TIME_ZONES.AFRICA_ACCRA, label: 'Africa/Accra' },
	{ id: TIME_ZONES.AFRICA_DAKAR, label: 'Africa/Dakar' },
	{ id: TIME_ZONES.AFRICA_NAIROBI, label: 'Africa/Nairobi' },
	{ id: TIME_ZONES.AFRICA_ADDIS_ABABA, label: 'Africa/Addis_Ababa' },
	{ id: TIME_ZONES.AFRICA_JOHANNESBURG, label: 'Africa/Johannesburg' },
	{ id: TIME_ZONES.AFRICA_MAPUTO, label: 'Africa/Maputo' },
	{ id: TIME_ZONES.AUSTRALIA_SYDNEY, label: 'Australia/Sydney' },
	{ id: TIME_ZONES.AUSTRALIA_MELBOURNE, label: 'Australia/Melbourne' },
	{ id: TIME_ZONES.AUSTRALIA_BRISBANE, label: 'Australia/Brisbane' },
	{ id: TIME_ZONES.AUSTRALIA_PERTH, label: 'Australia/Perth' },
	{ id: TIME_ZONES.AUSTRALIA_ADELAIDE, label: 'Australia/Adelaide' },
	{ id: TIME_ZONES.AUSTRALIA_DARWIN, label: 'Australia/Darwin' },
	{ id: TIME_ZONES.PACIFIC_AUCKLAND, label: 'Pacific/Auckland' },
	{ id: TIME_ZONES.PACIFIC_FIJI, label: 'Pacific/Fiji' },
	{ id: TIME_ZONES.PACIFIC_HONOLULU, label: 'Pacific/Honolulu' },
	{ id: TIME_ZONES.PACIFIC_TAHITI, label: 'Pacific/Tahiti' },
	{ id: TIME_ZONES.PACIFIC_GUAM, label: 'Pacific/Guam' },
	{ id: TIME_ZONES.PACIFIC_SAMOA, label: 'Pacific/Samoa' },
	{ id: TIME_ZONES.PACIFIC_TONGATAPU, label: 'Pacific/Tongatapu' },
	{ id: TIME_ZONES.ATLANTIC_AZORES, label: 'Atlantic/Azores' },
	{ id: TIME_ZONES.ATLANTIC_CAPE_VERDE, label: 'Atlantic/Cape_Verde' },
	{ id: TIME_ZONES.ATLANTIC_REYKJAVIK, label: 'Atlantic/Reykjavik' },
	{ id: TIME_ZONES.ATLANTIC_BERMUDA, label: 'Atlantic/Bermuda' },
	{ id: TIME_ZONES.INDIAN_MALDIVES, label: 'Indian/Maldives' },
	{ id: TIME_ZONES.INDIAN_MAURITIUS, label: 'Indian/Mauritius' },
	{ id: TIME_ZONES.ANTARCTICA_MCMURDO, label: 'Antarctica/McMurdo' },	

	/*{ id: TIME_ZONES.CANADA_ATLANTIC, label: 'Canada/Atlantic' },
	{ id: TIME_ZONES.CANADA_CENTRAL, label: 'Canada/Central' },
	{ id: TIME_ZONES.CANADA_EASTERN, label: 'Canada/Eastern' },
	{ id: TIME_ZONES.CANADA_MOUNTAIN, label: 'Canada/Mountain' },
	{ id: TIME_ZONES.CANADA_NEWFOUNDLAND, label: 'Canada/Newfoundland' },
	{ id: TIME_ZONES.CANADA_PACIFIC, label: 'Canada/Pacific' },
	{ id: TIME_ZONES.CANADA_SASKATCHEWAN, label: 'Canada/Saskatchewan' },
	{ id: TIME_ZONES.CANADA_YUKON, label: 'Canada/Yukon' }*/
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
export const datePickerAdditionalShortcuts2 = () =>
	Lang.translate(datePickerAdditionalShortcuts_2, { key: 'text' });
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
