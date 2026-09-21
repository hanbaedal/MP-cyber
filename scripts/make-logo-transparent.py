from PIL import Image, ImageFilter

src = r"C:\Users\hanba\.cursor\projects\c-MP-cyber\assets\c__Users_hanba_AppData_Roaming_Cursor_User_workspaceStorage_ade9d587c582ca29a2ab3cbc6765ee34_images_Well-Dying_______-891773f8-f1cf-41b1-9b43-f07230e57720.jpg"
out = r"C:\MP-cyber\public\brand\well-dying-logo.png"

img = Image.open(src).convert("RGBA")
w, h = img.size
pixels = img.load()

# Remove near-black background aggressively
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        mx = max(r, g, b)
        # keep colored logo strokes (cyan/purple/pink have higher channel spread)
        spread = max(r, g, b) - min(r, g, b)
        if mx < 40 and spread < 18:
            pixels[x, y] = (0, 0, 0, 0)
        elif mx < 55 and spread < 22:
            alpha = int(((mx - 20) / 35) * 200)
            pixels[x, y] = (r, g, b, max(0, min(255, alpha)))

# Clear watermark corner (bottom-right pale text)
for y in range(int(h * 0.82), h):
    for x in range(int(w * 0.62), w):
        r, g, b, a = pixels[x, y]
        spread = max(r, g, b) - min(r, g, b)
        if spread < 30:
            pixels[x, y] = (0, 0, 0, 0)

bbox = img.getbbox()
if bbox:
    # pad a little
    l, t, r, b = bbox
    img = img.crop((max(0, l - 4), max(0, t - 4), min(w, r + 4), min(h, b + 4)))

img.save(out, "PNG")
print("saved", out, img.size)
