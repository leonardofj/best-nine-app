const axios = require("axios");
const base64Img = require("base64-img");
const { create_collage } = require("./image_editing.js");

const get_most_liked = async (username, year) => {
  let pics_data = [];
  const user_id = await get_user_id(username);
  for await (const pic of get_user_posts(user_id, year)) {
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
  let pics_data = [];
  const user_id = await get_user_id(username);
  for await (const post of get_user_posts(user_id, year)) {
    const pic_data = {
      date: new Date(post.taken_at_timestamp * 1000),
      link: post.display_url,
      likes: post.edge_media_preview_like.count,
    };
    pics_data.push(pic_data);
  }
  if (pics_data.length < 9) {
    throw new Error("Sorry, not enough pictures that year");
  }
  pics_data.sort((a, b) => b.likes - a.likes);
  pics_data = pics_data.slice(0, 9);
  pics_data.sort((a, b) => a.date - b.date);

  const images_list = pics_data.map((item) => item.link);

  return await create_collage(images_list);
};

const get_user_id = async (username) => {
  try {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)",
    };
    const response = await axios.get(url, { headers });
    return response.data.data?.user?.id;
  } catch (error) {
    console.log(error);
    return "";
  }
};

async function* get_user_posts(user_id, year = 0) {
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
    posts = responseData.data?.user?.edge_owner_to_timeline_media?.edges;

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
}

module.exports = { get_most_liked, get_collage };
