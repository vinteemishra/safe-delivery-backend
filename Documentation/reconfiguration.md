

Frontend Setup (React)		
1. Add package.json (configuration for React)
2. Add "proxy": "http://localhost:9000" to package.json
3. Run React development server	npm start (in client directory)

Backend Setup (Node.js)		
1. Add package.json (configuration for Node.js)
2. Create index.js to handle API routes and serve frontend	
3. Run Node.js server	npm start (in server directory)

Root-Level Configuration		
1. Install concurrently to run both servers together	npm install concurrently --save-dev
2. Start both frontend and backend simultaneously	npm run start:dev (in root directory)



## Frontend (React) Setup

### Directory: `client`

1. **`client/package.json`**: Configure React application.

    ```json
    {
      "name": "client",
      "version": "1.0.0",
      "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      "dependencies": {
        "react": "~15.3.2",
        "react-dom": "~15.3.2",
        "react-scripts": " "
      }
    }
    ```

2. **Proxy Configuration**: Add a `proxy` field in `client/package.json` to proxy API requests to backend during development.

    ```json
    "proxy": "http://localhost:9000"
    ```

3. **Start React Development Server**: Run the following command from the `client` directory.

    ```bash
    npm start
    ```

## Backend (Node.js) Setup

### Directory: `server`

1. **`server/package.json`**: Configure Node.js server.

    ```json
    {
      "name": "server",
      "version": "1.0.0",
      "scripts": {
        "start": "node src/index.js",
        "dev": "nodemon src/index.js"
      },
      "dependencies": {
        "express": "^4.17.1",
        "cors": "^2.8.5"
      },
      "devDependencies": {
        "nodemon": "^2.0.7"
      }
    }
    ```

2. **`server/src/index.js`**: Set up Node.js server.

    ```javascript
    const express = require('express');
    const cors = require('cors');
    const path = require('path');
    const app = express();
    const port = 9000;

    app.use(cors());
    app.use(express.json());

    // API routes
    app.get('/api/hello', (req, res) => {
      res.json({ message: 'Hello from the backend!' });
    });

    // Serve React frontend in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../client/build')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
      });
    }

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
    ```

3. **Start Node.js Server**: Run the following command from the `server` directory.

    ```bash
    npm start
    ```

## Root-Level Configuration

### Directory: Root

1. **`package.json`**: Define scripts to manage both frontend and backend from the root level.

    ```json
    {
      "name": "root-project",
      "version": "1.0.0",
      "scripts": {
        "start:client": "cd client && npm start",
        "start:server": "cd server && npm start",
        "start:dev": "concurrently \"npm run start:server\" \"npm run start:client\"",
        "build": "cd client && npm run build",
        "start:prod": "npm run build && cd server && npm start"
      },
      "devDependencies": {
        "concurrently": "^6.0.0"
      }
    }
    ```

2. **Install `concurrently`**: This package allows to run multiple npm scripts concurrently.

    ```bash
    npm install concurrently --save-dev
    ```

## Running the Project

### In Development

To run both the React frontend and the Node.js backend servers simultaneously:

```bash
npm run start:dev





