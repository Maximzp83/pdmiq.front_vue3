import { getTimeDifference } from '@/helpers';

const setupProblemsStatistics1 = ({ data, prop, is_duration }) => {
	let newData = data.slice(0, data.length);
	// console.log(data, prop, newData)
	// const value_key = `${prop}_count`;
	newData.sort(function(a, b) {
		return b[prop] - a[prop];
	});

	newData = newData.slice(0, 7);

	let result = [];
	// console.log(newData)
	newData.forEach(di => {
		if (di[prop]) {
			result.push({
				key: prop,
				name: di.name,
				plant_id: di.plant_id,
				data_count: di[prop],
				instance_id: di.id,
				data_duration: is_duration
					? getTimeDifference({ to_ms: di[prop] })
					: undefined
			});
		}
	});

	return result;
};

export const setupProblemsStatistics = payload => setupProblemsStatistics1(payload);
