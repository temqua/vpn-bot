<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/assets/styles.css';
	import Footer from '$lib/Footer.svelte';
	import Header from '$lib/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Tesseract VPN</title>
</svelte:head>

<Header></Header>
<main>
	{@render children()}
</main>
<Footer></Footer>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100vh;
		width: 100%;
		font-family: 'BBH Hegarty', sans-serif;
	}
</style>
