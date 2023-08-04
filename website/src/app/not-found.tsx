"use client";

import Image from "next/image";
import SocialCard from "../../public/social-card.png";
import DarkSocialCard from "../../public/dark-social-card.png";

export default function Error() {
	return (
		<>
			<main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 sm:pb-24 lg:px-8">
				<a href="/">
					<Image src={SocialCard} className="mx-auto mt-10 h-24 w-auto dark:hidden sm:h-36" alt="Sentry Discord Bot" />
					<Image src={DarkSocialCard} className="mx-auto mt-10 hidden h-24 w-auto dark:block sm:h-36" alt="Sentry Discord Bot" />
				</a>
				<div className="mx-auto mt-8 max-w-2xl text-center sm:mt-12">
					<p className="text-base font-semibold leading-8">
						<span className="rounded-lg bg-destructive px-2.5 py-1.5 text-primary">404</span>
					</p>
					<h1 className="mt-8 font-heading text-3xl font-bold tracking-tight text-primary sm:text-5xl">
						This page does not exist
					</h1>
					<p className="mt-4 text-base leading-7 text-tertiary sm:mt-6 sm:text-lg sm:leading-8">
						Sorry, we couldn’t find the page you’re looking for.
					</p>
				</div>
				<div className="mx-auto mt-16 flow-root max-w-lg sm:mt-20">
					<ul className="-mt-6">
						<li className="relative flex gap-x-6 rounded-lg px-3 py-6 transition-colors hover:bg-accent">
							<div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
									className="h-6 w-6 text-primary"
									><path
										fillRule="evenodd"
										d="M6.111 11.89A5.5 5.5 0 1115.501 8 .75.75 0 1017 8a7 7 0 10-11.95 4.95.75.75 0 001.06-1.06zm2.121-5.658a2.5 2.5 0 000 3.536.75.75 0 11-1.06 1.06A4 4 0 1114 8a.75.75 0 01-1.5 0 2.5 2.5 0 00-4.268-1.768zm2.534 1.279a.75.75 0 00-1.37.364l-.492 6.861a.75.75 0 001.204.65l1.043-.799.985 3.678a.75.75 0 001.45-.388l-.978-3.646 1.292.204a.75.75 0 00.74-1.16l-3.874-5.764z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="flex-auto">
								<h3 className="text-sm font-semibold leading-6">
									<a href="/dashboard"><span className="absolute inset-0" aria-hidden="true" />Dashboard</a>
								</h3>
								<p className="color-gray-600 mt-2 text-sm leading-6 text-tertiary">Head over to the dashboard</p>
							</div>
							<div className="flex-none self-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
									className="h-5 w-5 text-gray-400"
									><path
										fillRule="evenodd"
										d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
										clipRule="evenodd"
									/></svg>
							</div>
						</li>
						<li className="relative flex gap-x-6 rounded-lg px-3 py-6 transition-colors hover:bg-accent">
							<div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
									className="h-6 w-6 text-primary"
									><path
										d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z"
									/></svg>
							</div>
							<div className="flex-auto">
								<h3 className="text-sm font-semibold leading-6">
									<a href="https://docs.sentry.penpow.dev/docs/welcome"><span className="absolute inset-0" aria-hidden="true" />Documentation</a>
								</h3>
								<p className="color-gray-600 mt-2 text-sm leading-6 text-tertiary">View our documentation</p>
							</div>
							<div className="flex-none self-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
									className="h-5 w-5 text-gray-400"
									><path
										fillRule="evenodd"
										d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
										clipRule="evenodd"
									/></svg>
							</div>
						</li>
						<li className="relative flex gap-x-6 rounded-lg px-3 py-6 transition-colors hover:bg-accent">
							<div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
									className="h-6 w-6 text-primary"
								>
									<path
										d="M3.75 3a.75.75 0 00-.75.75v.5c0 .414.336.75.75.75H4c6.075 0 11 4.925 11 11v.25c0 .414.336.75.75.75h.5a.75.75 0 00.75-.75V16C17 8.82 11.18 3 4 3h-.25z"
									/>
									<path
										d="M3 8.75A.75.75 0 013.75 8H4a8 8 0 018 8v.25a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75V16a6 6 0 00-6-6h-.25A.75.75 0 013 9.25v-.5zM7 15a2 2 0 11-4 0 2 2 0 014 0z"
									/></svg>
							</div>
							<div className="flex-auto">
								<h3 className="text-sm font-semibold leading-6">
									<a href="https://docs.sentry.penpow.dev/blog"><span className="absolute inset-0" aria-hidden="true" />Blog</a>
								</h3>
								<p className="color-gray-600 mt-2 text-sm leading-6 text-tertiary">Check out the latest posts</p>
							</div>
							<div className="flex-none self-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
									className="h-5 w-5 text-gray-400"
									><path
										fillRule="evenodd"
										d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
										clipRule="evenodd"
									/></svg>
							</div>
						</li>
					</ul>
					<div className="mt-10 flex justify-center">
						<a href="/" className="text-sm font-semibold leading-6 text-tertiary transition-colors hover:text-primary"
							><span aria-hidden="true">←</span>&nbsp;Back to home</a>
					</div>
				</div>
			</main>
		</>
	)
}