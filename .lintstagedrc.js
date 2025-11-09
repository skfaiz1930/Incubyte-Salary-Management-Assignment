module.exports = {
  '*.ts': [
    'eslint --fix',
    'prettier --write',
    'jest --bail --findRelatedTests --passWithNoTests'
  ]
};
