
# 🖼️ Canvas Modifier Web App

This is a full-stack Node.js + HTML + Fabric.js application that allows users to:

- Upload a JSON file representing a Fabric.js canvas.
- Replace text and image content within it.
- Re-render the modified canvas server-side using canvas and return a downloadable PNG.

## 📂 Folder Structure

```
project-root/
│
├── public/
│   ├── js/                 # Frontend JS
│   │   └── form.js
│   ├── pages/              # HTML pages
│   │   └── form.html
│
├── uploads/                # Safer location for server-side use
│
├── server/
│   ├── controllers/        # Logic for processing and drawing canvas
│   │   └── updateController.js
│   ├── middleware/         # File upload setup (Multer)
│   │   └── upload.js
│   ├── routes/             # Express routes
│   │   └── apiRoutes.js
│   ├── utils/              # Drawing and JSON helpers
│   │   ├── drawCanvas.js
│   └── server.js           # Entry point for backend
│
├── .gitignore
├── package.json
└── README.md
```

## 📁 File Descriptions

| File / Folder | Description |
|---------------|-------------|
| `public/pages/form.html` | User-facing form to upload JSON, image, and text |
| `public/js/form.js` | Handles form submission using Fetch API and FormData |
| `uploads/` | Safer backend-only upload destination |
| `server/server.js` | Main backend server setup (Express) |
| `server/routes/apiRoutes.js` | Defines API endpoints (GET /, POST /update-json) |
| `server/middleware/upload.js` | Multer config for handling file uploads |
| `server/controllers/updateController.js` | Core logic to read JSON, update it, draw on canvas, and return the output PNG |
| `server/utils/drawCanvas.js` | Drawing helpers like drawPath() and drawGroup() using node-canvas |

## 🚀 Features

- Upload and parse Fabric.js JSON canvas structure.
- Modify:
  - First Textbox content.
  - First Image source.
- Re-render canvas using node-canvas.
- Download final PNG image directly from the browser.

## 🔧 Technologies Used

- **Frontend**: HTML, JavaScript, Fabric.js
- **Backend**: Node.js, Express, Multer, node-canvas
- **Image Rendering**: `canvas` package (emulates browser canvas on server)
- **File Uploads**: Multer

## 🛠️ Installation & Setup

```bash
git clone https://github.com/KumkumM19/DesignMate_Backend.git
cd DesignMate_Backend
npm install
```


Start the development server:

```bash
node server/server.js
```

Or in production:

```bash
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

## 📋 Usage

- Open the form.
- Upload:
  - A Fabric.js JSON file.
  - An image to replace the existing image object.
  - Enter new text to replace the Textbox object.
- Submit the form.
- The server processes the updates and returns a downloadable `output.png`.

## 📦 API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Serves the form page |
| `/update-json` | POST | Accepts form data & returns PNG |
| `/uploads/*.json/png` | GET | Serves uploaded/downloaded files |

