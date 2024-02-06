const { app } = require("@azure/functions");
const fetch = require('node-fetch');
const access_token = process.env.ACCESS_TOKEN;

async function sendmail(context, req) {
    context.res = {
        headers: {
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Set-Cookie",
            "Access-Control-Max-Age": "86400",
            "Vary": "Accept-Encoding, Origin",
            "Content-Type": "application/json"
        },
    };

    // **Vérification et extraction des paramètres de l'URL**
    if (req.query && req.query.prenom) {
        const { prenom, email, type, localisation, nomRessource } = req.query;

        // Vérification des paramètres extraits
        console.log("Paramètres extraits de l'URL:", { prenom, email, type, localisation, nomRessource });

        // ... suite du code ...
    } else {
        // Gérer le cas où 'prenom' est absent
        console.error("Erreur : Le paramètre 'prenom' est manquant dans la requête.");
        context.res = {
            status: 400,
            body: "Le paramètre 'prenom' est obligatoire."
        };
        return context.res;
    }

    // Extraction des paramètres de l'URL
    const { prenom, email, type, localisation, nomRessource } = req.query;

    // Vérification des paramètres de la requête
    console.log("Paramètres de la requête:", req.query);

    // Vérification des paramètres extraits
    console.log("Paramètres extraits de l'URL:", { prenom, email, type, localisation, nomRessource });

    // Construction du contenu du message en utilisant les paramètres de l'URL
    const messageContent = `Bonjour ${prenom || ''}, Votre demande de type ${type || ''} pour ${nomRessource || ''} a été refusée. Veuillez nous contacter pour plus d'informations.`;

    try {

        if (!access_token) {
            throw new Error("Access token not available.");
        }

        const response = await fetch(`https://graph.microsoft.com/v1.0/me/sendMail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${access_token}`,
            },
            body: JSON.stringify({
                message: {
                    subject: 'Demande  demande refusée',
                    body: {
                        contentType: 'Text',
                        content: messageContent
                    },
                    toRecipients: [
                        {
                            emailAddress: {
                                address: email
                            }
                        }
                    ]
                },
                saveToSentItems: 'false'
            }),
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la requête: ${response.status} ${response.statusText}`);
        }

        context.res = {
            body: 'Mail envoyé avec succès.',
        };
    } catch (error) {
        console.error('Erreur lors de la requête:', error.message);
        context.res = {
            status: 500,
            body: 'Une erreur s\'est produite lors de l\'envoi du mail.',
        };
    }

    return context.res;
}

app.http('sendmail', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: sendmail
});

module.exports = sendmail;