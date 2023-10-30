const axios = require("axios");
const sharp = require("sharp");

const create_collage = async (pictures) => {
  try {
    const collage = sharp({
      create: {
        width: 1500,
        height: 1500,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    });

    const imagePromises = pictures.map(async (url) => {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      if (response.status !== 200) {
        throw new Error(`Failed to fetch image: ${url}`);
      }

      const imageStream = sharp(Buffer.from(response.data));
      imageStream.resize(500, 500);
      return imageStream.toBuffer();
    });

    const images = await Promise.all(imagePromises);

    let x = 0;
    let y = 0;

    await Promise.all(
      images.map(async (imageBuffer) => {
        await collage.composite([{ input: imageBuffer, top: y, left: x }]);
        x += 500;
        if (x >= 1500) {
          x = 0;
          y += 500;
        }
      }),
    );

    const encoded_img_data = await collage.jpeg().toBuffer();
    return encoded_img_data.toString("base64");
  } catch (error) {
    throw error;
  }
};

module.exports = { create_collage };
