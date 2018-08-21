const path = require('path');

module.exports = {
    entry: './src/orgzchart.js',
    output: {
        filename: 'orgzchart.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015']
                    }
                }
            }
        ]
    }
};
