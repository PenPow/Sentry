<script lang="ts">
	function scrollIntoView({ target }: any) {
		const el = document.querySelector(target.getAttribute('href'));
		if (!el) return;

		el.scrollIntoView({
			behavior: 'smooth'
		});
	}
</script>

<div class="bg-white">
	<div class="relative isolate px-6 lg:px-8">
		<div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
			<div class="text-center">
				<h1 class="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
					Moderation Made Simple.
				</h1>
				<p class="mt-6 text-lg leading-8 text-gray-600">
					Customizable
					<br />
					Forever Free
					<br />
					<u>No</u> Exceptions.
				</p>
				<div class="mt-10 flex items-center justify-center gap-x-6">
					<!-- TODO: Add Invite Link -->
					<a
						href="#"
						class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blurple-50 hover:bg-blurple-100 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
					>
						Invite
						<svg
							aria-hidden="true"
							class="ml-2 -mr-1 w-5 h-5"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
							><path
								fill-rule="evenodd"
								d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/></svg
						>
					</a>
					<a
						href="/docs"
						class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
					>
						Get Started
					</a>
					<a
						href="#about"
						on:click|preventDefault={scrollIntoView}
						class="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
					>
						Learn More
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
