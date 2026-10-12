"""Composes END-OF-ANIMATION keyframes from the same art assets and coordinates used in build_game.py.
These are illustrative storyboard frames (not screenshots of PowerPoint playback)."""
import os
from PIL import Image
IMG = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img'); OUT = os.path.join(os.path.dirname(__file__), '..', 'previews')
def load(n):
    for e in ('png', 'jpeg'):
        p = os.path.join(IMG, f'{n}.{e}')
        if os.path.exists(p): return Image.open(p).convert('RGBA')
def put(c, n, x, y, w, h, rot=0, alpha=1.0):
    im = load(n).resize((int(w), int(h)), Image.LANCZOS)
    if rot: im = im.rotate(-rot, expand=True, resample=Image.BICUBIC)
    if alpha < 1: im.putalpha(im.getchannel('A').point(lambda v: int(v * alpha)))
    cx, cy = x + w / 2, y + h / 2
    c.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))
def lbox(cx, fy, s): return (cx - s / 2, fy - s * .93, s, s)
def canvas(bg): c = load(bg).resize((1920, 1080)); return c
def save(c, name): c.convert('RGB').resize((1280, 720), Image.LANCZOS).save(os.path.join(OUT, name), quality=90)

# 1 wake: Lumi awake, waving, portal open
c = canvas('bg_night'); put(c, 'lumi_waveA', *lbox(960, 940, 640)); put(c, 'portal', 1380, 560, 420, 420); put(c, 'sparkle_burst', 1330, 510, 520, 520, alpha=.7); save(c, 'kf_01_wake_up.png')
# 2 forest complete: all stars, Lumi flying, portal
c = canvas('bg_forest'); put(c, 'hud_5', 610, 24, 700, 130); put(c, 'glow', 1000, 200, 760, 760); put(c, 'portal', 1120, 320, 520, 520); put(c, 'lumi_fly', *lbox(760, 760, 470)); put(c, 'confetti', 360, 40, 1200, 700); save(c, 'kf_02_stars_complete.png')
# 3 balloon pop: red balloon popped, bird reward, Lumi hop
c = canvas('bg_sky')
for col, x, y in [('blue', 320, 250), ('green', 560, 70), ('yellow', 60, 440), ('pink', 1180, 70), ('purple', 1420, 260), ('orange', 1650, 60)]: put(c, f'balloon_{col}', x, y, 180, 360)
put(c, 'glow', 730, -20, 460, 460); put(c, 'balloon_gold', 810, 40, 300, 500); put(c, 'burst_red', 40, 70, 300, 300); put(c, 'r_bird', 330, 160, 210, 178, rot=-12); put(c, 'lumi_laughA', *lbox(960, 1000, 460)); save(c, 'kf_03_balloon_pop.png')
# 4 feeding chili: fire breath
c = canvas('bg_feed'); put(c, 'lumi_fire', *lbox(960, 770, 620)); put(c, 'flame', 975, 331, 620, 360)
for i, n in enumerate(['apple', 'cupcake', 'banana', 'melon', 'broccoli']): put(c, f'food_{n}', 150 + i * 290, 790, 230, 230)
put(c, 'sweat', 1130, 270, 60, 84); save(c, 'kf_04_feed_chili_fire.png')
# 5 feeding yum + magic heart
c = canvas('bg_feed'); put(c, 'lumi_yum', *lbox(960, 770, 620)); put(c, 'sparkle_burst', 710, 180, 500, 500)
for i, n in enumerate(['apple', 'cupcake', 'banana', 'melon', 'broccoli', 'chili']):
    if n != 'apple': put(c, f'food_{n}', 150 + i * 290, 790, 230, 230)
put(c, 'heart_big', 1560, 40, 280, 280); save(c, 'kf_05_feed_yum_heart.png')
# 6 hug
c = canvas('bg_hug'); put(c, 'glow', 410, 130, 1100, 1100); put(c, 'lumi_hug', *lbox(960, 1050, 900))
for i, (x, y, s) in enumerate([(640, 260, 140), (1160, 200, 170), (820, 120, 110), (1280, 420, 150), (560, 480, 120), (980, 60, 130)]): put(c, 'heart_pink', x, y, s, s, rot=(-1) ** i * 12)
put(c, 'key', 1330, 120, 320, 200); save(c, 'kf_06_magic_hug.png')
# 7 door: sockets filled, door opens, chest
c = canvas('bg_door'); put(c, 'door_inner', 700, 160, 520, 760); put(c, 'door_closed', 700, 160, 150, 760)
put(c, 'lantern_on', 110, 120, 440, 640); put(c, 'owl_awake', 1560, 470, 300, 320); put(c, 'pot_bloom', 1260, 640, 260, 364)
put(c, 'glow', 740, 600, 440, 440); put(c, 'chest_closed', 800, 690, 320, 261); put(c, 'sparkle_burst', 610, 190, 700, 700, alpha=.6); put(c, 'lumi_cheer', *lbox(470, 1005, 460)); save(c, 'kf_07_door_opens.png')
# 8 door locked: sad Lumi
c = canvas('bg_door'); put(c, 'door_closed', 700, 160, 520, 760, rot=2); put(c, 'lantern_off', 220, 160, 220, 400); put(c, 'owl_sleep', 1560, 470, 300, 320); put(c, 'pot_bud', 1260, 640, 260, 364)
put(c, 'gem_red', 780, 410, 100, 100); put(c, 'lumi_sad', *lbox(470, 1005, 460)); save(c, 'kf_08_door_locked_sad.png')
# 9 finale
c = canvas('bg_treasure'); put(c, 'glow', 410, -40, 1100, 1100); put(c, 'chest_open', 560, 400, 800, 652); put(c, 'sparkle_burst', 480, 120, 960, 960, alpha=.6)
put(c, 'fw_a', 40, 40, 560, 560); put(c, 'fw_b', 1340, 20, 560, 560); put(c, 'fw_c', 700, -60, 560, 560); put(c, 'confetti', 360, 20, 1200, 700); put(c, 'lumi_danceA', *lbox(320, 1010, 560)); save(c, 'kf_09_treasure_finale.png')
# 10 goodbye
c = canvas('bg_treasure'); put(c, 'chest_open', 560, 400, 800, 652); put(c, 'lumi_bye', *lbox(320, 1010, 560)); put(c, 'portal', 1480, 690, 340, 340); save(c, 'kf_10_goodbye_play_again.png')
print('keyframes done')
