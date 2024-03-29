module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ['airbnb-base'],
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        indent: ['error', 4],
        'no-console': 'off',
        'operator-linebreak': 'off',
        'max-len': 'off',
        'consistent-return': 'off',
    },
};
