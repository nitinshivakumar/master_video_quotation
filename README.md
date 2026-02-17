# Master Video Photography - Quotation Website

A professional, interactive quotation website for Master Video Photography services in Bengaluru.

## 🌟 Features

- **Interactive Quotation Builder**: Users can select services and quantities
- **Real-time Price Calculation**: Automatic total calculation as selections change
- **Professional Design**: Modern, responsive UI with gradient styling
- **Download Quotation**: Export detailed quotation as text file
- **Mobile Responsive**: Works perfectly on all devices
- **Smooth Animations**: Professional transitions and hover effects

## 📋 Services Offered

### Photography Services
- Traditional Photography - ₹7,000 per session
- Photo Booth Coverage - ₹7,000 per session
- Candid Photography - ₹15,000 per session

### Videography Services
- Traditional Videography - ₹8,000 per session
- Candid Videography - ₹20,000 per session
- Video Mixing - ₹15,000 per session

### Additional Services
- LED Wall (6x10 feet) - ₹10,000 per session
- Drone Coverage - ₹10,000 per session
- Live Video Streaming - ₹8,000 per session

## 🚀 Deployment to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Repository settings:
   - **Name**: `master-video-photography` (or any name you prefer)
   - **Description**: "Professional Photography & Videography Quotation Website"
   - **Public** repository (required for free GitHub Pages)
   - **Do NOT** initialize with README (we already have files)
5. Click **"Create repository"**

### Step 2: Upload Files

#### Option A: Using GitHub Web Interface (Easiest)

1. On your new repository page, click **"uploading an existing file"**
2. Drag and drop these files:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
3. Add commit message: "Initial commit"
4. Click **"Commit changes"**

#### Option B: Using Git Command Line

```bash
# Navigate to your website folder
cd /path/to/master-video-website

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit"

# Add remote repository (replace USERNAME and REPO with yours)
git remote add origin https://github.com/USERNAME/REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**:
   - Select **"Deploy from a branch"**
   - Branch: **"main"**
   - Folder: **"/ (root)"**
5. Click **"Save"**
6. Wait 2-3 minutes for deployment

### Step 4: Access Your Website

Your website will be available at:
```
https://USERNAME.github.io/REPOSITORY-NAME/
```

For example:
```
https://nitinshivakumar.github.io/master_video_quotation/
```

## 📱 Usage

1. **Select Services**: Click the **+** button to add sessions for each service
2. **View Total**: See real-time calculation in the summary card
3. **Download Quotation**: Click "Download Quotation" to get a detailed text file
4. **Reset**: Use the "Reset" button to clear all selections

## 🎨 Customization

### Change Colors

Edit `styles.css` and modify these CSS variables:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --accent-color: #f093fb;
    /* Add your custom colors here */
}
```

### Update Contact Information

Edit `index.html` and find these sections:
- Navigation bar: Phone number
- Contact section: Phone, location, name

### Modify Services

Edit `index.html` to add/remove services or change pricing:

```html
<div class="service-item" data-id="service-id" data-price="10000">
    <div class="service-info">
        <div class="service-name">Service Name</div>
        <div class="service-description">Description</div>
        <div class="service-price">₹ 10,000 <span class="per-session">per session</span></div>
    </div>
    <!-- controls -->
</div>
```

## 📧 Contact

**Shivakumar G**
- Phone: 9845452391
- Location: Bengaluru - 560079

## 🔧 Technical Stack

- **HTML5**: Structure and content
- **CSS3**: Styling and animations
- **JavaScript**: Interactive functionality
- **GitHub Pages**: Free hosting

## 📄 License

This project is created for Master Video Photography. All rights reserved.

## 🤝 Support

For any issues or questions about the website, please contact Shivakumar G at 9845452391.

---

**Last Updated**: 2024

Made with ❤️ for Master Video Photography
