import os
from PIL import Image, ImageDraw, ImageFont

src_dir = r'D:\WEB 2026\eco-travellounge.mu\mobile-app\screenshots'
out_dir_67 = r'D:\WEB 2026\eco-travellounge.mu\mobile-app\screenshots\ios\6.7_inch'
out_dir_65 = r'D:\WEB 2026\eco-travellounge.mu\mobile-app\screenshots\ios\6.5_inch'
out_dir_ipad = r'D:\WEB 2026\eco-travellounge.mu\mobile-app\screenshots\ios\ipad'

for d in [out_dir_67, out_dir_65, out_dir_ipad]:
    os.makedirs(d, exist_ok=True)

files_map = [
    ('screenshot_1_home.png', '01_home.png'),
    ('screenshot_2_explore.png', '02_explore.png'),
    ('screenshot_3_flights.png', '03_flights.png'),
    ('screenshot_4_insights.png', '04_insights.png'),
    ('screenshot_4_services.png', '05_services.png'),
    ('screenshot_4_wishlist.png', '06_wishlist.png'),
    ('screenshot_5_concierge.png', '07_concierge.png'),
    ('screenshot_5_detail.png', '08_service_detail.png'),
    ('screenshot_5_local_deals.png', '09_local_deals.png'),
    ('screenshot_5_tailormade.png', '10_tailormade.png')
]

def draw_ios_status_bar(draw, width, height, is_dark=False):
    fg_color = (255, 255, 255, 255) if is_dark else (15, 23, 42, 255)
    
    # 1. Dynamic Island
    pill_w, pill_h = 360, 95
    pill_x0 = (width - pill_w) // 2
    pill_y0 = 35
    pill_x1 = pill_x0 + pill_w
    pill_y1 = pill_y0 + pill_h
    draw.rounded_rectangle([pill_x0, pill_y0, pill_x1, pill_y1], radius=47, fill=(0, 0, 0, 255))
    
    # 2. Time: 9:41
    try:
        font_time = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 44)
    except:
        font_time = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 44)
        
    draw.text((105, 55), '9:41', fill=fg_color, font=font_time)
    
    # 3. Cellular signal (4 bars)
    cell_x = width - 290
    cell_y = 65
    for i in range(4):
        bar_h = 8 + i * 7
        draw.rounded_rectangle([cell_x + i * 11, cell_y + (28 - bar_h), cell_x + i * 11 + 6, cell_y + 28], radius=2, fill=fg_color)
        
    # 4. WiFi Icon
    wifi_center_x = width - 210
    wifi_center_y = 80
    for r, width_arc in [(22, 4), (14, 4)]:
        draw.arc([wifi_center_x - r, wifi_center_y - r - 6, wifi_center_x + r, wifi_center_y + r - 6], start=220, end=320, fill=fg_color, width=width_arc)
    draw.ellipse([wifi_center_x - 3, wifi_center_y + 4, wifi_center_x + 3, wifi_center_y + 10], fill=fg_color)
    
    # 5. Battery Icon
    bat_x = width - 150
    bat_y = 65
    bat_w, bat_h = 65, 30
    draw.rounded_rectangle([bat_x, bat_y, bat_x + bat_w, bat_y + bat_h], radius=8, outline=fg_color, width=3)
    draw.rounded_rectangle([bat_x + bat_w + 3, bat_y + 9, bat_x + bat_w + 7, bat_y + 21], radius=2, fill=fg_color)
    draw.rounded_rectangle([bat_x + 5, bat_y + 5, bat_x + 48, bat_y + bat_h - 5], radius=4, fill=fg_color)

def draw_ios_home_indicator(draw, width, height, is_dark=False):
    bar_color = (255, 255, 255, 180) if is_dark else (0, 0, 0, 180)
    bar_w, bar_h = 420, 14
    bar_x = (width - bar_w) // 2
    bar_y = height - 45
    draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], radius=7, fill=bar_color)

