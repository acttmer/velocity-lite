module.exports = {
    "globals": {
      "APP": true,  // APP glue定义
      "require": true,
      "define": true, // seajs
      "Q": true, // 全局参数
      "glue": true,  // 全局参数
      "Velocity": true
    },
    parserOptions: {
      "ecmaVersion": 6,
      "sourceType": "module"
    },
    "env": {
        "browser": true,
        "amd": true,
        "node": true,
        "jasmine": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
