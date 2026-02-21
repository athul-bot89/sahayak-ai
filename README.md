# Sahayak AI - Digital Library Application

A React-based digital library application with multi-language support and advanced PDF viewing capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Technology Stack](#technology-stack)

## ✨ Features

- 📚 Digital library interface for browsing books
- 📖 Advanced PDF viewer with page streaming
- 🌍 Multi-language support (English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Tamil, Telugu)
- 📱 Responsive design with Tailwind CSS
- 🔍 Book search and filtering
- 📄 PDF download functionality
- 🎯 Page selection and targeted downloads

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 14.0 or higher)
  - Check version: `node --version`
  - Download: [https://nodejs.org/](https://nodejs.org/)
  
- **npm** (version 6.0 or higher, comes with Node.js)
  - Check version: `npm --version`
  
- **Git** (optional, for cloning the repository)
  - Check version: `git --version`
  - Download: [https://git-scm.com/](https://git-scm.com/)

## 🚀 Quick Start

Follow these steps to get the application running on your local machine:

```bash
# 1. Clone the repository (or download and extract the ZIP)
git clone <repository-url>
cd frontendv2/sahayak-ai

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

## 📦 Installation

### Step 1: Get the Code

**Option A: Using Git**
```bash
git clone <repository-url>
cd frontendv2/sahayak-ai
```

**Option B: Download ZIP**
1. Download the project ZIP file
2. Extract it to your desired location
3. Open terminal/command prompt
4. Navigate to the project directory:
```bash
cd path/to/frontendv2/sahayak-ai
```

### Step 2: Install Dependencies

Run the following command in the project directory:

```bash
npm install
```

This will install all required dependencies including:
- React and React DOM
- React Router for navigation
- PDF.js for PDF viewing
- i18next for internationalization
- Tailwind CSS for styling
- And other project dependencies

**Note:** If you encounter permission errors on macOS/Linux, try:
```bash
sudo npm install
```

### Step 3: Verify Installation

Check if all dependencies are installed correctly:

```bash
npm list
```

## 🏃‍♂️ Running the Application

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm start
```

- Opens automatically at `http://localhost:3000`
- The page will reload when you make changes
- You will see build errors and warnings in the console

### Production Build

To create an optimized production build:

```bash
npm run build
```

- Creates a `build` folder with production-ready files
- The build is minified and optimized for best performance

To serve the production build locally:

```bash
npm install -g serve
serve -s build
```

Then open `http://localhost:3000`

## 📁 Project Structure

```
sahayak-ai/
├── public/                 # Static files
│   ├── index.html         # Main HTML template
│   └── manifest.json      # PWA manifest
├── src/                   # Source files
│   ├── components/        # React components
│   │   ├── Header.js      # Header component
│   │   ├── Footer.js      # Footer component
│   │   ├── PdfViewer.js   # PDF viewer component
│   │   └── LanguageSelector.js # Language switcher
│   ├── pages/            # Page components
│   │   ├── HomePage.js   # Landing page
│   │   ├── LibraryPage.js # Book library
│   │   ├── BookDetailPage.js # Book details
│   │   └── AboutPage.js  # About page
│   ├── locales/          # Translation files
│   │   ├── en.json       # English translations
│   │   ├── hi.json       # Hindi translations
│   │   └── ...           # Other language files
│   ├── utils/            # Utility functions
│   ├── App.js            # Main App component
│   ├── index.js          # App entry point
│   └── index.css         # Global styles
├── package.json          # Project dependencies
├── tailwind.config.js    # Tailwind CSS config
└── README.md            # This file
```

## 📜 Available Scripts

In the project directory, you can run:

### `npm start`
- Runs the app in development mode
- Open [http://localhost:3000](http://localhost:3000) to view it
- The page will reload on changes

### `npm test`
- Launches the test runner in interactive watch mode
- Press `a` to run all tests

### `npm run build`
- Builds the app for production to the `build` folder
- Optimizes the build for best performance

### `npm run eject`
- **Warning:** This is a one-way operation!
- Ejects from Create React App configuration
- Only use if you need full control over webpack config

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory to configure environment variables:

```env
# API Configuration
REACT_APP_API_URL=http://your-backend-url/api
REACT_APP_API_VERSION=v1

# PDF Service
REACT_APP_PDF_SERVICE_URL=http://your-pdf-service-url

# Feature Flags
REACT_APP_ENABLE_PDF_DOWNLOAD=true
REACT_APP_ENABLE_PAGE_STREAMING=true
```

### API Endpoints

The application expects the following backend endpoints:

- `GET /api/v1/textbooks` - List all textbooks
- `GET /api/v1/textbooks/{id}` - Get textbook details
- `GET /api/v1/textbooks/{id}/pdf` - Download full PDF
- `GET /api/v1/textbooks/{id}/preview` - Stream PDF pages

### Language Configuration

To add a new language:

1. Create a new translation file in `src/locales/`
2. Import it in `src/i18n.js`
3. Add the language option in `LanguageSelector.js`

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. **Port 3000 is already in use**

```bash
# Kill the process using port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or run on a different port:
PORT=3001 npm start
```

#### 2. **npm install fails with permission errors**

```bash
# On macOS/Linux:
sudo npm install

# Or fix npm permissions:
sudo chown -R $(whoami) ~/.npm
```

#### 3. **Module not found errors**

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. **PDF viewer not loading**

- Check if PDF.js worker is properly configured
- Verify PDF service URL in environment variables
- Check browser console for CORS errors

#### 5. **Blank page after npm run build**

- Ensure homepage is set correctly in `package.json`
- Check if all routes are configured properly
- Verify build folder is served from correct path

### Getting Help

If you encounter issues:

1. Check the browser console for errors (F12)
2. Review the terminal for build/compile errors
3. Ensure all prerequisites are installed correctly
4. Try clearing browser cache and cookies
5. Delete `node_modules` and reinstall

## 🛠️ Technology Stack

- **Frontend Framework:** React 19.2
- **Routing:** React Router DOM 7.13
- **Styling:** Tailwind CSS 3.4
- **PDF Viewing:** PDF.js & React-PDF
- **Internationalization:** i18next & react-i18next
- **Build Tool:** Create React App 5.0
- **Testing:** Jest & React Testing Library
- **Language:** JavaScript (ES6+)

## 📝 Development Tips

1. **Before starting development:**
   - Pull latest changes: `git pull`
   - Update dependencies: `npm update`

2. **Code formatting:**
   - Use consistent indentation (2 spaces)
   - Follow React naming conventions
   - Keep components small and focused

3. **Testing:**
   - Run tests before committing: `npm test`
   - Write tests for new components

4. **Performance:**
   - Use React.memo for expensive components
   - Implement lazy loading for routes
   - Optimize images and assets

## 📄 License

This project is private and proprietary.

## 👥 Support

For support, questions, or bug reports, please contact the development team.

---

**Happy Coding! 🚀**
