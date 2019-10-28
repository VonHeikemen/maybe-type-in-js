const prompts = require('prompts');

const { Future, Maybe } = require('./maybe');
const {
	create_search,
	create_suggest,
	confirm_word,
	format
} = require('./utils');

const entries = data();

const suggest = create_suggest(Object.keys(entries));
const search = create_search(entries, true);
const search_name = create_search(entries, false);

const suggest_word = value => () => suggest(value)
	.map(Future.from_val)
	.filter(confirm_word)
	.map(search)

const search_word = word => search(word)
	.or_else(() => search_name(word))
	.or_else(suggest_word(word))
	.map(format)
  .unwrap_or('');


async function main() {
	let input = {};
	const valid_input = val => (
		typeof val == 'string' &&
		val !== 'exit'
	);

	while(1) {
		input = prompts({
			message: 'Search a word\n',
			type: 'text',
			name: 'value'
		});

		let match = await Future(input)
			.map(answer => answer.value)
			.filter(valid_input)
			.map(search_word)
			.unwrap_or(false);

			if(match === false) {
				break;
			}

			if(match.length) {
				console.log('Matches:\n', match, '\n');
			} else {
				console.log('No results found\n');
			}
	}

	process.exit(0);
}

main().catch((e) => console.error({error: e}));





function data() {
  return {
    "abandoned industrial site": ["Site that cannot be used for any purpose, being contaminated by pollutants."], 
    "abandoned vehicle": ["A vehicle that has been discarded in the environment, urban or otherwise, often found wrecked, destroyed, damaged or with a major component part stolen or missing."],
    "abiotic factor": ["Physical, chemical and other non-living environmental factor."],
    "access road": ["Any street or narrow stretch of paved surface that leads to a specific destination, such as a main highway."],
    "access to the sea": ["The ability to bring goods to and from a port that is able to harbor sea faring vessels."],
    "accident": ["An unexpected, unfortunate mishap, failure or loss with the potential for harming human life, property or the environment.", "An event that happens suddenly or by chance without an apparent cause."], 
    "accumulator": ["A rechargeable device for storing electrical energy in the form of chemical energy, consisting of one or more separate secondary cells.\\n(Source: CED)"], 
    "acidification": ["Addition of an acid to a solution until the pH falls below 7."], 
    "acidity": ["The state of being acid that is of being capable of transferring a hydrogen ion in solution."], 
    "acidity degree": ["The amount of acid present in a solution, often expressed in terms of pH."], 
    "acid rain": ["Rain having a pH less than 5.6."], 
    "acid": ["A compound capable of transferring a hydrogen ion in solution.", "Being harsh or corrosive in tone.", "Having an acid, sharp or tangy taste.", "A powerful hallucinogenic drug manufactured from lysergic acid.", "Having a pH less than 7, or being sour, or having the strength to neutralize  alkalis, or turning a litmus paper red."],
    "acoustic filter": ["A device employed to reject sound in a particular range of frequencies while passing sound in another range of frequencies."],
    "acoustic insulation": ["The process of preventing the transmission of sound by surrounding with a nonconducting material."],
    "acoustic level": ["Physical quantity of sound measured, usually expressed in decibels.\\n(Source: KORENa)"],
    "Paris": ["The capital and largest city of France."]
  };
}
