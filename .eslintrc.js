module.exports = {
  rules: {
    "no-unused-vars": "off",
    'vue/multi-word-component-names': 'off',
    'vue/require-v-for-key': 'off',
    'vue/no-parsing-error': 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    'vue/no-deprecated-v-on-native-modifier': 'off',
    'vue/no-unused-vars': 'off',
    'vue/valid-v-for': 'off',
    'vue/no-use-v-if-with-v-for': 'off',
    'vue/no-deprecated-destroyed-lifecycle': 'off',

    'vue/order-in-components': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': 'off',
    'vue/no-multi-spaces': 'off',
    'vue/html-indent': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/mustache-interpolation-spacing': 'off',
    'vue/attributes-order': 'off',
    'vue/html-quotes': 'off',
    'vue/v-on-event-hyphenation': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/component-tags-order': 'off',
    'vue/multiline-html-element-content-newline': 'off', 
    'vue/no-lone-template': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/v-bind-style': 'off',
    'vue/this-in-template': 'off',
    'vue/no-template-shadow': 'off'

  },
  extends: [
    'plugin:vue/recommended', 
  ],
  parserOptions: {
    parser: '@babel/eslint-parser', 
    sourceType: 'module',           
    ecmaVersion: 2021               
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',   
    }
  ]
};
