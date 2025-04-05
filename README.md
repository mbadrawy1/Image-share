# ImageShare

A modern image sharing platform built with React and Node.js that allows users to share, discover, and interact with images in an elegant user interface.

## Features

- **User Authentication**: Secure login and registration with JWT authentication
- **Image Uploads**: Upload and share images with the community
- **Profile Management**: Customize your profile and view your uploaded content
- **Responsive Design**: Fully responsive interface that works on mobile and desktop
- **Mobile-friendly**: Built with capacitor for native-like mobile experience
- **Arabic Interface**: Fully supports right-to-left (RTL) text for Arabic users

## Tech Stack

### Frontend
- React.js with hooks and context for state management
- React Router for navigation
- Axios for API requests
- Formik and Yup for form validation
- Capacitor for mobile capabilities
- Draft.js for rich text editing
- Swiper for image galleries

### Backend
- Node.js and Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Express Validator for request validation

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation

#### Frontend
```bash
# Navigate to the frontend directory
cd image-share

# Install dependencies
npm install

# Run the development server
npm run dev
```

#### Backend
```bash
# Navigate to the backend directory
cd server

# Install dependencies
npm install

# Start the server
node index.js
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/imageshare
JWT_SECRET=your_secret_key
PORT=3000
```
## Screenshots

![4](https://github.com/user-attachments/assets/ab8c7b5f-556a-45df-9fe7-a8f658d5a066)



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
