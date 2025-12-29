<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { setAuthContext } from '$lib/stores/auth.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();

	// Initialize auth context
	const auth = setAuthContext();

	onMount(() => {
		// Listen for storage changes (when user logs in/out in another tab)
		// Also listen for custom events when login happens in same tab
		function handleStorageChange() {
			auth.refresh();
		}

		function handleAuthChange() {
			auth.refresh();
		}

		window.addEventListener('storage', handleStorageChange);
		window.addEventListener('auth-changed', handleAuthChange);
		
		// Initial auth refresh
		auth.refresh();

		// Apply persisted UI preferences (theme, font, font size)
		try {
			const root = document.documentElement;

			// Theme
			const storedTheme = localStorage.getItem('dashboard.theme');
			if (storedTheme) {
				root.setAttribute('data-theme', storedTheme);
			}

			// Font family
			const storedFont = localStorage.getItem('dashboard.font');
			root.classList.remove('font-sans', 'font-serif', 'font-mono');
			if (storedFont === 'serif') {
				root.classList.add('font-serif');
			} else if (storedFont === 'mono') {
				root.classList.add('font-mono');
			} else {
				// default system
				root.classList.add('font-sans');
			}

			// Font size
			const storedFontSize = localStorage.getItem('dashboard.fontSize');
			root.classList.remove('text-sm', 'text-base', 'text-lg');
			if (storedFontSize === 'sm') {
				root.classList.add('text-sm');
			} else if (storedFontSize === 'lg') {
				root.classList.add('text-lg');
			} else {
				// default medium
				root.classList.add('text-base');
			}
		} catch (e) {
			console.error('Failed to apply stored UI preferences', e);
		}
		
		return () => {
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('auth-changed', handleAuthChange);
		};
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Navbar />

{@render children()}
