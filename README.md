# Sidandtos - Personal File Storage System

A secure, personal file storage system that runs on your laptop. Store and manage your files with user authentication and a modern web interface.

## Features

- 🔐 **User Authentication**: Sign up, sign in, and password reset functionality
- 📁 **File Management**: Upload, download, and delete files
- 🎨 **Modern UI**: Beautiful, responsive interface
- 🔒 **Secure**: JWT-based authentication and password hashing
- 💾 **Local Storage**: All data stored locally on your machine
- 📧 **Email Support**: Password reset via email (configurable)

## Tech Stack

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- bcryptjs for password hashing
- Multer for file uploads
- Nodemailer for email functionality

### Frontend
- React with TypeScript
- React Router for navigation
- Axios for API calls
- Modern CSS with responsive design

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   # If you have git
   git clone <your-repo-url>
   cd sidandtos
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your settings
   # At minimum, change the JWT_SECRET
   ```

4. **Start the application**
   ```bash
   # Start both server and client in development mode
   npm run dev
   
   # Or start them separately:
   # Terminal 1: Start server
   npm run server
   
   # Terminal 2: Start client
   npm run client
   ```

5. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - The server runs on `http://localhost:5000`

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database
DB_PATH=./server/database/sidandtos.db
```

### Email Setup (Optional)

To enable password reset functionality:

1. **Gmail Setup**:
   - Enable 2-factor authentication on your Gmail account
   - Generate an "App Password" for this application
   - Use your Gmail address and the app password in the `.env` file

2. **Other Email Services**:
   - Update the transporter configuration in `server/routes/auth.js`
   - Modify the service and auth settings as needed

## Usage

### First Time Setup

1. **Register an Account**:
   - Go to the sign-up page
   - Enter your username, email, and password
   - Click "Create Account"

2. **Sign In**:
   - Use your email and password to sign in
   - You'll be redirected to the dashboard

### File Management

1. **Upload Files**:
   - Drag and drop files onto the upload area, or
   - Click the upload area to select files
   - Maximum file size: 100MB

2. **Download Files**:
   - Click the "Download" button next to any file
   - Files will be downloaded with their original names

3. **Delete Files**:
   - Click the "Delete" button next to any file
   - Confirm the deletion in the popup

### Password Reset

1. **Request Reset**:
   - Go to the "Forgot Password" page
   - Enter your email address
   - Check your email for the reset link

2. **Reset Password**:
   - Click the link in your email
   - Enter your new password
   - Sign in with your new password

## File Structure

```
sidandtos/
├── server/                 # Backend code
│   ├── database/          # Database files
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded files storage
│   └── index.js           # Server entry point
├── client/                # Frontend code
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── ...
│   └── package.json       # Client dependencies
├── package.json           # Server dependencies
├── .env                   # Environment variables
└── README.md             # This file
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **File Validation**: File type and size validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Production Deployment

### Building for Production

```bash
# Build the React app
npm run build

# Start the production server
npm start
```

### Important Security Notes

1. **Change JWT Secret**: Use a strong, random JWT secret in production
2. **Use HTTPS**: Always use HTTPS in production
3. **Environment Variables**: Never commit `.env` files to version control
4. **Database Security**: Consider using a more robust database for production
5. **File Size Limits**: Adjust file size limits based on your needs

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   - Change the PORT in your `.env` file
   - Or kill the process using the port

2. **Database Errors**:
   - Delete the `server/database/sidandtos.db` file to reset
   - Restart the server

3. **Email Not Working**:
   - Check your email credentials in `.env`
   - Verify your email service settings
   - Check spam folder for reset emails

4. **File Upload Issues**:
   - Check file size limits
   - Ensure uploads directory has write permissions
   - Verify file type restrictions

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Check that ports 3000 and 5000 are available

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

This is a personal project, but suggestions and improvements are welcome!

---

**Sidandtos** - Your personal file storage solution 🚀
