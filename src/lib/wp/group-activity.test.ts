import { describe, expect, it } from "vitest";
import {
  filterActivitiesForGroup,
  mapBpActivityToWp,
  parseActivityUserName,
} from "./group-activity";

describe("filterActivitiesForGroup", () => {
  it("ne garde que les activités du groupe demandé", () => {
    const items = [
      { id: 1, primary_item_id: 84 },
      { id: 2, primary_item_id: 78 },
      { id: 3, primary_item_id: 84 },
    ] as Parameters<typeof filterActivitiesForGroup>[0];

    expect(filterActivitiesForGroup(items, 84).map((item) => item.id)).toEqual([
      1, 3,
    ]);
  });
});

describe("parseActivityUserName", () => {
  it("extrait le nom depuis le titre HTML BuddyPress", () => {
    expect(
      parseActivityUserName(
        '<a href="https://myicconline.com/membres/abdoul/">Abdoul Darga</a> a répondu',
      ),
    ).toBe("Abdoul Darga");
  });
});

describe("mapBpActivityToWp", () => {
  it("mappe une activité BuddyPress vers WpActivityItem", () => {
    const mapped = mapBpActivityToWp({
      id: 605,
      user_id: 282,
      component: "groups",
      type: "bbp_reply_create",
      title:
        '<a href="https://myicconline.com/membres/abdoul/">Abdoul Darga</a> a répondu',
      content: { rendered: "<p>Test 4</p>\n" },
      date: "2026-08-27T19:36:26",
      link: "https://myicconline.com/groupes/test-dev/",
      primary_item_id: 84,
      favorited: false,
      user_avatar: { thumb: "thumb.jpg", full: "full.jpg" },
    });

    expect(mapped.id).toBe(605);
    expect(mapped.user_name).toBe("Abdoul Darga");
    expect(mapped.action).toContain("Abdoul Darga");
    expect(mapped.content.rendered).toContain("Test 4");
  });
});
