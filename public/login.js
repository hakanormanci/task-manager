document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
  
    if (res.ok) {
      // Şimdilik localStorage ile kullanıcıyı hatırlayalım
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      document.getElementById("loginMessage").textContent = "Login successful!";
      // Giriş sonrası yönlendirme (örnek)
      setTimeout(() => {
        window.location.href = "/tasks.html";
      }, 1000);
    } else {
      document.getElementById("loginMessage").textContent = data.message;
    }
  });
  