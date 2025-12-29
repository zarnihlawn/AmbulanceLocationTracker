<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { APP_NAME } from '$lib/config/app';

	let auth;
	try {
		auth = getAuthContext();
	} catch {
		auth = null;
	}

	const appName = APP_NAME || 'Pun Hlaing Account';
</script>

<svelte:head>
	<title>{appName}</title>
</svelte:head>

<div class="min-h-screen bg-base-100">
	<!-- Hero Section -->
	<section class="py-20 px-4">
		<div class="max-w-6xl mx-auto text-center">
			<div class="space-y-6 mb-12">
				<h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-base-content">
					All of {appName},<br />
					working for you
				</h1>
				<p class="text-xl md:text-2xl text-base-content/70 max-w-3xl mx-auto">
					Sign in to your account, and get the most out of all the services that you use. 
					Your account helps you do more by personalising your experience and offering easy access 
					to your most important information from anywhere.
				</p>
			</div>

			{#if auth?.isAuthenticated && auth?.user}
				<div class="space-y-6">
					<p class="text-lg text-base-content/60">
						Welcome back, <strong>{auth.user.firstName && auth.user.lastName ? `${auth.user.firstName} ${auth.user.lastName}` : auth.user.username || auth.user.email}</strong>!
					</p>
					<div class="flex justify-center gap-4">
						<Button variant="primary" size="lg" onClick={() => goto(resolve('/dashboard'))}>
							Go to Dashboard
						</Button>
					</div>
				</div>
			{:else}
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<Button variant="primary" size="lg" onClick={() => goto(resolve('/login'))}>
						Log In
					</Button>
					<Button variant="outline" size="lg" onClick={() => goto(resolve('/register'))}>
						Sign Up
					</Button>
				</div>
			{/if}
		</div>
	</section>

	<!-- Feature Sections -->
	<section class="py-16 px-4 bg-base-200">
		<div class="max-w-6xl mx-auto">
			<div class="grid md:grid-cols-3 gap-8 md:gap-12">
				<!-- Helps you -->
				<div class="text-center md:text-left">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
							<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
						</svg>
					</div>
					<h2 class="text-2xl font-semibold mb-3">Helps you</h2>
					<p class="text-base-content/70">
						When you're signed in, all services work together seamlessly to offer help with everyday tasks 
						and keep your information synchronized across platforms.
					</p>
				</div>

				<!-- Built for you -->
				<div class="text-center md:text-left">
					<div class="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-secondary">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a7.723 7.723 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
					</div>
					<h2 class="text-2xl font-semibold mb-3">Built for you</h2>
					<p class="text-base-content/70">
						No matter which device or service you're using, your account gives you a consistent experience 
						that you can customise and manage at any time.
					</p>
				</div>

				<!-- Protects you -->
				<div class="text-center md:text-left">
					<div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-accent">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
						</svg>
					</div>
					<h2 class="text-2xl font-semibold mb-3">Protects you</h2>
					<p class="text-base-content/70">
						Your account is protected by industry-leading security that automatically helps detect and block 
						threats before they ever reach you.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Ready to help section -->
	<section class="py-16 px-4 bg-base-100">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-4xl font-bold mb-4">Ready to help</h2>
				<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
					Our services work better and help you do more when you're signed in. Your account gives you access 
					to helpful features and personalised recommendations at any time, on any device.
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8">
				<!-- Auto-fill -->
				<div class="d-card bg-base-200 shadow-lg">
					<div class="d-card-body">
						<div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-primary">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Auto-fill</h3>
						<p class="text-base-content/70">
							Your account helps you save time by automatically filling in passwords, addresses, and other 
							information using the data you've saved.
						</p>
					</div>
				</div>

				<!-- Works better -->
				<div class="d-card bg-base-200 shadow-lg">
					<div class="d-card-body">
						<div class="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-secondary">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Works better for you</h3>
						<p class="text-base-content/70">
							When you sign in, all services work together to help you get more done with seamless 
							synchronization and integration.
						</p>
					</div>
				</div>

				<!-- Stay connected -->
				<div class="d-card bg-base-200 shadow-lg">
					<div class="d-card-body">
						<div class="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-accent">
								<path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Stay connected</h3>
						<p class="text-base-content/70">
							A single sign-in allows for a seamless experience across devices, keeping your preferences 
							and data accessible wherever you go.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Just for you section -->
	<section class="py-16 px-4 bg-base-200">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-4xl font-bold mb-4">Just for you</h2>
				<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
					Your account makes every service personalized to you. Just sign in to access your preferences, 
					privacy, and personalization controls from any device.
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8">
				<!-- Instant access -->
				<div class="text-center md:text-left">
					<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-primary">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Instant access</h3>
					<p class="text-base-content/70">
						You're never more than a tap away from your data and settings. Access everything you need 
						quickly and easily.
					</p>
				</div>

				<!-- Privacy controls -->
				<div class="text-center md:text-left">
					<div class="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-secondary">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a7.723 7.723 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">Privacy controls</h3>
					<p class="text-base-content/70">
						Choose the privacy settings that are right for you with easy-to-use controls and tools. 
						Manage your data with simple on/off controls.
					</p>
				</div>

				<!-- Safe place -->
				<div class="text-center md:text-left">
					<div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-accent">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold mb-2">A safe place for your info</h3>
					<p class="text-base-content/70">
						Your account gives you a safe, central place to store your personal information so that 
						it's always available when you need it.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Security section -->
	<section class="py-16 px-4 bg-base-100">
		<div class="max-w-6xl mx-auto">
			<div class="text-center mb-12">
				<h2 class="text-4xl font-bold mb-4">Keeping your information private, safe, and secure</h2>
				<p class="text-xl text-base-content/70 max-w-3xl mx-auto">
					Protecting all the information in your account has never been more important. That's why we've built 
					powerful protections and tools into every account.
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8">
				<!-- Built-in security -->
				<div class="d-card bg-base-200 shadow-lg">
					<div class="d-card-body">
						<div class="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-error">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Built-in security</h3>
						<p class="text-base-content/70">
							Your account automatically protects your personal information and keeps it private and safe 
							with powerful security features.
						</p>
					</div>
				</div>

				<!-- Security Check-Up -->
				<div class="d-card bg-base-200 shadow-lg">
					<div class="d-card-body">
						<div class="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-warning">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Security Check-Up</h3>
						<p class="text-base-content/70">
							Get personalized recommendations to help keep your account secure with our simple security 
							check-up tool.
						</p>
					</div>
				</div>

				<!-- Password Manager -->
				<div class="d-card bg-base-200 shadow-lg">
					<div class="d-card-body">
						<div class="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-info">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Password Manager</h3>
						<p class="text-base-content/70">
							Your account comes with a built-in password manager that securely saves your passwords in 
							a central place that only you can access.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 px-4 bg-base-200">
		<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-4xl md:text-5xl font-bold mb-6">Your {appName} starts here</h2>
			{#if auth?.isAuthenticated && auth?.user}
				<Button variant="primary" size="lg" onClick={() => goto(resolve('/dashboard'))}>
					Go to Dashboard
				</Button>
			{:else}
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<Button variant="primary" size="lg" onClick={() => goto(resolve('/login'))}>
						Log In
					</Button>
					<Button variant="outline" size="lg" onClick={() => goto(resolve('/register'))}>
						Sign Up
					</Button>
				</div>
			{/if}
		</div>
	</section>
</div>
