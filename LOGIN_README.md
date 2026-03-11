# Survey Web Login Page

A modern, responsive login page with mathematical captcha for the Survey Portal.

## Features

✅ **Login ID & Password Authentication**
- Input fields for login ID and password
- Password visibility toggle
- Form validation

✅ **Mathematical Captcha**
- Random addition problems (1-10 + 1-10)
- Refresh button to generate new captcha
- Answer validation

✅ **Modern UI/UX**
- Gradient background with floating animations
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth transitions and animations
- Error and success messages

✅ **Security**
- Client-side form validation
- Secure password input
- Captcha verification

## Setup Instructions

### 1. Install Dependencies

```bash
cd survey_web
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## File Structure

```
src/
├── pages/
│   └── Login.jsx          # Main login component
├── styles/
│   └── Login.css          # Login page styles
├── App.jsx                # App routing
├── index.css              # Global styles
└── main.jsx               # Entry point
```

## Component Props

The Login component doesn't require any props. It manages all state internally.

## API Integration

The login component sends requests to:
```
POST http://localhost:3000/api/v1/auth/login
```

Request body:
```json
{
  "loginId": "user@example.com",
  "password": "password123",
  "role": "USER"
}
```

Expected response:
```json
{
  "success": true,
  "data": {
    "account": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

## Customization

### Change Colors

Edit `src/styles/Login.css`:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your colors */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Change API Endpoint

Edit `src/pages/Login.jsx`:
```javascript
const response = await fetch('YOUR_API_ENDPOINT', {
  // ...
});
```

### Modify Captcha Range

Edit `src/pages/Login.jsx`:
```javascript
// Change from 1-10 to your desired range
const num1 = Math.ceil(Math.random() * 10);  // Change 10 to your max
const num2 = Math.ceil(Math.random() * 10);  // Change 10 to your max
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Focus indicators
- Color contrast compliance

## Performance

- Lightweight CSS (no external dependencies)
- Optimized animations
- Minimal JavaScript
- Fast load times

## License

© 2026 Survey Portal. All rights reserved.
