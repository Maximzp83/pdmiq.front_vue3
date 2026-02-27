<template>
	<div class="not-found-page">
		<div class="wrapper wrapper-full-page flex align-center justify-center">
			<div class="full-page">
				<div class="page-content">
					<h2 class="title common-title">Oops! Why you're here?</h2>

					<div class="description bold">
						Sorry, we can't find that page. You'll find lots to explore on the home
						page.
					</div>

					<router-link class="el-button el-button--primary" to="/">Back to Home</router-link>
				</div>

				<div class="section-image">
					<img :src="notFoundImage" alt="404" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import notFoundImage from '@/assets/img/404.png';
</script>
