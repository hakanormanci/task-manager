document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("taskForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Formun sayfayı yenilemesini engelle

        const taskData = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            assignedTo: document.getElementById("assignedTo").value,
            status: document.getElementById("status").value,
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value,
        };

        // POST isteği yaparak yeni görevi ekle
        fetch("/newtask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData), // JSON formatında veri gönderiyoruz
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Task added successfully.") {
                alert("Task added successfully!");
            } else {
                alert("Failed to add task.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("There was an error adding the task.");
        });
    });
});

fetch('/assignees')
  .then(response => response.json())
  .then(assignees => {
    const select = document.getElementById("assignedTo");
    select.innerHTML = ''; // Temizle
    assignees.forEach(person => {
      const option = document.createElement("option");
      option.value = person.name;
      option.textContent = person.name;
      select.appendChild(option);
    });
  })
  .catch(err => {
    console.error("Assignees couldn't be loaded.", err);
  });
