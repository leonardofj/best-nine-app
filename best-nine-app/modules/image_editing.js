const axios = require("axios");
const createCollage = require("nf-photo-collage");

const create_collage = async (pictures) => {
  try {
    const options = {
      sources: pictures,
      width: 3, // number of images per row
      height: 3, // number of images per column
      imageWidth: 500, // width of each image
      imageHeight: 500, // height of each image
    };

    const canvas = await createCollage(options);
    return canvas.toBuffer("image/png");
  } catch (error) {
    throw error;
  }
};

module.exports = { create_collage };
