📊 Real-Time Poll Rooms
A full-stack, real-time polling application that allows users to create polls, share them via unique links, and watch results update instantly without refreshing.

🚀 Live Links
Frontend: https://poll-app-gold.vercel.app

Backend: https://poll-app-1-khiw.onrender.com

🛠️ Tech Stack
Frontend: React.js, Vite, Axios, Socket.io-client

Backend: Node.js, Express.js, Socket.io

Database: MongoDB Atlas (Mongoose ODM)

Deployment: Vercel (Frontend), Render (Backend)

✨ Features
Instant Room Creation: Create a poll with a question and multiple options.

Dynamic Routing: Unique shareable URLs for every poll.

Real-Time Analytics: Live percentage bars and vote counts powered by WebSockets.

Mobile Responsive: Clean, modern UI optimized for all devices.

🛡️ Fairness & Anti-Abuse Mechanisms
To ensure poll integrity and prevent "vote stuffing," the following mechanisms were implemented:

LocalStorage Persistence (Device Tracking):
Once a user casts a vote, a unique key (voted_{pollId}) is stored in their browser's LocalStorage. If the user attempts to revisit the link or refresh the page, the application detects this record and automatically hides the voting interface, displaying only the live results.

State-Synchronized UI:
The voting buttons are conditionally rendered based on the user's vote status. This prevents users from clicking "Submit" multiple times before the server processes the request, as the UI immediately shifts to a "Voted" state.

🧩 Edge Cases Handled
Deep Link Routing: Implemented vercel.json rewrites to handle SPA routing. This ensures that when a user clicks a shareable link (e.g., /poll/67af...), Vercel correctly routes the request to index.html instead of throwing a 404 error.

Same-Network Accessibility: The backend IP-check was specifically optimized to allow multiple users on the same local network (e.g., a university Wi-Fi or office) to vote from their own devices, solving the common NAT (Network Address Translation) conflict.

Zero-Data State: Analytics calculations include safeguards to prevent "Divide by Zero" errors. If a poll has 0 votes, the bars display 0% gracefully rather than breaking the UI.

⚠️ Known Limitations
Browser-Based Security: Since the primary anti-abuse mechanism is LocalStorage, a user can technically bypass the "one vote per person" rule by using Incognito mode or clearing their browser cache.

Cold Start: Because the backend is hosted on Render's free tier, the first request after a period of inactivity may take 30–50 seconds to spin up.

📦 Local Installation
Clone the repo:

Bash

git clone https://github.com/yourusername/poll-app.git
Install Backend Dependencies:

Bash

cd server
npm install
Install Frontend Dependencies:

Bash

cd ../client
npm install
Environment Variables:
Create a .env file in the /server folder and add:

Code snippet

MONGO_URI=your_mongodb_connection_string
PORT=5000
Run the app:

Server: npm start (in /server)

Client: npm run dev (in /client)
