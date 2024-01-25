<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Fonction pour envoyer un e-mail
function sendEmail($to, $subject, $body)
{
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'barkedjele@gmail.com';
        $mail->Password = 'xnfsbwivmhdaxqur';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;

        $mail->setFrom('from@example.com', 'Le support');
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->CharSet = 'UTF-8';
        $mail->send();
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// Récupérer l'action choisie
$action = isset($_POST['action']) ? $_POST['action'] : '';

// Si le lien "Refuser" est cliqué, envoyer un courriel au demandeur
if (isset($_GET['action']) && $_GET['action'] === 'refuser') {
    $prenom = isset($_GET['prenom']) ? urldecode($_GET['prenom']) : '';
    $email = isset($_GET['email']) ? urldecode($_GET['email']) : '';

    // Envoyer un autre courriel au demandeur indiquant que sa demande a été refusée
    $subjectRefus = 'Votre demande refusée';
    $bodyRefus = "Bonjour $prenom,\n\nVotre demande a été refusée. Veuillez nous contacter pour plus d'informations.";

    // Envoi de l'e-mail
    if (sendEmail($email, $subjectRefus, $bodyRefus)) {
        // Redirection après l'envoi du formulaire
        header("Location: ../index.html"); // Remplacez par la page de remerciement
        exit();
    } else {
        echo "Le mail n'a pas été envoyé. Mailer Error: {$mail->ErrorInfo}";
    }
} else {
    echo "Action non reconnue.";
}
