import React, { useState } from 'react';

// This single component will render the entire application
export default function App() {
  // State for each input field
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for handling messages (e.g., errors or success)
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' or 'success'

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the default browser refresh

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      setMessageType('error');
      setMessage('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('Passwords do not match.');
      return;
    }

    // --- Submission Logic ---
    // In a real app, you would send this data to a server
    // For this basic example, we'll just show a success message
    console.log('Form Submitted', { username, email });

    setMessageType('success');
    setMessage(`Welcome, ${username}! Your account has been created.`);

    // Clear the form
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Helper function to determine message text color
  const getMessageColor = () => {
    if (messageType === 'error') {
      return 'text-red-500';
    }
    if (messageType === 'success') {
      return 'text-green-600';
    }
    return 'text-gray-500';
  };

  return (
    // Full-screen background, centers the card
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      
      {/* Main registration card - simplified */}
      <div className="w-full max-w-md p-8 m-4 bg-white shadow-md rounded-lg">
        
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">Create Account</h2>
        <p className="mb-6 text-sm text-center text-gray-600">
          Please enter your details to register.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Username Input */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message Area */}
          {message && (
            <div className={`text-sm text-center ${getMessageColor()}`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-sm text-center">
          <span className="text-gray-600">Already have an account? </span>
          <a href="#" className="font-medium text-blue-600 hover:underline">
            Sign In
          </a>
        </div>

      </div>
    </div>
  );
}