def process_file(src_name, out_name):
    src_path = os.path.join(src_dir, src_name)
    im = Image.open(src_path).convert('RGBA')
    w, h = im.size
    
    # Crop out Android status bar (top 0..95) and Android bottom nav (2350..2400)
    app_content = im.crop((0, 95, w, 2350))
    
    # Determine top background color
    top_pixels = [app_content.getpixel((x, 10)) for x in range(10, w - 10, 20)]
    avg_r = sum(p[0] for p in top_pixels) / len(top_pixels)
    avg_g = sum(p[1] for p in top_pixels) / len(top_pixels)
    avg_b = sum(p[2] for p in top_pixels) / len(top_pixels)
    brightness = (avg_r * 299 + avg_g * 587 + avg_b * 114) / 1000
    is_dark = brightness < 128
    
    # Bottom background color
    bot_pixels = [app_content.getpixel((x, app_content.height - 10)) for x in range(10, w - 10, 20)]
    bot_avg_r = int(sum(p[0] for p in bot_pixels) / len(bot_pixels))
    bot_avg_g = int(sum(p[1] for p in bot_pixels) / len(bot_pixels))
    bot_avg_b = int(sum(p[2] for p in bot_pixels) / len(bot_pixels))
    
    # 1. Generate 6.7/6.9 inch (1290 x 2796)
    target_w, target_h = 1290, 2796
    status_h = 150
    home_h = 76
    content_avail_h = target_h - status_h - home_h
    
    # Resize content
    scaled_content = app_content.resize((target_w, content_avail_h), Image.Resampling.LANCZOS)
    
    top_bg_color = (int(avg_r), int(avg_g), int(avg_b), 255)
    bot_bg_color = (bot_avg_r, bot_avg_g, bot_avg_b, 255)
    
    canvas_67 = Image.new('RGBA', (target_w, target_h), top_bg_color)
    draw_canvas = ImageDraw.Draw(canvas_67)
    draw_canvas.rectangle([0, target_h - home_h, target_w, target_h], fill=bot_bg_color)
    
    # Paste scaled app content
    canvas_67.paste(scaled_content, (0, status_h), scaled_content)
    
    # Draw status bar and home indicator
    draw_ios_status_bar(draw_canvas, target_w, target_h, is_dark=is_dark)
    draw_ios_home_indicator(draw_canvas, target_w, target_h, is_dark=(bot_avg_r*299 + bot_avg_g*587 + bot_avg_b*114)/1000 < 128)
    
    # Save 6.7 inch (1290 x 2796)
    canvas_67.save(os.path.join(out_dir_67, out_name), 'PNG')
    
    # 2. Save 6.5 inch (1242 x 2688)
    canvas_65 = canvas_67.resize((1242, 2688), Image.Resampling.LANCZOS)
    canvas_65.save(os.path.join(out_dir_65, out_name), 'PNG')
    
    # 3. Save iPad (2048 x 2732)
    canvas_ipad = Image.new('RGBA', (2048, 2732), top_bg_color)
    draw_ipad = ImageDraw.Draw(canvas_ipad)
    ipad_content_w = 1720
    ipad_content_h = int(content_avail_h * (ipad_content_w / target_w))
    scaled_ipad = app_content.resize((ipad_content_w, ipad_content_h), Image.Resampling.LANCZOS)
    ipad_x = (2048 - ipad_content_w) // 2
    ipad_y = (2732 - ipad_content_h) // 2
    canvas_ipad.paste(scaled_ipad, (ipad_x, ipad_y), scaled_ipad)
    
    try:
        f_ipad = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 40)
    except:
        f_ipad = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 40)
    draw_ipad.text((60, 35), '9:41 AM  Tue Aug 25', fill=(255,255,255,255) if is_dark else (15,23,42,255), font=f_ipad)
    bat_x = 2048 - 140
    draw_ipad.rounded_rectangle([bat_x, 40, bat_x + 65, 70], radius=8, outline=(255,255,255,255) if is_dark else (15,23,42,255), width=3)
    draw_ipad.rounded_rectangle([bat_x + 5, 45, bat_x + 48, 65], radius=4, fill=(255,255,255,255) if is_dark else (15,23,42,255))
    draw_ipad.rounded_rectangle([(2048 - 500)//2, 2732 - 35, (2048 + 500)//2, 2732 - 23], radius=6, fill=(255,255,255,180) if is_dark else (0,0,0,180))
    
    canvas_ipad.save(os.path.join(out_dir_ipad, out_name), 'PNG')
    print(f'Processed {src_name} -> {out_name}')

for src_f, out_f in files_map:
    process_file(src_f, out_f)

print('All 10 screenshots processed successfully!')
