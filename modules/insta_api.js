const axios = require('axios');

const get_most_liked = async (username, year) => {
    return [`I got ${username} and ${year}`];
};

const get_collage = async (username, year) => {
    let pics_data = [];
    const user_id = await get_user_id(username);
    const user_posts = await get_user_posts(user_id, year);
    return `I got ${user_id} for ${username}`;
};

const get_user_id = async (username) => {
    try {
        const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
        const headers = {
            'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)"
        };
        const response = await axios.get(url, { headers });
        return response.data.data.user.id;
    } catch (error) {
        console.log(error);
        return '';
    }


};

const get_user_posts = async (username, year) => {
    const base_url = "https://www.instagram.com/graphql/query/?query_hash=e769aa130647d2354c40ea6a439bfc08&variables=";
    const page_size = 100;
    const variables = { id: user_id, first: page_size };
    const headers = {
        'user-agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)",
        'x-ig-app-id': "936619743392459"
    };
    return [];
};

module.exports = { get_most_liked, get_collage };