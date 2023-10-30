const axios = require("axios");
const fs = require("fs");
const createCollage = require("nf-photo-collage");

async function create_collage(pictures) {
  try {
    const options = {
      sources: pictures,
      width: 3, // number of images per row
      height: 3, // number of images per column
      imageWidth: 500, // width of each image
      imageHeight: 500, // height of each image
    };

    const canvas = await createCollage(options);
    // const src = canvas.jpegStream();
    // const dest = fs.createWriteStream("myFile.jpg");
    // src.pipe(dest);
    console.log(canvas.toBuffer("image/jpg"));
    return canvas.toBuffer("image/png");
  } catch (error) {
    throw error;
  }
}

module.exports = { create_collage };
