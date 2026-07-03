function register(){
    let u = document.getElementById("user").value;
    let p = document.getElementById("pass").value;

    localStorage.setItem("user", u);
    localStorage.setItem("pass", p);
    localStorage.setItem("solde", 0);

    alert("Compte créé !");
    window.location.href="login.html";
}

function login(){
    let u = document.getElementById("user").value;
    let p = document.getElementById("pass").value;

    if(u == localStorage.getItem("user") && p == localStorage.getItem("pass")){
        window.location.href="app.html";
    } else {
        alert("Erreur login");
    }
}

function addBalance(){
    let s = parseInt(localStorage.getItem("solde"));
    localStorage.setItem("solde", s + 1000);
}