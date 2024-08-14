/**
 * @file uploadFile.js
 * @description Ce fichier gère le téléchargement d'un fichier vers le serveur, vérifie la taille maximale autorisée,
 *              et met à jour l'interface utilisateur pour afficher le fichier téléchargé. On peut également supprimer 
 *              un fichier dans la zone.
 * @version 1.0.0
 * @date 2024-08-10
 * @author [Calonnec Thomas]
 * 
 */


// Récupère les éléments DOM par leur identifiant
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file');
const fileList = document.getElementById('file-list');

// Ajoute un événement lorsque le fichier est en train d'être glissé sur la zone
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('drag-over');
  });
  
/**
 * Événement déclenché lorsqu'un fichier quitte la zone de dépôt sans y être déposé.
 * 
 * @param {Event} event - L'événement dragleave déclenché lors du glissement hors de la zone.
 */
dropArea.addEventListener('dragleave', (event) => {
    event.preventDefault();
    dropArea.classList.remove('drag-over');
});

/**
 * Événement déclenché lorsqu'un fichier est déposé dans la zone de dépôt.
 * Vérifie le type des fichiers et déclenche leur téléchargement si valide.
 * 
 * @param {Event} e - L'événement drop déclenché par le dépôt de fichiers.
 */
dropArea.addEventListener('drop', (event) => {
    event.preventDefault();

    // Récupération des fichiers déposés
    const files = event.dataTransfer.files;
    
    // Vérification de l'existence de fichiers déposés
    if(files.length) {
    
        for (const file of files) {
            if(!isValidFileType(file)){
                alert("Seuls les fichiers JPEG ou PDF sont autorisés. ")
            }
            else {
                uploadFile(file);
            }
             
        }
    }
    dropArea.classList.remove('drag-over');
});

/**
 * Formate la taille d'un fichier en octets (O), kilo-octets (KO), ou méga-octets (MO).
 * 
 * @param {number} sizeInBytes - La taille du fichier en octets.
 * @returns {string} La taille formatée du fichier avec l'unité appropriée.
 */
function formatFileSize(sizeInBytes) {
    const KB = 1024;
    const MB = 1024 * KB;

    if (sizeInBytes >= MB) {
        return (sizeInBytes / MB).toFixed(2) + ' MO';
    } else if (sizeInBytes >= KB) {
        return (sizeInBytes / KB).toFixed(2) + ' KO';
    } else {
        return sizeInBytes + ' O';
    }
}

/**
 * Vérifie si le type de fichier est autorisé.
 * Seuls les fichiers JPEG et PDF sont permis.
 * 
 * @param {File} file - Le fichier dont le type doit être vérifié.
 * @returns {boolean} true si le fichier est de type valide, sinon false.
 */
function isValidFileType(file) {
    const allowedTypes = ['image/jpeg', 'application/pdf'];
    return allowedTypes.includes(file.type);
}

/**
 * Télécharge un fichier vers le serveur et l'ajoute à la liste des fichiers si le téléchargement réussit.
 * 
 * @param {File} file - L'objet File représentant le fichier à télécharger.
 * @returns {void} Retourne rien si l'exécution continue, ou une alerte si la taille du fichier dépasse la limite.
 */
async function uploadFile(file) {
    // Définir la taille maximale du fichier à 100 Mo
    const max_size =  100 * 1024 * 1024;

    // Si la taille du fichier dépasse la limite, afficher une alerte et arrêter l'exécution
    if(file.size > max_size) {
       return alert("La taille du fichier est supérieure à 100 Mo");
    }

    // Créer un objet FormData pour envoyer le fichier au serveur
    const formData = new FormData();
    formData.append('file', file);
    try {

        // Envoyer la requête POST au serveur avec le fichier
        const response = await fetch('upload.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
   
        // Si l'upload est un succès
        if (data.success) {
           
          addFileToList(file)
        } else {
            alert('Erreur lors du téléchargement du fichier : ' + data.error);
        }
    } catch(err) {
        // Gestion des erreurs inattendues lors de l'upload du fichier
        console.error('Error uploading file:', err);
        alert('Une erreur s\'est produite lors du téléchargement du fichier.');
    }
    dropArea.classList.remove('drag-over');

}

/**
 * Ajoute un fichier à la liste des fichiers affichée dans l'interface utilisateur.
 * 
 * Cette fonction crée dynamiquement des éléments HTML pour représenter un fichier,
 * y compris son nom, sa taille et une icône pour supprimer le fichier.
 * 
 * @param {File} file - L'objet File représentant le fichier à ajouter à la liste.
 */
function addFileToList(file) {
      // Formater la taille du fichier pour l'affichage
      const fileSize = formatFileSize(file.size);
    
      const fileItem = document.createElement('li');
     // fileItem.className = 'list-group-item d-flex justify-content-between align-items-start';
  
      const fileDiv = document.createElement('div');
      //fileDiv.className = 'ms-2 me-auto';
  
      // Ajouter le nom du fichier avec une mise en forme en gras
      const filename = document.createElement('div');
      filename.innerHTML = '<b>'+file.name+'</b>';
  
      // Ajouter la taille du fichier
      const fileInfoSize = document.createElement('p');
      fileInfoSize.textContent = fileSize ;
  
      const deleteIcon = document.createElement('a');
      deleteIcon.href="#";
      deleteIcon.innerHTML = '<img src="./supprimer.svg">';
     
      // Ajouter un gestionnaire d'événements pour la suppression du fichier
      deleteIcon.onclick = function (event){
          event.preventDefault();
          deleteFile(file.name,fileItem); // Appelle la fonction deleteFile avec les arguments
      }
      
      // Ajouter les éléments créés dans l'élément <li> et dans la liste des fichiers
      fileItem.appendChild(fileDiv);
      fileDiv.appendChild(filename);
      fileDiv.appendChild(fileInfoSize);
      fileItem.appendChild(deleteIcon);
      fileList.appendChild(fileItem);
}

/**
 * Supprime un fichier sur le serveur et, en cas de succès, retire l'élément correspondant de la liste des fichiers.
 * 
 * @param {string} filename - Le nom du fichier à supprimer sur le serveur.
 * @param {HTMLElement} fileItem - L'élément HTML représentant le fichier dans la liste des fichiers à supprimer du DOM.
 */
async function deleteFile(filename, fileItem) {

    try{
        const response = await fetch('upload.php', {
            method: 'POST',
            body: JSON.stringify({delete : filename})
        });
       
        const data = await response.json();
       
        if(data.success){
            fileList.removeChild(fileItem);
        }
    }catch(error) {
        console.error("Erreur: ", error);
    }
}

// affichage des fichiers uploadés
fetch('upload.php')
.then(response => response.json())
.then(files => {
    files.forEach(file => addFileToList(file));
});

