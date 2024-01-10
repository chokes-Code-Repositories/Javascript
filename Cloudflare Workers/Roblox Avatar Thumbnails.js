/*

Hosted on Cloudflare Workers

Valid Endpoints:
- /v1/users/avatar
- /v1/users/avatar-bust
- /v1/users/avatar-headshot

Valid Parameters:
userId=<USERID>
size=<sizes found in the validSizes array>

*/

// src/worker.js
var cacheDuration = 300 * 1e3; // cached for 5 minutes
var expirationTime = Date.now() + cacheDuration;
var apiUrl = "https://thumbnails.roblox.com";
var validSizes = [
  "30x30",
  "48x48",
  "60x60",
  "75x75",
  "100x100",
  "110x110",
  "140x140",
  "150x150",
  "150x200",
  "180x180",
  "250x250",
  "352x352",
  "420x420",
  "720x720"
];
var imageCache = /* @__PURE__ */ new Map();
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace("/roblox/avatar-thumbnails", "");
    const userId = url.searchParams.get("userId");
    const size = url.searchParams.get("size");
    if (!userId) {
      return new Response("Missing required userId parameter", { status: 400 });
    }
    if (!Number(userId)) {
      return new Response("userId is not an Integer.", { status: 400 });
    }
    if (size && !validSizes.includes(size)) {
      return new Response("Invalid size parameter.", { status: 400 });
    }
    let imageSize;
    if (path === "/v1/users/avatar-bust") {
      imageSize = size || "420x420";
      if (validSizes.indexOf(imageSize) === -1 || validSizes.indexOf(imageSize) > validSizes.indexOf("420x420")) {
        console.warn(`Client tried to request a size larger than 420x420 for ${path}, Overridden to 420x420.`);
        imageSize = "420x420";
      }
      if (validSizes.indexOf(imageSize) < validSizes.indexOf("48x48")) {
        console.warn(`Client tried to request a size smaller than 48x48 for ${path}, Overridden to 48x48.`);
        imageSize = "48x48";
      }
    } else if (path === "/v1/users/avatar-headshot") {
      imageSize = size || "720x720";
      if (validSizes.indexOf(imageSize) < validSizes.indexOf("48x48")) {
        console.warn(`Client tried to request a size smaller than 48x48 for ${path}, Overridden to 48x48.`);
        imageSize = "48x48";
      }
    } else {
      imageSize = size || "720x720";
    }
    const cacheKey = `${userId}-${path}-${imageSize}`;
    console.log(`Cachekey: ${userId}-${path}-${imageSize}`);
    if (imageCache.has(cacheKey)) {
      const { imageResponse, expirationTime: expirationTime2 } = imageCache.get(cacheKey);
      if (expirationTime2 > Date.now()) {
        console.log(`Found cached image data for UserID: ${userId} in ${path} with size ${imageSize}, Returning cached image...`);
        return new Response(null, {
          status: 302,
          headers: {
            "Location": imageResponse
          }
        });
      } else {
        imageCache.delete(cacheKey);
      }
    }
    const response = await fetch(`${apiUrl}${path}?userIds=${userId}&size=${imageSize}&format=Png&isCircular=false`).catch((err) => {
      console.log(`[ERROR] Fetch request failed.`);
    });
    if (!response.ok) {
      return new Response("Failed to fetch data from the URL", { status: response.status });
    }
    const responseData = await response.json();
    const imageUrl = responseData?.data[0].imageUrl;
    if (!imageUrl) {
      return new Response(`Roblox API did not return an image.`);
    }
    imageCache.set(cacheKey, {
      imageResponse: imageUrl,
      expirationTime
    });
    return new Response(null, {
      status: 302,
      headers: {
        "Location": imageUrl
      }
    });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
