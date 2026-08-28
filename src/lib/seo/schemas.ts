import { SITE_LOGO } from "@/lib/site";
import { getSiteUrl } from "@/lib/site-url";
import type { BlogPost } from "@/lib/wp/types";
import type { IccEvent } from "@/lib/wp/types";

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ICC Online",
    url: getSiteUrl(),
    logo: SITE_LOGO,
  };
}

export function buildBlogPostingSchema(post: BlogPost, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.date,
    dateModified: post.modified,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    image: post.featuredImage?.url,
    mainEntityOfPage: pageUrl,
    publisher: {
      "@type": "Organization",
      name: "ICC Online",
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO,
      },
    },
  };
}

export function buildEventSchema(event: IccEvent, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.excerpt || undefined,
    startDate: event.startDate.replace(" ", "T"),
    endDate: event.endDate ? event.endDate.replace(" ", "T") : undefined,
    eventAttendanceMode: event.online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: event.isUpcoming
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventCompleted",
    location: event.online
      ? {
          "@type": "VirtualLocation",
          url: pageUrl,
        }
      : {
          "@type": "Place",
          name: event.location,
        },
    image: event.bannerUrl || undefined,
    url: pageUrl,
    organizer: {
      "@type": "Organization",
      name: "ICC Online",
      url: getSiteUrl(),
    },
  };
}
