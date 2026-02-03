GRAND MOMENTS — Advanced Website (Static + Demo Admin)

1) Replace hero video:
   /assets/video/hero.mp4

2) Replace gallery images:
   /assets/images/gallery-1.jpg ... gallery-4.jpg

3) Booking email (recommended):
   - Create endpoint at FormSubmit (or any form service)
   - Use AJAX endpoint: https://formsubmit.co/ajax/YOUR_EMAIL
   - Paste it in Admin > FormSubmit Endpoint
   - Then booking form will send email without backend.

4) Admin Panel:
   - Open /admin.html
   - Password (demo): gm-admin
   - Edit content and Save (stored in your browser localStorage)
   - For permanent publish: Download content.json and replace /data/content.json

Deploy:
- Upload folder to GitHub
- Import project on Vercel (static)
