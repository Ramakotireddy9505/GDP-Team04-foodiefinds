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
        const login = await fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObj),
        }).then((res) => res.json());
    
        console.log(login);
    
        if (login.response) {
            localStorage.setItem('email', formObj.email);
            localStorage.setItem('userId', login.userId);
            localStorage.setItem('username', login.username);
            console.log("Login success");
            alert(login.response || "Login successful!");
            window.location.href = "index.html";
        } else {
            console.log("Login failed");
            alert(login.error || "Login failed");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("Network error or server unavailable");
    }

})