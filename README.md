# Memorial website

1. Edit `config.json` (her name, story, dates). Edit the daily notes and quotes at the top of `script.js`.
2. Put photos in `media/photos/`, videos in `media/videos/`. Name files so they sort by date (2024-06-first-day.jpg).
3. Put a square-ish face photo at `media/cursor.jpg` (angel cursor) and `media/hero.jpg` (big photo). Either works for both.
4. Run `python build.py`. It creates `data.json`.
5. Preview: `python -m http.server`, then open http://localhost:8000
6. Publish: push everything to a GitHub repo, then Settings > Pages > deploy from the main branch.

Tips: GitHub rejects files over 100 MB and repos should stay under about 1 GB. Resize photos to ~1600px wide first.
Long videos: upload to YouTube as "Unlisted" and paste the link into `youtube` in config.json. They still stream inside the site.
To make the page private, use a private repo with GitHub Pages (paid plan) or share only the link with family.

## Google Drive
Both Drive folders are listed in `driveFolders` in config.json. Share each folder as "Anyone with the link: Viewer".
- No setup: the folders appear as embedded albums on the page.
- Nicer (custom gallery, full-screen viewer, new uploads appear automatically): create a Google Cloud API key with only the Drive API enabled,
  restrict it to your GitHub Pages address (HTTP referrers), and paste it into `driveApiKey` in config.json.
