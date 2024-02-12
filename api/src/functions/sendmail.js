const { app } = require("@azure/functions");
const fetch = require('node-fetch');
// ID client et secret client du service principal
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;

const token_access = process.env.ACCESS;


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
    const data = await req.json();

    const messageContent = `Bonjour ${data.prenom || ''}, Votre demande a été refusée. Veuillez nous contacter pour plus d'informations.`;
    try {

        // Obtenez un jeton d'accès à partir de l'endpoint d'autorisation d'Azure AD
        const tokenResponse = await getTokenFromAAD();

        // Utilisez le jeton d'accès pour accéder à l'API Microsoft Graph
        const accessToken = tokenResponse.access_token;

        // Envoyez une requête à l'API Microsoft Graph en utilisant le jeton d'accès
        const response = await fetch(`https://graph.microsoft.com/v1.0/me/sendMail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token_access}`,
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
            body: 'Une erreur s\'est produit.',
        };
    }

}

// Fonction pour obtenir un jeton d'accès à partir de l'endpoint d'autorisation d'Azure AD
async function getTokenFromAAD() {
    const response = await fetch(`https://login.microsoftonline.com/c6cc03ce-c0c9-4397-a535-2a67c8d16335/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'https://graph.microsoft.com/.default',
        }),
    });
    return await response.json();
}

app.http('sendmail', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: sendmail
});

module.exports = sendmail;