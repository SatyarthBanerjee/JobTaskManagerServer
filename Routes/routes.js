const express = require("express")
const router = express.Router();
const {registerUser, loginUser, getAlluser} = require("../Controller/authcontroller")
const {addTask, fetchTasks, updateTask, completeTask, deleteTask} = require("../Controller/taskcontroller")
const authMiddleware = require("../middleware/middleware")
router.post("/api/createUser",  registerUser);
router.post("/api/loginUser",  loginUser);
router.get("/api/getalluser", getAlluser)
router.post("/api/addTask", authMiddleware, addTask);
router.get("/api/getTasks", authMiddleware, fetchTasks)
router.put("/api/updateTask", authMiddleware, updateTask);
router.post("/api/completeTask", authMiddleware, completeTask);
router.post("/api/deleteTask", authMiddleware, deleteTask);
module.exports = router