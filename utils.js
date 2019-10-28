const prompts = require('prompts');
const FuzzySearch = require('fuzzy-search');
const { Maybe } = require('./maybe');

function create_search(data, exact) {
  return input => {
    const word = exact ? input : capitalize(input);
    return Maybe(data[word]);
  }
}

function create_suggest(data) {
	const fzf = new FuzzySearch(data, [], {caseSensitive: false, sort: true});

	return word => {
		const matches = fzf.search(word);
		return Maybe(matches[0]);
	};
}

async function confirm_word(value) {
	let answer = await prompts({
		message: `Did you mean ${value}'`,
		type: 'confirm',
		name: 'yes'
	});

	return answer.yes;
}

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function format(results) {
  return results.join('\n');
}

module.exports = {
	create_search,
	create_suggest,
	confirm_word,
	capitalize,
	format
}

