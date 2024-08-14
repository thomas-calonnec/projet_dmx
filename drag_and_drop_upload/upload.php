<?php
/**
 * Répertoire de destination pour les fichiers uploadés.
 * 
 * @var string
 */
$uploadDir = __DIR__."/uploads/";

/**
 * Décode les données JSON envoyées via une requête POST.
 * 
 * @var array|null
 */
$data = json_decode(file_get_contents('php://input'), true);

/**
 * Traitement des requêtes POST pour l'upload et la suppression de fichiers.
 */
if($_SERVER["REQUEST_METHOD"] == "POST"){
   
    // Vérifie si un fichier a été uploadé sans erreur
    if(isset($_FILES["file"])) { 
        // Nettoyer le nom du fichier pour enlever les espaces multiples
        $cleaned_file= preg_replace('/\s+/', ' ',$_FILES['file']['name']);
        $target_file = $uploadDir . $cleaned_file;
        $uploadOk = 1;
        $file_size = $_FILES['file']['size'];


        // Check whether file exists before uploading it 
        if (file_exists($target_file)) { 
            echo json_encode(['success' => false, 'error' => "Le fichier ".$_FILES["file"]["name"]." existe déjà."]); 
        }         
        else { 
            // Déplace le fichier uploadé vers le répertoire de destination
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) { 
                echo json_encode(['success' => true, 'size' => $_FILES['file']['size']]);
            }  
        
        }
    }
    // Vérifie si une demande de suppression de fichier a été reçue
    elseif (isset($data['delete'])) {
        
        $targetFilePath = $uploadDir . $data['delete'];
      
        // Vérifie si le fichier existe avant de le supprimer
        if (file_exists($targetFilePath)) {
            unlink($targetFilePath);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Fichier non trouvé.']);
        }
    }
}
 

elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $filesArray = [];
    // Ouvrir le répertoire
   
if (is_dir($uploadDir)) {
    if ($dh = opendir($uploadDir)) {
      
        while (($file = readdir($dh)) !== false) {
            // Ignorer les entrées spéciales '.' et '..'
            if ($file !== '.' && $file !== '..') {
               
                $filePath = $uploadDir . '/' . $file;

                // Vérifier si c'est un fichier et non un répertoire
                if (is_file($filePath)) {
                    // Obtenir la taille du fichier
                    $fileSize = filesize($filePath);

                    // Afficher le nom du fichier et sa taille
                    $filesArray[] = [
                        'name' => $file,
                        'size' => $fileSize
                    ];
                }
            }
        }
        // Fermer le répertoire
        closedir($dh);
    } else {
        echo "Impossible d'ouvrir le répertoire.";
    }
} else {
    echo "Le chemin spécifié n'est pas un répertoire valide.";
}

header('Content-Type: application/json');
echo json_encode($filesArray);
}
