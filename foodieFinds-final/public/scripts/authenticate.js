const user = localStorage.getItem('email')

if(!user){
   window.location.href="login.html"
}