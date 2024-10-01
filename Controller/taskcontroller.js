const User = require("../Models/user");
const {validationResult} = require('express-validator');

const addTask = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ msg: "Invalid input", errors: errors.array() });
    }

    const { taskName, description, assignedTo, dueDate, priority, status } = req.body;
    console.log(req.body);
    
    if (!taskName || !status) {
        return res.status(400).json({ msg: "Please fill in all fields" });
    }

    try {
        const usernameoremail = req.user.id; // Assuming req.user contains the user's ID or username/email
        const user = await User.findOne({ usernameoremail }); // Use findOne instead of find

        console.log(user);
        
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Check if the assignedTo is the same as the current user
        if (assignedTo === usernameoremail) {
            return res.status(400).json({ msg: "You cannot assign tasks to yourself." });
        }

        // Ensure tasks are initialized
        user.tasks = user.tasks || { todo: [], inProgress: [], completed: [] }; // Initialize tasks if undefined

        const newTask = {
            taskName,
            description,
            assignedTo,
            dueDate: dueDate ? new Date(dueDate) : null,
            priority: priority || "Medium",
            createdAt: new Date(),
            status // Add status to new task
        };

        // Add task to the appropriate array based on status
        if (status === "todo") {
            user.tasks.todo.push(newTask);
        } else if (status === "inProgress") {
            user.tasks.inProgress.push(newTask);
        } else if (status === "completed") {
            user.tasks.completed.push(newTask);
        } else {
            return res.status(400).json({ msg: "Invalid task status" });
        }

        await user.save();
        res.status(200).json({ msg: "Tasks added successfully", tasks: user.tasks });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};


const fetchTasks = async (req, res) => {
    try {
      const usernameoremail = req.user.id;  // Get the usernameoremail from logged-in user
        console.log(usernameoremail);
        
      // Fetch the user's own tasks
      const user = await User.findOne({ usernameoremail }).select('tasks');
      
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      // Fetch tasks assigned to this user in other users' task lists
      const assignedTodoTasks = await User.find({
        'tasks.todo.assignedTo': usernameoremail
      }).select('tasks.todo');
  
      const assignedInProgressTasks = await User.find({
        'tasks.inProgress.assignedTo': usernameoremail
      }).select('tasks.inProgress');
  
      const assignedCompletedTasks = await User.find({
        'tasks.completed.assignedTo': usernameoremail
      }).select('tasks.completed');
  
      // Combine all tasks (user's own tasks + tasks assigned to them)
      const allTasks = {
        todo: [...user.tasks.todo, ...assignedTodoTasks.flatMap(u => u.tasks.todo)],
        inProgress: [...user.tasks.inProgress, ...assignedInProgressTasks.flatMap(u => u.tasks.inProgress)],
        completed: [...user.tasks.completed, ...assignedCompletedTasks.flatMap(u => u.tasks.completed)]
      };
  
      // Return combined tasks to the frontend
      res.status(200).json(allTasks);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  };
  
  
// updateTask.js (Controller)


const updateTask = async (req, res) => {
    const { task_id, taskName, description, assignedTo, dueDate, priority, status } = req.body;
  
    try {
      // Find the user who has the task in any of the task arrays
      const user = await User.findOne({
        $or: [
          { 'tasks.todo._id': task_id },
          { 'tasks.inProgress._id': task_id },
          { 'tasks.completed._id': task_id }
        ]
      });
  
      if (!user) {
        return res.status(404).json({ msg: 'User with this task not found' });
      }
  
      let task;
  
      // Identify which array the task belongs to
      let currentArray = 'todo'; // Default to 'todo'
  
      if (user.tasks.todo.id(task_id)) {
        task = user.tasks.todo.id(task_id);
        currentArray = 'todo';
      } else if (user.tasks.inProgress.id(task_id)) {
        task = user.tasks.inProgress.id(task_id);
        currentArray = 'inProgress';
      } else if (user.tasks.completed.id(task_id)) {
        task = user.tasks.completed.id(task_id);
        currentArray = 'completed';
      }
  
      if (!task) {
        return res.status(404).json({ msg: 'Task not found' });
      }
  
      // Update task fields
      task.taskName = taskName || task.taskName;
      task.description = description || task.description;
      task.assignedTo = assignedTo || task.assignedTo;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
  
      // If the status has changed, move the task to the correct array
      if (status && task.status !== status) {
        // Remove the task from the current array
        user.tasks[currentArray].pull({ _id: task_id });
  
        // Move task to the new array based on the status
        if (status === 'todo') {
          user.tasks.todo.push(task);
        } else if (status === 'inProgress') {
          user.tasks.inProgress.push(task);
        } else if (status === 'completed') {
          user.tasks.completed.push(task);
        }
  
        task.status = status;
      }
  
      // Save the updated user document
      await user.save();
  
      res.status(200).json({ msg: 'Task updated successfully', task });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  const completeTask = async (req, res) => {
    const { task_id } = req.body;

    try {
        // Find the user who has the task in any of the task arrays
        const user = await User.findOne({
            $or: [
                { 'tasks.todo._id': task_id },
                { 'tasks.inProgress._id': task_id },
                { 'tasks.completed._id': task_id }
            ]
        });

        if (!user) {
            return res.status(404).json({ msg: 'User with this task not found' });
        }

        let task;
        let currentArray;

        // Identify which array the task belongs to
        if (user.tasks.todo.id(task_id)) {
            task = user.tasks.todo.id(task_id); // Get the task from the todo array
            currentArray = 'todo';
        } else if (user.tasks.inProgress.id(task_id)) {
            task = user.tasks.inProgress.id(task_id); // Get the task from the inProgress array
            currentArray = 'inProgress';
        } else {
            return res.status(404).json({ msg: 'Task not found in any task array' });
        }

        // Move task to the completed array
        user.tasks.completed.push(task);
        user.tasks[currentArray].pull({ _id: task_id }); // Remove the task from its current array

        // Save the updated user document
        await user.save();

        res.status(200).json({ msg: 'Task completed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
const deleteTask = async (req, res) => {
    const { task_id } = req.body;
    // console.log(task_id);
    

    try {
        // Find the user who has the task in any of the task arrays
        const user = await User.findOne({
            $or: [
                { 'tasks.todo._id': task_id },
                { 'tasks.inProgress._id': task_id },
                { 'tasks.completed._id': task_id }
            ]
        });

        if (!user) {
            return res.status(404).json({ msg: 'User with this task not found' });
        }

        let taskRemoved = false;

        // Check in each array and remove the task if found
        if (user.tasks.todo.id(task_id)) {
            user.tasks.todo = user.tasks.todo.filter(task => task._id.toString() !== task_id); // Remove from todo
            taskRemoved = true;
        } else if (user.tasks.inProgress.id(task_id)) {
            user.tasks.inProgress = user.tasks.inProgress.filter(task => task._id.toString() !== task_id); // Remove from inProgress
            taskRemoved = true;
        } else if (user.tasks.completed.id(task_id)) {
            user.tasks.completed = user.tasks.completed.filter(task => task._id.toString() !== task_id); // Remove from completed
            taskRemoved = true;
        }

        // If task was not found in any array
        if (!taskRemoved) {
            return res.status(404).json({ msg: 'Task not found in any task array' });
        }

        // Save the updated user document
        await user.save();

        res.status(200).json({ msg: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};


  

module.exports = {addTask, fetchTasks, updateTask, completeTask, deleteTask};