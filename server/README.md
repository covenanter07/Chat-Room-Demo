# Node.js Express API with MongoDB

This project demonstrates a Node.js application using Express to create an API that connects to MongoDB.

## Prerequisites

* Node.js (v14 or later recommended)
* Yarn package manager
* MongoDB Atlas account or a local MongoDB installation

## Installation

1. Clone the repository:

   `git clone https://github.com/covenanter07/chat-mesg`
   
   cd chat-mesg/server

2. Install dependencies:

    `yarn install`
   
3. Set up environment variables:

   Create a `.env` file in the root directory and add the following:
 
   FRONTEND_URL=http://localhost:3000
   
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-address>.mongodb.net/<database-name>
   
   JWT_SECRET_KEY=<your_jwt_secret_key>
   
   JWT_REFRESH_SECRET_KEY=<your_jwt_refresh_secret_key>

## Usage

To start the development server:

`yarn dev`
  
## Deployment

This API is deployed using Render. You can access the deployed version at:

https://chat-app-all.onrender.com

## Project Structure

 * `client/`: Contains the Node.js API
   * `app.js`: Main application file
   * `package.json`: Project dependencies and scripts
   * `.env`: Environment variables (not included in repository)
   * `.gitignore`: Specifies intentionally untracked files to ignore

## Features

* Express API setup
* MongoDB connection using Mongoose
* JWT authentication
* Socket.io integration
* CORS configuration

## Dependencies

* express: Web application framework
* mongoose: MongoDB object modeling tool
* jsonwebtoken: JWT implementation
* bcryptjs: Password hashing
* socket.io: Real-time bidirectional event-based communication
* dotenv: Environment variable management
* cors: Cross-Origin Resource Sharing

## Development Dependencies
* nodemon: Auto-restarts server on file changes
* typescript: TypeScript support
