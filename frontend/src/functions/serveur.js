module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.method === 'GET') {
        context.res = {
            status: 405,
            body: 'Cette ressource ne peut être accédée qu\'en utilisant la méthode POST.'
        };
    } else if (req.method === 'POST') {
        const webhookUrl = 'https://teolia.webhook.office.com/webhookb2/b0f16287-3172-4f73-81db-2856ea4b6839@c6cc03ce-c0c9-4397-a535-2a67c8d16335/IncomingWebhook/a01ca56f3d0d4f109930fa88c3824b49/e42641d0-da97-40e6-a3e1-4bff608bac99';
        const formData = req.body;

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

            let responseData;
            try {
                responseData = await response.json();
                context.log('Réponse JSON analysée avec succès:', responseData);
                context.res = {
                    body: responseData
                };
            } catch (jsonError) {
                context.log.error('Erreur lors de l\'analyse JSON de la réponse:', jsonError);
                const textResponse = await response.text();
                context.log.error('Réponse du serveur:', response.status, textResponse);
                context.res = {
                    status: 500,
                    body: 'Erreur lors de l\'analyse JSON de la réponse.'
                };
            }
        } catch (error) {
            context.log.error('Erreur lors de la requête:', error.message);
            context.res = {
                status: 500,
                body: 'Erreur lors de la requête.'
            };
        }
    } else {
        context.res = {
            status: 405,
            body: 'Méthode non autorisée.'
        };
    }
};
