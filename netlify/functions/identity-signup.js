// functions/identity-signup.js
exports.handler = async function(event, context) {
  const { user } = JSON.parse(event.body);

  // Here you can check against a list of admin emails, or use any other logic
  // to determine if the user should be an admin
  const isAdmin = user.email === 'vietemt@gmail.com';

  const roles = isAdmin ? ['admin'] : ['user'];

  return {
    statusCode: 200,
    body: JSON.stringify({ app_metadata: { roles: roles } })
  };
};
