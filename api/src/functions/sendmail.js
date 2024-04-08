const { app } = require("@azure/functions");
const fetch = require('node-fetch');
const axios = require('axios');

async function getTokenFromAAD() {
    try {
        // Appeler votre API pour récupérer le jeton d'accès depuis Azure AD
        const tokenResponse = await axios.post('http://localhost:7071/api/getTokenFromAAD');
        return tokenResponse.data.access_token;
    } catch (error) {
        console.error('Erreur lors de la récupération du token:', error.message);
        throw error;
    }
}

async function sendmail(req, context) {
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

    try {
        // Obtenez le jeton d'accès
        const token = await getTokenFromAAD();

        const data = await req.json();
        const messageContent = `Bonjour ${data.prenom || ''}, Votre demande a été refusée. Veuillez nous contacter pour plus d'informations.`;

        // Envoyez une requête à l'API Microsoft Graph en utilisant le jeton d'accès
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/sendMail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
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
                                address: data.email
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
            body: 'Une erreur s\'est produite.',
        };
    }
}
app.http('sendmail', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: sendmail
});

module.exports = sendmail;
