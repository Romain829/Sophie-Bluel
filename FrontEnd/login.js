const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");

loginForm.addEventListener("submit", (event) => {

    // Empêche le comportement par défaut du formulaire.
    // Notre JavaScript peut ainsi récupérer et traiter les données.
    event.preventDefault();

    // Récupère les valeurs saisies par l'utilisateur
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // Regroupe les données de connexion dans un objet
    const loginData = {
        email: email,
        password: password
    };

    // Envoie les identifiants au Back End
    fetch("http://localhost:5678/api/users/login", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(loginData)
    })
    .then(response => {

        if (response.ok) {
            // Transforme le JSON de la réponse
            // en données JavaScript exploitables
            return response.json();
        }

        // Provoque une erreur si les identifiants sont incorrects
        throw new Error("Identifiants incorrects");
    })
    .then(data => {

        // Conserve le token pendant la session
        sessionStorage.setItem("token", data.token);
        // Redirige l'utilisateur vers la page d'accueil
    window.location.href = "index.html";

    })
    .catch(error => { //.catch() récupère l'objet Error qui a été lancé 
                      //et le transmet comme paramètre à notre fonction
    loginError.textContent = error.message;
});

});