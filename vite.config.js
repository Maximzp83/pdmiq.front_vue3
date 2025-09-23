import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-devtools'

// Плагины для автоподключения компонентов и API
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		// vueDevTools(),
		// Автоматический импорт компонентов Element Plus при использовании в шаблоне
		AutoImport({
			resolvers: [ElementPlusResolver()],
			// dts: false
		}),
		Components({
			resolvers: [ElementPlusResolver()],
			// dts: false
		}),
	],
	optimizeDeps: {
		include: ['element-plus'],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
							// console.log(id)
						
		        // ядро Vue
						if (id.includes('vue')) return 'vue';
						if (id.includes('vue-router')) return 'vue';
						if (id.includes('pinia')) return 'pinia';

		        // Quasar
						if (id.includes('element-plus')) {
							if (id.includes('date-picker')) return 'element-plus-date-picker';
							if (id.includes('dialog')) return 'element-plus-dialog';
							if (id.includes('form')) return 'element-plus-form';
							if (id.includes('menu')) return 'element-plus-menu';
							if (id.includes('select')) return 'element-plus-select';
							if (id.includes('select-v2')) return 'element-plus-select-v2';
							// console.log(id)
							return 'element-plus'
						};

		        // иконки (обычно большие по размеру)
						if (id.includes('lodash-es')) {
							// console.log(id)

							return 'lodash-es';
						};

		        // оставшиеся библиотеки
						return 'vendor';
					}
				}
			}
		}
	},
	css: {
		preprocessorOptions: {
			scss: { api: 'modern-compiler' },
			// scss: {
			// 		// @use "@/assets/sass/app.scss" as *;
			// 	additionalData: `
			// 		@use "@/assets/sass/variables" as *;
			// 		@use "@/assets/sass/mixins" as *;
			// 	`
			// }
		}
	},
	// server: {
	// 	watch: {
	//   	ignored: ['**/auto-imports.d.ts', '**/components.d.ts']
	// 	}
	// },
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		},
	},
})

