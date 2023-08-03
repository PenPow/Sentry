import { DocsConfig } from "@/types"
import { homeConfig } from "./about"

export const docsConfig: DocsConfig = {
  mainNav: homeConfig.mainNav,
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
        },
		{
			title: "Self Hosting",
			href: "/docs/self-hosting",
		},
		{
			title: "Setup",
			href: "/docs/setup",
		},
      ],
    },
	{
		title: "Concepts",
		items: [
		  {
			title: "Frozen Punishments",
			href: "/docs/concepts/frozen-punishments",
		  },
		  {
			  title: "Permissions V2",
			  href: "/docs/concepts/permissions-v2",
		  },
		],
	  }
  ],
}