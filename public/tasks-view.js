// tasks-view.js
document.addEventListener("DOMContentLoaded", function() {
    // Görevleri çekmek için fetch isteği
    fetch('/protected/tasks')
        .then(response => response.json())
        .then(tasks => {
            const tableBody = document.querySelector('#tasksTable tbody');
            tableBody.innerHTML = ''; // Tabloyu temizle

            // Her bir görevi tabloya ekle
            tasks.forEach(task => {
                const row = document.createElement('tr');
                
                const titleCell = document.createElement('td');
                titleCell.textContent = task.title;
                row.appendChild(titleCell);

                const descCell = document.createElement('td');
                descCell.textContent = task.description;
                row.appendChild(descCell);

                const assignedToCell = document.createElement('td');
                assignedToCell.textContent = task.assignedTo;
                row.appendChild(assignedToCell);

                const statusCell = document.createElement('td');
                statusCell.textContent = task.status;
                row.appendChild(statusCell);

                const startDateCell = document.createElement('td');
                startDateCell.textContent = task.startDate;
                row.appendChild(startDateCell);

                const endDateCell = document.createElement('td');
                endDateCell.textContent = task.endDate;
                row.appendChild(endDateCell);

                // Satırı tabloya ekle
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
    
    // Kullanıcı adını al ve başlığa yaz
    fetch('/me')
        .then(res => {
            if (!res.ok) {
                throw new Error('Not logged in');
            }
            return res.json();
        })
        .then(data => {
            const titleElement = document.getElementById("pageTitle");
            if (titleElement) {
                titleElement.textContent = `Assigned Tasks for ${data.username}`;
            }
        })
        .catch(err => {
            console.error("User info could not be loaded", err);
        });
});
