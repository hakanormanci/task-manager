const express = require("express");
const app = express();
const PORT = 3000;
const fs = require("fs");
const path = require("path")

const filePath = "tasks.json";
const assigneesPath = path.join(__dirname, "data", "assignees.json");

app.use(express.json());
app.use(express.static("public"));

// get users
app.get("/admin/users", (req, res) => {
    fs.readFile(assigneesPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Cannot read users data." });
        }
        const users = data ? JSON.parse(data) : [];
        res.json({ users });
    });
});

// add new user
app.post("/admin/users", (req, res) => {
    const { name } = req.body;
    fs.readFile(assigneesPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Cannot read users data." });
        }
        const users = data ? JSON.parse(data) : [];
        users.push({ name });
        fs.writeFile(assigneesPath, JSON.stringify(users, null, 2), (error) => {
            if (error) {
                return res.status(500).json({ message: "Cannot save user." });
            }
            res.json({ message: "User added successfully." });
        });
    });
});


// assignees persons
app.get("/assignees", (req, res) => {

    fs.readFile(assigneesPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Could not read assignees file." });
        }

        const assignees = data.trim() ? JSON.parse(data) : [];
        res.json(assignees);
    });
});

app.get("/assignees", (req, res) => {
    fs.readFile(assigneesPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Cannot read assignees." });
        }

        const assignees = data.trim() ? JSON.parse(data) : [];
        res.json(assignees);
    });
});



app.get("/tasks", (req,res) => {
    fs.readFile("tasks.json", "utf8", (err,data) => {
        if (err) {
            return res.status(500).json({message: "File cannot be read."});
        }

        let tasks;
        try {
            tasks = data.trim() ? JSON.parse(data) : [];
        } catch (error) {
            return res.status(500).json({message: "Invalid file format."});
        };
        
        res.json(tasks);
    });
});

// Adding a new task
app.post("/tasks", (req, res) => {
    console.log(req.body);  // Gönderilen veri
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "File cannot be read." });
        }

        let tasks = data.trim() ? JSON.parse(data) : [];
        const newTask = req.body;

        // Automatically assign an ID to the new task
        newTask.id = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;

        tasks.push(newTask);

        fs.writeFile(filePath, JSON.stringify(tasks, null, 2), (error) => {
            if (error) {
                return res.status(500).json({ message: "Task cannot be added." });
            }
            res.json({ message: "Task added successfully.", task: newTask });
        });
    });
});

//Delete a task
app.delete("/tasks/:id", (req,res) => {
    fs.readFile(filePath, "utf8", (err,data) => {
        if (err) {
            return res.status(500).json({message: "File cannot be read."});
        };
        
        let tasks = data.trim() ? JSON.parse(data) : [];
        const taskId = parseInt(req.params.id, 10);

        const filteredTasks = tasks.filter(task => task.id !== taskId);

        if (tasks.length === filteredTasks.length) {
            return res.status(404).json({message: "Task cannot be found."});
        }
        
        fs.writeFile(filePath, JSON.stringify(filteredTasks,2,null), (error) => {
            if (error) return res.status(500).json({message:"Task cannot be deleted."});
           
            res.json({message: "Task deleted succesfully."});
        });
    });
});

// Change a task
app.put("/tasks/:id", (req,res) => {
    fs.readFile(filePath, "utf8", (err,data) => {
        if (err) {
            return res.status(500).json({message: "Task cannot be read."});
        }

        let tasks = data.trim() ? JSON.parse(data) : [];
        const taskId = parseInt(req.params.id);
        const updatedTask = req.body;

        let taskFound = false;
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                taskFound = true;
                return { ...task, ...updatedTask};
            }
            return task;
        });

        if (!taskFound) {
            return res.status(404).json({message: "Task not found."});
        }

        fs.writeFile(filePath, JSON.stringify(updatedTasks, null, 2), (error) => {
            if (error) return res.status(500).json({message: "Task cannot be updated."});

            res.json({message: "Task updated succesfully."});
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on https://localhost/${PORT}`);
});