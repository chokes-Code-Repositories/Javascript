const validSizes = [
  '30x30',
  '48x48',
  '60x60',
  '75x75',
  '100x100',
  '110x110',
  '140x140',
  '150x150',
  '150x200',
  '180x180',
  '250x250',
  '352x352',
  '420x420',
  '720x720'
];

// Create a cache object to store previously fetched images
const imageCache = new Map();

export default {
  async fetch(request, env, ctx) {
    // Extract the URI path, user ID, and size parameter from the request
    const url = new URL(request.url);
    const path = url.pathname.replace('/roblox/avatar-thumbnails', ''); // Remove the prefix
    const userId = url.searchParams.get('userId'); // Get the user ID from query parameter
    const size = url.searchParams.get('size'); // Get the size parameter from query parameter
    
    // Check if the userId parameter is present
    if (!userId) {
      return new Response("Missing required userId parameter", { status: 400 });
    }

    // Check if the userId parameter is an integer
    if (!Number(userId)) {
      return new Response("userId is not an Integer.");
    }

    // If the size parameter is defined, check if it is a valid size.
    if (size) {
      if (!validSizes.includes(size)) {
        return new Response("Invalid size parameter.");
      }
    }

    // Define the base URL for the API
    const apiUrl = "https://thumbnails.roblox.com";

    // Check if the image is already in the cache
    const cacheKey = `${userId}-${size || 'default'}`;
    if (imageCache.has(cacheKey)) {

      const { imageResponse, expirationTime } = imageCache.get(cacheKey);
      if (expirationTime > Date.now()) {
        console.log(`Found cached image data for UserID: ${userId} with size ${size}, Returning cached image...`)
        return new Response(imageResponse, {
          headers: {
            "Content-Type": "image/png", // Adjust the content type if needed
          },
        });
      } else {
        // Remove expired cache entry
        imageCache.delete(cacheKey);
      }

    }

    // Determine the size to use (either from parameter or default)
    let imageSize;
    if (path === "/v1/users/avatar-bust") {
      // Use the specified size if provided, or default to 420x420
      imageSize = size || "420x420";
    
      // Cap the size at 420x420 if it's larger
      if (validSizes.indexOf(imageSize) === -1 || validSizes.indexOf(imageSize) > validSizes.indexOf("420x420")) {
        console.warn("Client tried to request a size larger than 420x420 on the /v1/users/avatar-bust endpoint, Overriden to 420x420.")
        imageSize = "420x420";
      }
    } else {
      // Use the specified size if provided, or default to 720x720
      imageSize = size || "720x720";
    }

    // Fetch data from the corresponding API endpoint
    const response = await fetch(`${apiUrl}${path}?userIds=${userId}&size=${imageSize}&format=Png&isCircular=false`);

    // Check if the response is successful
    if (!response.ok) {
      return new Response("Failed to fetch data from the URL", { status: response.status });
    }

    // Parse the JSON response
    const responseData = await response.json();

    // Extract the imageUrl from the JSON data
    const imageUrl = responseData.data[0].imageUrl;

    // Fetch the image data
    const imageResponse = await fetch(imageUrl);

    // Check if the image response is successful
    if (!imageResponse.ok) {
      return new Response("Failed to fetch image data", { status: imageResponse.status });
    }

    // Get the image data as a Uint8Array
    const imageBuffer = await imageResponse.arrayBuffer();

    // Create a response with the image data and appropriate headers
    const imageResponseCached = new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/png", // Adjust the content type if needed
      },
    });

    // Store the image data in the cache with an expiration
    const cacheDuration = 300 * 1000; // 5 minutes
    const expirationTime = Date.now() + cacheDuration;

    imageCache.set(cacheKey, {
      imageResponse: imageBuffer, 
      expirationTime
    });

    return imageResponseCached;
  },
};
