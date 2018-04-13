const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//It will load the currency type into mongoose
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema({
	rating: {
		type: Number,
		min: 1,
		max: 5,
		required: true
	},
	comment: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	}
},{
	timestamps: true
});

const disheSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	label: {
		type: String,
		default: ''
	},
	price: {
		type: Currency,
		required: true,
		min: 0
	},
	featured: {
		type: Boolean,
		default: false
	},
	comments: [commentSchema]
	//The comments document becomes a sub document inside dish document
},{
	timestamps: true  
	//This will automatically add created at and updated at timestamps
});

var Dishes = mongoose.model('Dish', disheSchema);

module.exports = Dishes;
