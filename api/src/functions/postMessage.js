const { app } = require("@azure/functions");
const fetch = require('node-fetch');

async function postmessage(request, context) {
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
    }
    const webhookUrl = 'https://teolia.webhook.office.com/webhookb2/b0f16287-3172-4f73-81db-2856ea4b6839@c6cc03ce-c0c9-4397-a535-2a67c8d16335/IncomingWebhook/a01ca56f3d0d4f109930fa88c3824b49/e42641d0-da97-40e6-a3e1-4bff608bac99'; // URL de la webhook
    context.log(`Http function processed request for url "${request.url}"`);
    const formData = await request.json();
    console.log(formData);
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la requête: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Erreur lors de la requête:', error.message);
    }
    return {
        postmessage: 200,
        jsonBody: {
            env: process.env
        }
    };
};

app.http('postmessage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: postmessage
});

module.exports = postmessage;
