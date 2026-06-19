# Richard Ruggerio - Portfolio Website

A modern, multi-page portfolio website showcasing 25+ years of design leadership, featuring a timeline-based resume, project case studies, and comprehensive professional information.

## 🎨 Design System

The site uses a sophisticated dark theme with custom interactions:

- **Color Palette**: Dark backgrounds with gold (`#c8a96e`) and teal (`#7a9e8e`) accents
- **Typography**: DM Serif Display for headings, DM Sans for body text
- **Custom Cursor**: Interactive cursor with hover effects
- **Animations**: Smooth scroll-triggered animations and page transitions
- **Responsive**: Mobile-first design with breakpoints at 600px and 900px

## 📁 Site Structure

```
/
├── index.html              # Homepage with hero and featured projects
├── about.html              # Professional background and skills
├── resume.html             # Timeline-based career progression
├── projects.html           # All projects with filtering
├── contact.html            # Contact form and information
├── barnes-noble.html       # Barnes & Noble case study
├── wendys.html             # Wendy's case study
├── hertz.html              # Hertz case study
├── css/
│   └── styles.css          # Shared design system (1,340 lines)
├── js/
│   └── main.js             # Interactive functionality (310 lines)
├── img/                    # Project images
└── img_preview/            # Preview images from PDFs
```

## 🚀 Features

### Navigation
- Fixed header with smooth reveal animation
- Active page highlighting
- Responsive mobile menu (hidden on small screens)
- Breadcrumb navigation on case study pages

### Homepage (`index.html`)
- Animated hero section with gradient orbs
- Counting statistics (25+ years, $25M+ revenue impact)
- Brief introduction with CTAs
- Featured project cards (4 projects)
- Call-to-action section

### About Page (`about.html`)
- Professional biography
- Skills grid (6 categories)
- Design philosophy section
- Awards and professional memberships
- Current role and education details

### Resume Page (`resume.html`)
- **Timeline-based layout** showing career progression
- Interactive timeline with hover effects
- Detailed role descriptions and highlights
- Education section
- Certifications and credentials (10+ certifications)
- Awards and recognition
- Professional memberships
- PDF download link

### Projects Page (`projects.html`)
- Project filtering by category (All, Retail, Hospitality, Technology, Food & Beverage)
- Grid layout with project cards
- Mix of detailed case studies and project summaries
- Links to individual case study pages

### Case Study Pages
Each case study includes:
- Breadcrumb navigation
- Project header with timeline, role, team size
- Hero image
- Detailed sections: Overview, Challenge, Approach, Results
- Key metrics and outcomes
- Links to related projects

**Case Studies:**
- **Barnes & Noble**: Omni-channel strategy, in-store motion design
- **Wendy's**: Mobile payment innovation, Gold Medal Hub Prize
- **Hertz**: Multi-brand digital transformation, 2018 CIA Project of the Year

### Contact Page (`contact.html`)
- Contact form with validation
- Contact information (email, location, availability)
- Social media links
- Services offered section
- FAQ section

## 🎯 Key Technologies

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript**: No frameworks, pure JS for interactions
- **Google Fonts**: DM Serif Display, DM Sans
- **Responsive Design**: Mobile-first approach

## 🔧 Customization Guide

### Updating Content

#### Personal Information
Edit the following in each HTML file:
- Name: Search for "Richard Ruggerio"
- Email: Search for "contact@richardruggerio.com"
- Location: Search for "Columbus, OH"
- Role: Search for "Design Principal · Executive Creative Director"

#### Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
  --black:   #0a0a0a;  /* Main background */
  --accent:  #c8a96e;  /* Gold accent */
  --accent2: #7a9e8e;  /* Teal accent */
  --white:   #f5f4f0;  /* Text color */
  /* ... more variables */
}
```

#### Adding New Projects
1. Add project card to `projects.html`:
```html
<div class="project-card" data-category="your-category">
  <div class="project-client">Client Name</div>
  <h3 class="project-title">Project Title</h3>
  <div class="project-period">Date Range</div>
  <p class="project-desc">Description...</p>
  <div class="project-outcome">Key outcomes...</div>
</div>
```

2. Create new case study page (copy from existing case study)
3. Update images in `img/` directory
4. Add filter category if needed in `projects.html`

#### Adding Resume Entries
Add timeline items to `resume.html`:
```html
<div class="timeline-item fade-up">
  <div class="timeline-period">Date Range</div>
  <h3 class="timeline-role">Job Title</h3>
  <div class="timeline-company">Company Name</div>
  <p class="timeline-desc">Description...</p>
  <ul class="timeline-highlights">
    <li>Highlight 1</li>
    <li>Highlight 2</li>
  </ul>
</div>
```

### Images

#### Recommended Sizes
- Hero images: 1920x500px
- Project cards: 800x400px
- Portrait: 400x400px

#### Optimization
Images should be optimized for web:
- Use JPG for photos (quality 80-85%)
- Use PNG for graphics with transparency
- Consider WebP format for better compression

#### Adding New Images
1. Place images in `img/` directory
2. Use descriptive filenames (e.g., `client-project-name.jpg`)
3. Update `src` attributes in HTML files
4. Add appropriate `alt` text for accessibility

### Contact Form

The contact form in `contact.html` includes client-side validation. To connect it to a backend:

1. Update the form action in `js/main.js` (line ~140):
```javascript
// Replace the setTimeout simulation with actual form submission
fetch('your-api-endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'application/json' }
})
```

2. Or use a service like Formspree, Netlify Forms, or similar

## 📱 Responsive Breakpoints

- **Mobile**: < 600px
- **Tablet**: 600px - 900px
- **Desktop**: > 900px

Key responsive behaviors:
- Navigation links hidden on mobile (< 600px)
- Grid layouts collapse to single column
- Font sizes scale with viewport
- Images resize proportionally

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels where appropriate
- Keyboard navigation support
- Alt text for all images
- Sufficient color contrast ratios
- Focus states for interactive elements

## 🔍 SEO

Each page includes:
- Unique `<title>` tags
- Meta descriptions
- Open Graph tags for social sharing
- Semantic heading hierarchy
- Descriptive link text

## 🌐 Browser Support

Tested and supported in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Note: Custom cursor disabled on touch devices.

## 📝 Content Sources

Content extracted from:
- `RRUGGERIO_CreativeLeader_2021sm.pdf` - Resume and credentials
- `6G5537897-EN-GB.pdf` - Additional professional information
- Existing `index.html` - Project details and descriptions

## 🚀 Deployment

### Static Hosting
This site can be deployed to any static hosting service:

- **Netlify**: Drag and drop the entire folder
- **Vercel**: Connect to Git repository
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3**: Upload files to S3 bucket with static hosting enabled

### Local Development
Simply open `index.html` in a web browser. For a local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## 📄 License

All content © Richard Ruggerio. All rights reserved.

## 🤝 Credits

- **Design & Development**: Richard Ruggerio
- **Fonts**: Google Fonts (DM Serif Display, DM Sans)
- **Images**: Professional portfolio work

## 📞 Support

For questions or updates, contact: contact@richardruggerio.com

---

**Last Updated**: May 2026  
**Version**: 1.0.0