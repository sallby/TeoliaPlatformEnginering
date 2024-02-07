const { app } = require("@azure/functions");
const fetch = require('node-fetch');
const access_token = process.env.ACCESS_TOKEN;

async function sendmail(context, req) {
    context.res = {
        headers: {
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Set-Cookie",
            "Access-Control-Max-Age": "86400",
            "Vary": "Accept-Encoding, Origin",
            "Content-Type": "application/json"
        },
    };

    // Vérification et extraction des paramètres de l'URL
    if (req.query && req.query.prenom && req.query.email) { // Ajout de la vérification des autres paramètres si nécessaire
        const { prenom, email } = req.query;
        // Vérification des paramètres de la requête
        console.log("Paramètres de la requête:", req.query);
        console.log("Paramètres extraits de l'URL:", { prenom, email });

    } else {
        // Gérer le cas où 'prenom' ou 'email' sont absents
        console.error("Erreur : Les paramètres 'prenom' et 'email' sont obligatoires dans la requête.");
        context.res = {
            status: 400,
            body: "Les paramètres 'prenom' et 'email' sont obligatoires."
        };
        return context.res;
    }

    const messageContent = `Bonjour ${prenom || ''}, Votre demande a été refusée. Veuillez nous contacter pour plus d'informations.`;

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
                    subject: 'Demande refusée',
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