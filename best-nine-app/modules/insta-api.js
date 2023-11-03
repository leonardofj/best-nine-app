const axios = require("axios");
const { createCollage } = require("./image-editing.js");
const NodeCache = require("node-cache");
const idCache = new NodeCache({ stdTTL: 0 });
const postsCache = new NodeCache({ stdTTL: 60 * 60 * 24 });
const headers = {
  "user-agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)",
  "x-ig-app-id": "936619743392459",
};

const getMostLiked = async (username, year) => {
  const picsData = await getUserPosts(username, year);
  for (const item of picsData) {
    const { link } = item;
    const { data } = await axios.get(link, { responseType: "arraybuffer" });
    const encodedImage = Buffer.from(data, "binary").toString("base64");
    item.picture = encodedImage;
    item.date = item.date.toLocaleDateString("en-GB");
  }

  return picsData;
};

const getCollage = async (username, year) => {
  const picsData = await getUserPosts(username, year);
  if (picsData.length < 9) {
    throw new Error("Sorry, not enough pictures that year");
  }
  const imagesList = picsData.map((item) => item.link);
  const collageDone = await createCollage(imagesList);

  return Buffer.from(collageDone, "binary").toString("base64");
};

const getUserPosts = async (username, year = 0) => {
  const cacheKey = username + year;
  const cachedData = postsCache.get(cacheKey);
  if (cachedData) {
    console.log("Using cached posts");
    return cachedData;
  } else {
    let picsData = [];
    const userId = await getUserId(username);
    for await (const pic of postsIterator(userId, year)) {
      const picData = {
        date: new Date(pic.taken_at_timestamp * 1000),
        title: pic.edge_media_to_caption.edges[0]?.node?.text || "",
        link: pic.display_url,
        likes: pic.edge_media_preview_like.count,
      };
      picsData.push(picData);
    }
    picsData.sort((a, b) => b.likes - a.likes);
    picsData = picsData.slice(0, 9);
    picsData.sort((a, b) => a.date - b.date);
    postsCache.set(cacheKey, picsData);
    return picsData;
  }
};

const getUserId = async (username) => {
  const cacheKey = username;
  const cachedData = idCache.get(cacheKey);
  try {
    if (cachedData) {
      console.log("Using cached user id");
      return cachedData;
    } else {
      const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
      const response = await axios.get(url, { headers });
      const userId = response.data.data.user.id;
      idCache.set(cacheKey, userId);
      return userId;
    }
  } catch (error) {
    console.log(error);
    if (error.status === 404) {
      error.message = "User not found";
    } else {
      error.message = "Error getting user";
    }
    throw error;
  }
};

async function* postsIterator(userId, year) {
  try {
    const baseUrl =
      "https://www.instagram.com/graphql/query/?query_hash=e769aa130647d2354c40ea6a439bfc08&variables=";
    const pageSize = 100;
    const variables = { id: userId, first: pageSize };
    let postDate;
    let posts;

    while (true) {
      const url = baseUrl + JSON.stringify(variables);
      const response = await axios.get(url, { headers });

      if (response.status !== 200) {
        throw new Error(
          `HTTP request failed with status code: ${response.status}`,
        );
      }

      const responseData = response.data;
      posts = responseData.data.user.edge_owner_to_timeline_media.edges;

      for (const post of posts) {
        if (year) {
          postDate = new Date(post.node.taken_at_timestamp * 1000);
          if (postDate.getUTCFullYear() > year) {
            continue;
          }
          if (postDate.getUTCFullYear() < year) {
            break;
          }
        }
        yield post.node;
      }

      const pageInfo = posts.page_info;
      if (
        !pageInfo?.has_next_page ||
        (year && postDate.getUTCFullYear() < year)
      ) {
        break;
      }
      variables.after = pageInfo.end_cursor;
    }
  } catch (error) {
    console.log(error);
    if (error.status === 404) {
      error.message = "Posts not found";
    } else {
      error.message = "Error getting posts";
    }
    throw error;
  }
}

module.exports = { getMostLiked, getCollage };
