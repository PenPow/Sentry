<script>
	let innerWidth = 0;
</script>

<svelte:window bind:innerWidth />

<section id="about">
	<div class="overflow-hidden bg-white py-8 sm:py-12">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div
				class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2"
			>
				<div class="lg:pr-8 lg:pt-4">
					<div class="lg:max-w-lg">
						<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							Flexible Moderation
						</p>
						<p class="mt-6 text-lg leading-8 text-gray-600">
							Work with your moderation bots, not against them
						</p>
						<dl class="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
											clip-rule="evenodd"
										/>
									</svg>

									Detailed Logging.
								</dt>
								<dd class="inline">
									Sentry's logging module provides detailed insights into moderation cases.
								</dd>
							</div>
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M10.339 2.237a.532.532 0 00-.678 0 11.947 11.947 0 01-7.078 2.75.5.5 0 00-.479.425A12.11 12.11 0 002 7c0 5.163 3.26 9.564 7.834 11.257a.48.48 0 00.332 0C14.74 16.564 18 12.163 18 7.001c0-.54-.035-1.07-.104-1.59a.5.5 0 00-.48-.425 11.947 11.947 0 01-7.077-2.75zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
											clip-rule="evenodd"
										/>
									</svg>

									Discord Automod Integration.
								</dt>
								<dd class="inline">
									Sentry integrates into Discord's native automod to provide a seamless moderation
									experience.
								</dd>
							</div>
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M11 2a1 1 0 10-2 0v6.5a.5.5 0 01-1 0V3a1 1 0 10-2 0v5.5a.5.5 0 01-1 0V5a1 1 0 10-2 0v7a7 7 0 1014 0V8a1 1 0 10-2 0v3.5a.5.5 0 01-1 0V3a1 1 0 10-2 0v5.5a.5.5 0 01-1 0V2z"
											clip-rule="evenodd"
										/>
									</svg>

									Raid Protection.
								</dt>
								<dd class="inline">
									Gone are the days of server raids. Sentry allows raids to be stopped by preventing
									new entries to the server, while also providing commands to remove all accounts
									suspected of raiding
								</dd>
							</div>
						</dl>
					</div>
				</div>

				<img
					src="/automod.png"
					alt="Automod Integration"
					class="max-h-full max-w-full rounded-xl shadow-xl pt-24 md:-ml-4 lg:-ml-0"
					width="601"
					height="217"
				/>
			</div>
		</div>
	</div>

	<div class="overflow-hidden bg-white py-8 sm:py-12">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div
				class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2"
			>
				<img
					src="/mod-embed.png"
					alt="Moderation Embed"
					class="rounded-xl shadow-xl pt-24 max-h-full max-w-full md:-mr-4 lg:-mr-0"
					width="601"
					height="217"
				/>
				<div class="lg:pl-8 lg:pt-4">
					<div class="lg:max-w-lg">
						<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							Customizable Settings
						</p>
						<p class="mt-6 text-lg leading-8 text-gray-600">
							Every aspect of Sentry can be customized to fit <em>your</em> needs.
						</p>
						<dl class="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
											clip-rule="evenodd"
										/>
									</svg>

									Permissions
								</dt>
								<dd class="inline">Provide your moderators with fine-grained access</dd>
							</div>
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z"
											clip-rule="evenodd"
										/>
									</svg>

									Default Reasons
								</dt>
								<dd class="inline">
									Sentry understands moderation. No more copy-pasting rules into punishment reasons,
									integrate it directly into the punishment creation system.
								</dd>
							</div>
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M2 3a1 1 0 00-1 1v1a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2z" />
										<path
											fill-rule="evenodd"
											d="M2 7.5h16l-.811 7.71a2 2 0 01-1.99 1.79H4.802a2 2 0 01-1.99-1.79L2 7.5zM7 11a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
											clip-rule="evenodd"
										/>
									</svg>

									Modules
								</dt>
								<dd class="inline">
									Don't need a function that Sentry offers? Just disable it and it's gone!
								</dd>
							</div>
						</dl>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="overflow-hidden bg-white py-8 sm:py-12">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div
				class="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2"
			>
				<div class="lg:pr-8 lg:pt-4">
					<div class="lg:max-w-lg">
						<p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
							Dedicated Support
						</p>
						<!-- <p class="mt-6 text-lg leading-8 text-gray-600">
							Work with your moderation bots, not against them
						</p> -->
						<dl class="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M3.25 3A2.25 2.25 0 001 5.25v9.5A2.25 2.25 0 003.25 17h13.5A2.25 2.25 0 0019 14.75v-9.5A2.25 2.25 0 0016.75 3H3.25zm.943 8.752a.75.75 0 01.055-1.06L6.128 9l-1.88-1.693a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 01-1.06-.055zM9.75 10.25a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z"
											clip-rule="evenodd"
										/>
									</svg>

									Open Source
								</dt>
								<dd class="inline">
									Our source code is publicly auditable and we value community contributions!
								</dd>
							</div>
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L6.56 10l1.72-1.72zm4.5-1.06a.75.75 0 10-1.06 1.06L13.44 10l-1.72 1.72a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25z"
											clip-rule="evenodd"
										/>
									</svg>

									Active Development
								</dt>
								<dd class="inline">
									Sentry remains actively maintained with support over on our GitHub.
								</dd>
							</div>
							<div class="relative pl-9">
								<dt class="inline font-semibold text-gray-900">
									<svg
										class="absolute left-1 top-1 h-5 w-5 text-blurple-50"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fill-rule="evenodd"
											d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
											clip-rule="evenodd"
										/>
									</svg>

									Community Enhancements
								</dt>
								<dd class="inline">
									Have an idea for Sentry? Found an issue? Open an issue on our GitHub and we will
									work on it.
								</dd>
							</div>
						</dl>
					</div>
				</div>
				<a href="https://github.com/PenPow/Sentry" target="_blank">
					<img
						src="/gh.jpg"
						alt="Product screenshot"
						class="max-h-full max-w-full rounded-xl shadow-xl pt-24 md:-ml-4 lg:-ml-0"
						width="600"
						height="300"
					/>
				</a>
			</div>
		</div>
	</div>
</section>
