import { cleanDateString } from '@/helpers';

export const buildEventLogsMeta = (pagination = {}) => {
	const per_page = pagination.per_page || 25;
	const total = pagination.total;
	const current_page = pagination.current_page || 1;

	if (total == null) {
		return {
			per_page,
			total: null,
			current_page: null,
			next_token: pagination.next_token || null,
		};
	}

	const from = total ? (current_page - 1) * per_page + 1 : 0;
	const to = total ? Math.min(current_page * per_page, total) : 0;

	return {
		per_page,
		total,
		current_page,
		from,
		to,
		next_token: pagination.next_token || null,
	};
};

export const getEventLogCauserName = (log) => {
	const fullName = log && log.causer_data && log.causer_data.full_name;

	return fullName || 'System';
};

export const createMeasurementUnitCreationLogsMap = (logs = []) =>
	logs.reduce((result, log) => {
		if (!log || log.subject_id == null) return result;

		const subjectId = `${log.subject_id}`;
		const currentLog = result[subjectId];

		if (!currentLog || Date.parse(log.logged_at) > Date.parse(currentLog.logged_at)) {
			result[subjectId] = log;
		}

		return result;
	}, {});

export const enrichMeasurementUnitsWithCreationLogs = ({ units = [], logsMap = {} }) =>
	units.map((unit) => {
		const creationLog = logsMap[`${unit.id}`] || null;
		const createdByName = creationLog ? getEventLogCauserName(creationLog) : '-';
		const createdAt = creationLog ? creationLog.logged_at : null;

		return {
			...unit,
			creation_log: creationLog,
			created_by_name: createdByName,
			created_at_display: createdAt ? cleanDateString(createdAt) : '-',
		};
	});
