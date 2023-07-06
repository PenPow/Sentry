<script lang="ts">
	import {
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl,
		Navbar,
		Sidebar,
		SidebarDropdownItem,
		SidebarDropdownWrapper,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { page } from '$app/stores';

	function capitalize(s: string) {
		return s[0].toUpperCase() + s.slice(1);
	}

	export let data: PageData;

	$: slug = $page.params.slug;
	$: splitSlug = slug.split("/")
</script>

<div class="mx-auto max-w-7xl md:px-8">
	<div class="md:flex max-w-2xl md:grid-cols-2 gap-x-8 gap-y-20 mx-0 md:max-w-none">
		<div class="hidden md:inline pr-8">
			<div class="max-w-lg max-h-min top-0 sticky self-start">
				<Sidebar>
					<SidebarWrapper>
						<SidebarGroup>
							<SidebarItem label="Welcome" active={slug === 'welcome'} href="/docs/welcome">
								<svelte:fragment slot="icon">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="w-6 h-6"
									>
										<path
											fill-rule="evenodd"
											d="M3 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.25zm0 4.5A.75.75 0 013.75 9h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9.75zm0 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm0 4.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
											clip-rule="evenodd"
										/>
									</svg>
								</svelte:fragment>
							</SidebarItem>
							<SidebarDropdownWrapper label="Legal">
								<svelte:fragment slot="icon">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-6 h-6"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
										/>
									</svg>
								</svelte:fragment>
								<SidebarDropdownItem
									label="Terms of Service"
									active={slug === 'tos'}
									href="/docs/tos"
								/>
								<SidebarDropdownItem
									label="Privacy"
									active={slug === 'privacy'}
									href="/docs/privacy"
								/>
							</SidebarDropdownWrapper>
						</SidebarGroup>
						<SidebarGroup border>
							<SidebarItem label="Setup" active={slug === 'setup'} href="/docs/setup">
								<svelte:fragment slot="icon">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-6 h-6"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</svelte:fragment>
							</SidebarItem>
							<SidebarItem
								label="Self-Hosting"
								active={slug === 'self-hosting'}
								href="/docs/self-hosting"
							>
								<svelte:fragment slot="icon">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-6 h-6"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5 0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z"
										/>
									</svg>
								</svelte:fragment>
							</SidebarItem>
						</SidebarGroup>
						<SidebarGroup border>
							<SidebarDropdownWrapper label="Concepts">
								<svelte:fragment slot="icon">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="w-6 h-6"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
										/>
									</svg>
								</svelte:fragment>
								<SidebarDropdownItem
									label="Punishments"
									active={slug === 'punishments'}
									href="/docs/punishments"
								/>
							</SidebarDropdownWrapper>
						</SidebarGroup>
					</SidebarWrapper>
				</Sidebar>
			</div>
		</div>
		<div class="inline md:hidden pr-8">
			<div class="max-w-full max-h-min top-0 self-start">
				<Navbar let:hidden let:toggle>
					<NavBrand href="/docs">
						<span class="ml-5 self-center whitespace-nowrap text-xl font-semibold dark:text-white">
							Documentation
						</span>
					</NavBrand>
					<NavHamburger class="mr-3 max-h-min" on:click={toggle} />
					<NavUl {hidden}>
						<NavLi href="/docs/welcome">Welcome</NavLi>
						<NavLi href="/docs/legal">Legal</NavLi>
						<NavLi href="/docs/setup">Setup</NavLi>
						<NavLi href="/docs/self-hosting">Self-Hosting</NavLi>
						<NavLi href="/docs/concepts">Concepts</NavLi>
					</NavUl>
				</Navbar>
			</div>
		</div>
		<div class="pt-3">
			<div class="px-6 prose max-w-none prose-img:rounded-md text-gray-900 prose-a:text-blue-600">
				<h1>{data.title}</h1>
				<svelte:component this={data.Content} />
			</div>
		</div>
	</div>
</div>
