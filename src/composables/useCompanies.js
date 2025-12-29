/**
 * Companies Composable
 * Handles all company-related API operations
 * Uses api_request for HTTP calls and CompaniesStore for state management
 */

import { api_request } from '@/api/request_provider';
import { useCompaniesStore } from '@/stores/CompaniesStore';

export function useCompanies() {
	const companiesStore = useCompaniesStore();

	/**
	 * Fetch companies list
	 * @param {Object} params - Query parameters (page, max, search, etc.)
	 * @returns {Promise}
	 */
	const fetchCompanies = (params = {}) => {
		return api_request.get('/companies', {
			params: {
				max: companiesStore.filters.max,
				page: companiesStore.filters.page,
				...params,
			},
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'companiesStore',
			toStore: true,
			stateProp: 'itemsList',
			notNotify: true,
		});
	};

	/**
	 * Fetch single company by ID
	 * @param {number} companyId - Company ID
	 * @returns {Promise}
	 */
	const fetchCompany = (companyId) => {
		return api_request.get(`/companies/${companyId}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'companiesStore',
			toStore: true,
			stateProp: 'itemData',
			notNotify: true,
		});
	};

	/**
	 * Generate IDP host for SAML2 authentication
	 * @param {Object} data - IDP host data
	 * @returns {Promise}
	 */
	const generateIdpHost = (data) => {
		return api_request.post('/companies/saml2/idp-host', {
			data,
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'companiesStore',
			notNotify: true,
			dataPath: 'data', // Extract response.data directly
		});
	};

	/**
	 * Create new company
	 * @param {Object} companyData - Company data
	 * @returns {Promise}
	 */
	const createCompany = (companyData) => {
		return api_request.post('/companies', {
			data: companyData,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'companiesStore',
			notify: true,
			resultMessage: 'Company created successfully',
		});
	};

	/**
	 * Update existing company
	 * @param {number} companyId - Company ID
	 * @param {Object} companyData - Updated company data
	 * @returns {Promise}
	 */
	const updateCompany = (companyId, companyData) => {
		return api_request.put(`/companies/${companyId}`, {
			data: companyData,
			loading: true,
			loadingProp: 'isSaving',
			storeName: 'companiesStore',
			notify: true,
			resultMessage: 'Company updated successfully',
		});
	};

	/**
	 * Delete company
	 * @param {number} companyId - Company ID
	 * @returns {Promise}
	 */
	const deleteCompany = (companyId) => {
		return api_request.delete(`/companies/${companyId}`, {
			loading: true,
			loadingProp: 'isLoading',
			storeName: 'companiesStore',
			notify: true,
			resultMessage: 'Company deleted successfully',
		});
	};

	return {
		// Store reference
		companiesStore,

		// API methods
		fetchCompanies,
		fetchCompany,
		generateIdpHost,
		createCompany,
		updateCompany,
		deleteCompany,
	};
}
