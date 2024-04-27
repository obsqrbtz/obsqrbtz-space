<script>
	import { AppShell } from '@skeletonlabs/skeleton';
	import { AppBar } from '@skeletonlabs/skeleton';
</script>

<AppShell regionPage="relative" slotPageHeader="sticky top-0 z-10">
	<svelte:fragment slot="header">
		<AppBar>
			<h1 class="h1"><span class="gradient-heading">Under construction</span></h1>
		</AppBar>
	</svelte:fragment>
	<slot />
	<!-- ---- / ---- -->
	<!-- (pageFooter) -->
	<!-- <svelte:fragment slot="footer">
		<a
			class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
			href="https://github.com/obsqrbtz"
			target="_blank"
			rel="noreferrer">
			GitHub
		</a>
	</svelte:fragment> -->
</AppShell>