"""Generate Smart Housing Play Store QR assets."""
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

URL = "https://play.google.com/store/apps/details?id=com.smartlogix.smarthousing&pcampaignid=web_share"
OUT = Path(r"c:\wamp64\www\smart-housing\frontend\public\branding")
OUT.mkdir(parents=True, exist_ok=True)

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=2)
qr.add_data(URL)
qr.make(fit=True)
img = qr.make_image(fill_color="#0B1F1A", back_color="white").convert("RGB")
img.save(OUT / "smart-housing-app-qr-plain.png", "PNG")

pad = 48
framed = Image.new("RGB", (img.width + pad * 2, img.height + pad * 2 + 80), "#F9F9F7")
framed.paste(img, (pad, pad))
draw = ImageDraw.Draw(framed)
try:
    font = ImageFont.truetype("arial.ttf", 22)
    font_sm = ImageFont.truetype("arial.ttf", 14)
except OSError:
    font = ImageFont.load_default()
    font_sm = font

text = "Scan to install Smart Housing"
bbox = draw.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
draw.text(((framed.width - tw) // 2, img.height + pad + 18), text, fill="#276254", font=font)

sub = "Google Play · Free download"
bbox2 = draw.textbbox((0, 0), sub, font=font_sm)
tw2 = bbox2[2] - bbox2[0]
draw.text(((framed.width - tw2) // 2, img.height + pad + 48), sub, fill="#815600", font=font_sm)

path = OUT / "smart-housing-app-qr.png"
framed.save(path, "PNG")
print(path, framed.size)
