document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("taskForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Formun sayfayı yenilemesini engelle
        const greeting = document.getElementById("greeting");
        const loginBtn = document.getElementById("loginBtn");
        const logoutBtn = document.getElementById("logoutBtn");
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
            body: JSON.stringify(taskData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message); // backend'den gelen hata mesajını fırlat
                });
            }
            return response.json(); // her şey yolundaysa normal devam et
        })
        .then(data => {
            alert("Task added successfully!");
        })
        .catch(error => {
            console.error("Error:", error);
            alert(error.message); // burada artık özel hata mesajın çıkar: örneğin "Only admin or superadmin can add tasks."
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

  // Kullanıcı bilgisi getiriliyor
fetch("/get-current-user")
.then(res => {
  if (!res.ok) throw new Error("Not logged in");
  return res.json();
})
.then(data => {
  const username = data.user.username;
  document.getElementById("greeting").innerText = `Hi, ${username}!`;

  // Giriş yapılmışsa logout butonunu göster, login butonunu gizle
  document.getElementById("logoutBtn").style.display = "inline-block";
  document.getElementById("loginBtn").style.display = "none";
})
.catch(() => {
  document.getElementById("greeting").innerText = "Welcome!";
  // Eğer oturum yoksa login görünsün, logout gizlensin
  document.getElementById("loginBtn").style.display = "inline-block";
  document.getElementById("logoutBtn").style.display = "none";
});

// Logout işlemi
document.getElementById("logoutBtn").addEventListener("click", () => {
fetch("/logout", {
  method: "POST"
})
  .then(() => {
    window.location.href = "/"; // Anasayfaya yönlendir
  })
  .catch(err => {
    console.error("Logout error:", err);
  });
});
