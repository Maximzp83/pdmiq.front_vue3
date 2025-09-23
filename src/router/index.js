import { createRouter, createWebHistory } from 'vue-router';

// const Navbar = () => import('@/components/layout/TopNavbar.vue');
// const Sidebar = () => import('@/components/layout/Sidebar/Sidebar.vue');

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			component: () => import('@/components/layout/DashboardLayout.vue'),
			children: [
				{
					path: 'dashboard',
					name: 'PlantDashboard',
					redirect: '/dashboard/plant',
					meta: {
						auth: true,
						permissions: ['view_dashboard']
					},
					component: () => import('@/views/Dashboard/Dashboard.vue'),

					children: [
						{
							path: 'plant',
							name: 'PlantDetails',
							component: () => import('@/views/Plants/Details/DetailsPage.vue'),
							meta: {
								auth: true
							}
						},
						{
							path: 'machines',
							name: 'Machines',
							component: () => import('@/views/Machines/ItemsList.vue'),
							meta: { auth: true }
						},
					]
				}
			]
		},
	],
})

export default router;
