const axios = require("axios");
const { create_collage } = require("./image_editing.js");
const NodeCache = require("node-cache");
const idCache = new NodeCache({ stdTTL: 0 });
const postsCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

const get_most_liked = async (username, year) => {
  const pics_data = await get_user_posts(username, year);
  for (const item of pics_data) {
    const { link } = item;
    const { data } = await axios.get(link, { responseType: "arraybuffer" });
    const encoded_img_data = Buffer.from(data, "binary").toString("base64");
    item.picture = encoded_img_data;
    item.date = item.date.toLocaleDateString("en-GB");
  }

  return pics_data;
};

const get_collage = async (username, year) => {
  const pics_data = await get_user_posts(username, year);
  if (pics_data.length < 9) {
    throw new Error("Sorry, not enough pictures that year");
  }
  const images_list = pics_data.map((item) => item.link);
  const collage_done = await create_collage(images_list);

  return Buffer.from(collage_done, "binary").toString("base64");
};

const get_user_posts = async (username, year = 0) => {
  const cacheKey = username + year;
  const cachedData = postsCache.get(cacheKey);
  if (cachedData) {
    console.log("Using cached posts");
    return cachedData;
  } else {
    let pics_data = [];
    const user_id = await get_user_id(username);
    for await (const pic of posts_iterator(user_id, year)) {
      const pic_data = {
        date: new Date(pic.taken_at_timestamp * 1000),
        title: pic.edge_media_to_caption.edges[0]?.node?.text || "",
        link: pic.display_url,
        likes: pic.edge_media_preview_like.count,
      };
      pics_data.push(pic_data);
    }
    pics_data.sort((a, b) => b.likes - a.likes);
    pics_data = pics_data.slice(0, 9);
    pics_data.sort((a, b) => a.date - b.date);
    postsCache.set(cacheKey, pics_data);
    return pics_data;
  }
};

const get_user_id = async (username) => {
  const cacheKey = username;
  const cachedData = idCache.get(cacheKey);
  try {
    if (cachedData) {
      console.log("Using cached user id");
      return cachedData;
    } else {
      const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
      const headers = {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)",
      };
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

async function* posts_iterator(user_id, year) {
  try {
    const base_url =
      "https://www.instagram.com/graphql/query/?query_hash=e769aa130647d2354c40ea6a439bfc08&variables=";
    const page_size = 100;
    const variables = { id: user_id, first: page_size };
    const headers = {
      "user-agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)",
      "x-ig-app-id": "936619743392459",
    };
    let post_date;
    let posts;

    while (true) {
      const url = base_url + JSON.stringify(variables);
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
          post_date = new Date(post.node.taken_at_timestamp * 1000);
          if (post_date.getUTCFullYear() > year) {
            continue;
          }
          if (post_date.getUTCFullYear() < year) {
            break;
          }
        }
        yield post.node;
      }

      const page_info = posts.page_info;
      if (
        !page_info?.has_next_page ||
        (year && post_date.getUTCFullYear() < year)
      ) {
        break;
      }
      variables.after = page_info.end_cursor;
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

module.exports = { get_most_liked, get_collage };
