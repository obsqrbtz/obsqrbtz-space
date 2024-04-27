<script>
	import { AppShell } from '@skeletonlabs/skeleton';
	import { AppBar } from '@skeletonlabs/skeleton';
</script>

<AppShell regionPage="relative" slotPageHeader="sticky top-0 z-10">
	<svelte:fragment slot="header">
		<AppBar>
			<h1 class="h1"><span class="gradient-heading">Some dev stuff</span></h1>
		</AppBar>
		<div>
			<h2 class="h2">
				About
			</h2>
			<p>
				Freaking metalhead and .NET developer. 
				At the moment my interests are Rust, NixOS, modern .NET and Linux ricing 
				(<a class="font-medium text-blue-600 dark:text-blue-500 hover:underline" href = "https://github.com/obsqrbtz/nixdots/">
					my dots btw</a>).
			</p>
		</div>
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