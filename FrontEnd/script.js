// ======================================================
// 1. VARIABLES
// ======================================================

//query Selectors
const gallery = document.querySelector(".gallery");
const filters = document.querySelector(".filters");
const filterAll = document.querySelector("#filter-all");
const token = sessionStorage.getItem("token");
const loginLink = document.querySelector("#login-link");
const editMode = document.querySelector(".edit-mode");
const editProjects = document.querySelector(".edit-projects");
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal-close");
const modalGallery = document.querySelector(".modal-gallery");
const addPhotoButton = document.querySelector(".add-photo");
const modalGalleryView = document.querySelector(".modal-gallery-view");
const modalAddView = document.querySelector(".modal-add-view");
const modalBack = document.querySelector(".modal-back");
const workCategory = document.querySelector("#work-category");
const addWorkForm = document.querySelector("#add-work-form");
const workImage = document.querySelector("#work-image");
const workTitle = document.querySelector("#work-title");
const validateWork = document.querySelector("#validate-work");
const imagePreview = document.querySelector("#image-preview");

// afficher le mode édition , puis permettre l'ouverture de la modale de gestion des projets
let allWorks = [];


// ======================================================
// 2. FONCTIONS
// ======================================================

function displayWorks(works) {
  gallery.innerHTML = ""; // vide la gallerie

  works.forEach(work => {

    const figure = document.createElement("figure");

    const image = document.createElement("img");
    image.src = work.imageUrl;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.appendChild(image);
    figure.appendChild(caption);

    gallery.appendChild(figure);

  });

}


function displayModalWorks(works) {

  modalGallery.innerHTML = "";

  works.forEach(work => {

    const figure = document.createElement("figure");

    const image = document.createElement("img");
    image.src = work.imageUrl;

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.classList.add("delete-work");
    deleteButton.setAttribute("aria-label", "Supprimer le projet");

    deleteButton.addEventListener("click", () => {

      fetch(`http://localhost:5678/api/works/${work.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(response => {

          if (response.ok) {

            allWorks = allWorks.filter( // la fonction filter retire un projet
              project => project.id !== work.id //conserve tous les projets dont l'identifiant est différent de celui qui vient d'être supprimé
            );

            displayWorks(allWorks);
            displayModalWorks(allWorks);

          } else {
            throw new Error("Erreur lors de la suppression du projet");
          }

        })
        .catch(error => {
          console.log(error.message);
        });

    });

    figure.appendChild(image);
    figure.appendChild(deleteButton);

    modalGallery.appendChild(figure);

  });
}


// le bouton Valider doit être désactivé tant que le formulaire n'est pas complet
function checkForm() {

  const image = workImage.files[0];
  const title = workTitle.value;
  const category = workCategory.value;

  if (image && title && category) {
    validateWork.disabled = false;
  } else {
    validateWork.disabled = true;
  }
}


// ======================================================
// 3. APPELS API
// ======================================================

fetch("http://localhost:5678/api/works") //fetch() utilise la methode GET par défaut
  .then(response => response.json())
  .then(works => {

    allWorks = works;  //la variable allWorks contient maintenant toutes les œuvres récupérées depuis l'API

    displayWorks(works);//c est la que se fait l affichage principal

    // c est la que se fait l affichage de la Galerie de la modale
    displayModalWorks(works);

    filterAll.addEventListener("click", () => {

      displayWorks(allWorks);
    });

  });


fetch("http://localhost:5678/api/categories")
  .then(response => response.json())
  .then(categories => {

    categories.forEach(category => {

      const button = document.createElement("button");

      button.textContent = category.name;

      //crée une option du formulaire
      const option = document.createElement("option");

      option.value = category.id;
      option.textContent = category.name;

      workCategory.appendChild(option);

      button.addEventListener("click", () => {

        const filteredWorks = allWorks.filter(
          work => work.category.id === category.id  // compare les deux côtés, OEUVRES et BOUTON CLIQUE
        );

        displayWorks(filteredWorks);

      });

      filters.appendChild(button);

    });

  });


// ======================================================
// 4. ÉVÉNEMENTS
// ======================================================


// OUVERTURE DE LA MODALE

editProjects.addEventListener("click", () => {

  modal.style.display = "flex";

  modalGalleryView.style.display = "block"; // peut etre optionnel, a tester sans
  modalAddView.style.display = "none"; // peut etre optionnel, a tester sans

});


// FERMETURE DE LA MODALE

modalClose.addEventListener("click", () => {

  modal.style.display = "none";

});


// PASSAGE À LA VUE "AJOUT PHOTO"

addPhotoButton.addEventListener("click", () => {

  modalGalleryView.style.display = "none";
  modalAddView.style.display = "block";

});


// RETOUR À LA GALERIE

modalBack.addEventListener("click", () => {

  modalAddView.style.display = "none";
  modalGalleryView.style.display = "block";

});


// ENVOI DU FORMULAIRE D'AJOUT

addWorkForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const image = workImage.files[0];
  const title = workTitle.value;
  const category = workCategory.value;


  //validation du formulaire avant l'envoi
  if (!image || !title || !category) {
    console.log("Tous les champs doivent être remplis");
    return; // arrête l'exécution de cette courte fonction
  }

  const formData = new FormData();

  formData.append("image", image);
  formData.append("title", title);
  formData.append("category", category);

  fetch("http://localhost:5678/api/works", {
    method: "POST",

    headers: {
      "Authorization": `Bearer ${token}`
    },

    body: formData
  })
    .then(response => {

      if (response.ok) {
        return response.json();
      }

      throw new Error("Erreur lors de l'ajout du projet");
    })
    .then(newWork => {

      allWorks.push(newWork); // push() fait l'opération complémentaire de la fonction filter (): il ajoute le nouveau projet à la fin du tableau

      displayWorks(allWorks); //reconstruit immédiatement la galerie sans recharger la page
      displayModalWorks(allWorks); //reconstruit immédiatement la galerie modale 
      addWorkForm.reset();  //remet tous ses champs dans leur état initial

      // Désactive de nouveau le bouton Valider
      validateWork.disabled = true;

      //cache l’ancien aperçu
      imagePreview.style.display = "none";
      imagePreview.src = "";

      // Cache le formulaire d'ajout
      modalAddView.style.display = "none";

      // Retourne à la galerie de la modale
      modalGalleryView.style.display = "block";

    })
    .catch(error => {
      console.log(error.message);
    });

});


// MODE ADMINISTRATEUR

if (token) { // teste existence variable crée ligne 4

  loginLink.textContent = "logout"; //transformer login en logout
  filters.style.display = "none"; //masque les filtres

  // Affiche le bandeau du mode édition
  editMode.style.display = "block";
  editProjects.style.display = "block";

  loginLink.addEventListener("click", (event) => {

    event.preventDefault();

    sessionStorage.removeItem("token");

    window.location.href = "index.html";

  });

} else {

  console.log("Utilisateur non connecté");

}


// APERÇU DE L'IMAGE

// On demande à JavaScript de lancer la fonction ci dessus lorsque l'utilisateur modifie un champ
workImage.addEventListener("change", () => {

  checkForm();

  const image = workImage.files[0];

  if (image) {
    imagePreview.src = URL.createObjectURL(image); //le fichier choisi est encore sur ton ordinateur et n’a pas été envoyé au Backend. createObjectURL() permet au navigateur de créer une adresse temporaire pour pouvoir l’afficher
    imagePreview.style.display = "block";
  }

});


workTitle.addEventListener("input", checkForm);
workCategory.addEventListener("change", checkForm);