const createPhotoCollage = require("nf-photo-collage");

const createCollage = async (pictures) => {
  try {
    const options = {
      sources: pictures,
      width: 3, // number of images per row
      height: 3, // number of images per column
      imageWidth: 500, // width of each image
      imageHeight: 500, // height of each image
    };

    const canvas = await createPhotoCollage(options);
    return canvas.toBuffer("image/png");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { createCollage };
