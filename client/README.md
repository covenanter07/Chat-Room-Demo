# Getting Started with Create Chat-Room
![Demo](https://github.com/covenanter07/chat-mesg/blob/main/client/chat_web_demo.gif?raw=true)
## Chat-Room Overview
The Chat-Room is a React.js frontend application for a chat messaging system. It uses modern React features and integrates with a backend API for full functionality.

## Features
- **Messaging**: Supports sending and receiving text messages (including URLs) and emojis.
- **Multimedia Uploads** : Supports uploading images, videos, and PDFs.
- **Voice and Recording** : Supports real-time voice messages and recording functionality.
- **Message Management** : Edit, delete messages, and search messages using keywords.
- **Voice Call** : One-on-one call reception.

## Chat-Room Guide
[Chat Room Guide](https://github.com/covenanter07/chat-mesg/blob/main/client/chat_web_guide%20(720p%20with%2021.58fps).mp4): **Video Guide**

First, open **two different browsers or use two different devices to separately open the browser**. Start from the homepage, go through the registration page to the login page, find the **add friend list (automatically displayed after successful registration), and begin selecting the user you want to chat with**.

## Voice Call Guide
[Voice Call Guide](https://github.com/covenanter07/chat-mesg/blob/main/client/phonecall_guide%20(720p%20with%2021.64fps).mp4): **Video Guide**

Both users need to open the ID_Call input box. Either user can **enter the ID of the user they want to call** in the input box.

## Prerequisites

* Node.js (v14 or later recommended)
* npm (comes with Node.js)

## Installation

1. Clone the repository:
   `git clone https://github.com/covenanter07/chat-mesg`

    cd chat-mesg/client

2. Install dependencies:

   `npm install`

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:

   REACT_APP_CLOUDINARY_CLOUD_NAME=<your_name>
   
   REACT_APP_BACKEND_URL=http://localhost:8090

## Usage

To start the development server:

`npm start`

To build the project for production:

`npm run build`

## Deployment

This frontend is deployed using Render. You can access the deployed version at:

https://chat-municate-sight.onrender.com


## Project Structure

  * `client/`: Contains the React.js frontend application
    * `src/`: Contains the React application source code
    * `public/`: Contains the public assets
    * `package.json`: Project dependencies and scripts
    * `.env`: Environment variables (not included in repository)
    * `.gitignore`: Specifies intentionally untracked files to ignore

## Features

* React.js based user interface
* Redux for state management
* React Router for navigation
* Axios for API requests
* Socket.io for real-time communication
* WebRTC for one-on-one call reception.
* Responsive design with Tailwind CSS

## Dependencies

* react: ^18.2.0
* react-dom: ^18.2.0
* react-router-dom: ^6.23.1
* @reduxjs/toolkit: ^2.2.5
* react-redux: ^9.1.2
* axios: ^1.7.2
* socket.io-client: ^4.7.5
* react-hot-toast: ^2.4.1
* react-icons: ^5.2.1
* moment: ^2.30.1

## Development Dependencies

* react-scripts: 5.0.1
* tailwindcss: ^3.4.3

## Scripts

* `npm start`: Runs the app in development mode
* `npm test`: Launches the test runner
* `npm run build`: Builds the app for production
* `npm run eject`: Ejects from create-react-app
