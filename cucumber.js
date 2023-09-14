module.exports = {
  //Please uncomment each config file at a
  /* Existing Behaviour of running one file */
  default:
    '--require tests/features/support/hooks-ts.ts --require tests/step-definitions/*.ts --require-module ts-node/register',
  /* Running All Files */
  // default: 'paths tests/features/*.feature --require tests/features/support/hooks.js --require tests/step-definitions/*.js --format @cucumber/pretty-formatter',
  // /*Running All Feature Files with Tags */
  // default: 'paths tests/features/*.feature --require tests/features/support/hooks.js --require tests/step-definitions/*.js --format @cucumber/pretty-formatter --tags "@smoke"',
  // /*Running All Feature Files with Tags and Parrallel Runners */
};
