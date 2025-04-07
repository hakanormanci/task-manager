// admin.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-user-form");
    const userList = document.getElementById("user-list");

    // Yeni kullanıcı ekleme
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const username = document.getElementById("username").value;

        // Yeni kullanıcı ekleme API isteği
        fetch("/admin/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: username }),
        })
        .then((response) => response.json())
        .then((data) => {
            alert(data.message);
            loadUsers(); // Kullanıcıyı ekledikten sonra listeyi yenile
        })
        .catch((error) => {
            alert("Error adding user");
        });
    });

    // Kullanıcıları listeleme
    function loadUsers() {
        fetch("/admin/users")
            .then((response) => response.json())
            .then((data) => {
                userList.innerHTML = ""; // Listeyi temizle
                data.users.forEach((user) => {
                    const li = document.createElement("li");
                    li.textContent = user.name;
                    userList.appendChild(li);
                });
            })
            .catch((error) => {
                console.error("Error loading users:", error);
            });
    }

    loadUsers(); // Sayfa yüklendiğinde kullanıcıları listele
});
