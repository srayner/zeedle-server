const subject = "Zeedle account verification.";
const body = link => {
  return `Thanks for signing up to Zeedle. To complete your registation click or paste this link into your browser:  ${link}`;
};

module.exports = { subject, body };
