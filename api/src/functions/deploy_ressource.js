const { app } = require("@azure/functions");
const fetch = require('node-fetch');
const githubToken = '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';

const owner = 'sallby';
const repo = 'TeoliaPlatformEnginering';
const workflow_id = '84904292';

async function deploy_ressource(context, req) {
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

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        ref: 'main',
      }),
    });


    if (!response.ok) {
      throw new Error(`Erreur lors de la requête: ${response.status} ${response.statusText}`);
    }

    context.res = {
      body: 'Job rerun request sent successfully.',
    };
  } catch (error) {
    console.error('Erreur lors de la requête:', error.message);
  }
  return {
    postmessage: 200,
    jsonBody: {
      env: process.env
    }
  };
}

app.http('deploy_ressource', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: deploy_ressource
});

module.exports = deploy_ressource;