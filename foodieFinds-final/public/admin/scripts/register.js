const signupForm = document.getElementById('signup')
signupForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const formObj = {};
    form.forEach((value, key) => {
        formObj[key] = value;
    });
    console.log(formObj);
    if(formObj.password == formObj.confirmPassword){

        const register = await fetch('/admin/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObj),
        }).then((res) => res.json())
    
        console.log(register);
        if(register.response){
            console.log("Admin Register success");
            alert(register.response);
            window.location.href = "index.html";
        } else {
            console.log(register.error);
            alert("Admin Register Failed");
        }

    } else {
            console.log("Password not matched");
            alert("Password not matched");
    }
    

})