const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const FontPreloadPlugin = require('webpack-font-preload-plugin');

module.exports = {
	entry: ['babel-polyfill', './src/index.js'],
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(mov|mp4)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
						},
					},
				],
			},
			{
				test: /\.(jpe?g|gif|png|svg)$/i,
				use: [
					{
						loader: 'file-loader',
					},
				],
			},
		],
	},
	resolve: { extensions: ['*', '.js', '.jsx'] },
	output: {
		path: path.resolve(__dirname, 'dist/'),

		filename: 'bundle.js',
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		port: 3000,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve('public/index.html'),
			favicon: './public/favicon.png',
		}),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'public/_redirects'),
					to: path.resolve(__dirname, 'dist/'),
				},
			],
		}),
		new FontPreloadPlugin(),
	],
};
