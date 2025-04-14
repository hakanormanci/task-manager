const express = require("express");
const app = express();
const PORT = 3000;
const fs = require("fs");
const path = require("path")
const session = require("express-session");

let username;

const filePath = "tasks.json";
//const tasksPath = path.join(__dirname, 'data', 'tasks.json');
const assigneesPath = path.join(__dirname, "data", "assignees.json");
const usersFile = path.join(__dirname, "data", "users.json");

app.use(express.json());

app.use(session({
    secret: 'anahtar', // istediğin herhangi bir gizli kelime olabilir
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // HTTPS kullanmıyorsan false kalmalı
  }));
  
// middlewares

function isAuthenticated(req,res,next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).send("Please login to see this page.");
    }
}

app.use(express.static("public"));
//app.use("/protected", isAuthenticated, express.static("public"));
app.use('/protected', isAuthenticated, express.static(path.join(__dirname, 'protected')));



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

app.post("/register", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    fs.readFile(usersFile, "utf8", (err, data) => {
      if (err && err.code !== "ENOENT") {
        return res.status(500).json({ message: "Cannot read users file." });
      }
  
      const users = data ? JSON.parse(data) : [];
  
      const userExists = users.find(user => user.username === username);
      if (userExists) {
        return res.status(400).json({ message: "Username already exists." });
      }
  
      const newUser = {
        id: Date.now(),
        username,
        password, // Şimdilik düz metin; ileride hash’leyeceğiz.
        role: "user"
      };
  
      users.push(newUser);
  
      fs.writeFile(usersFile, JSON.stringify(users, null, 2), (err) => {
        if (err) return res.status(500).json({ message: "User cannot be saved." });
        res.json({ message: "User registered successfully." });
      });
    });
  });

  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    const usersPath = path.join(__dirname, 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  
    const user = users.find(u => u.username === username && u.password === password);
  
    if (user) {
      req.session.user = {
        username: user.username,
        role: user.role // "admin", "user" ya da "superadmin"
      };
      res.json({ message: "Login successful", role: user.role });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
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

app.get('/protected/tasks', isAuthenticated, (req, res) => {
    const tasks = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const currentUser = req.session.user;
  
    // Admin veya Superadmin ise tüm görevleri döndür
    if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      return res.json(tasks);
    }
  
    // Normal kullanıcıysa sadece ona atanmış görevleri döndür
    const filteredTasks = tasks.filter(task => task.assignedTo === currentUser.username);
    res.json(filteredTasks);
  });


app.get("/me", (req,res) => {
    if (req.session.user) {
        res.json({ username: req.session.user.username });
    } else {
        res.status(401).json({message: "Not logged in"});
    }
});

// Adding a new task
app.post("/newtask", (req, res) => {
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

