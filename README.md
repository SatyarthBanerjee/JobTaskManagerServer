Task Management Server
This project is a task management server built using Node.js, Express, and MongoDB. It allows users to manage their tasks, including creating, updating, deleting, and fetching tasks. The server provides a RESTful API for frontend applications to interact with.

Features
User Authentication: Register and authenticate users.
Task Management:
Create tasks with details such as name, description, priority, and status.
Update existing tasks.
Delete tasks from any status (To Do, In Progress, Completed).
Fetch all tasks assigned to the user, including their own tasks and tasks assigned by others.
Mark tasks as completed, moving them to the completed list.
Data Export: Generate a CSV file of tasks for download.
Technologies Used
Node.js: JavaScript runtime for server-side programming.
Express.js: Web framework for building RESTful APIs.
MongoDB: NoSQL database for storing user and task data.
Mongoose: ODM for MongoDB, providing a schema-based solution.
JSON Web Tokens (JWT): For user authentication.
API Endpoints
User Authentication
POST /api/register - Register a new user.
POST /api/login - Authenticate an existing user.
Task Management
POST /api/addTask - Create a new task.
GET /api/getTasks - Fetch all tasks for the logged-in user.
PUT /api/updateTask - Update an existing task.
DELETE /api/deletTask - Delete a task.
PUT /api/completeTask - Mark a task as completed.
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/SatyarthBanerjee/JobTaskManagerServer.git
cd task-management-server
Install dependencies:

bash
Copy code
npm install
Set up environment variables in a .env file:

makefile
Copy code
PORT = 4000
MONGO_URI = mongodb+srv://satyarthbanerjee12:CFeVPahnwo33HFQf@cluster0.d4fsi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_KEY = iNGzlZuZpD6YanjGqOQGqdlEAaiA9fUa
Start the server:

bash
Copy code
npm start
The server should now be running on http://localhost:4000.

Usage
Once the server is running, you can use tools like Postman or Curl to interact with the API. Make sure to include the JWT token in the Authorization header for protected routes.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.