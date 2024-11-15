const loginForm = document.getElementById('login')
const passwordInput = document.getElementById('password');
const togglePassword = document.querySelector('.toggle-password');

loginForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const formObj = {};
    form.forEach((value, key) => {
        formObj[key] = value;
    });
    console.log(formObj);

    try {
        const login = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObj),
        }).then((res) => res.json());
    
        console.log(login);
    
        if (login.response) {
            localStorage.setItem('email', formObj.email);
            console.log("Login success");
            alert(login.response || "Admin Login successful!");
            window.location.href = "dashboard.html";
        } else {
            console.log("Login failed");
            alert(login.error || "Admin Login failed");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Network error or server unavailable");
    }

})