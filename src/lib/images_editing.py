import base64
import io
from PIL import Image
from urllib.request import urlopen


def create_collage(pictures: list):
    collage = Image.new("RGB", (1500, 1500), color=(255, 255, 255, 255))

    c = 0
    for i in range(0, 1500, 500):
        for j in range(0, 1500, 500):
            photo = Image.open(urlopen(pictures[c]))
            photo = photo.resize((500, 500))

            collage.paste(photo, (i, j))
            c += 1

    data = io.BytesIO()
    collage.save(data, "JPEG")
    encoded_img_data = base64.b64encode(data.getvalue())

    return encoded_img_data.decode("utf-8")
