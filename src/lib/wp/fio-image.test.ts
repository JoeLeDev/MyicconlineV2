import { describe, expect, it } from "vitest";
import { isBpDefaultAvatar, resolveFioImage } from "./fio-image";

describe("resolveFioImage", () => {
  it("priorise la cover BuddyPress", () => {
    expect(
      resolveFioImage(
        "https://myicconline.com/wp-content/uploads/buddypress/groups/1/cover-image/x.jpg",
        "https://myicconline.com/wp-content/uploads/group-avatars/1/bpfull.jpg",
      ),
    ).toBe(
      "https://myicconline.com/wp-content/uploads/buddypress/groups/1/cover-image/x.jpg",
    );
  });

  it("utilise l'avatar de groupe sans cover", () => {
    expect(
      resolveFioImage(
        "",
        "https://myicconline.com/wp-content/uploads/group-avatars/17/bpfull.jpg",
      ),
    ).toBe(
      "https://myicconline.com/wp-content/uploads/group-avatars/17/bpfull.jpg",
    );
  });

  it("ignore l'avatar placeholder BuddyPress", () => {
    expect(
      resolveFioImage(
        "",
        "https://myicconline.com/wp-content/plugins/buddypress/bp-core/images/mystery-group.png",
      ),
    ).toBe("");
  });
});

describe("isBpDefaultAvatar", () => {
  it("détecte le placeholder BP", () => {
    expect(
      isBpDefaultAvatar(
        "https://myicconline.com/wp-content/plugins/buddypress/bp-core/images/mystery-group-50.png",
      ),
    ).toBe(true);
  });
});
