import { random } from './random.js';
const { createApp } = Vue;

class Card {
	id;
	color;
	#colors = ['red', 'yellow', 'blue'];

	constructor(options) {
		if (options?.id) {
			this.id = options.id;
		} else {
			this.id = rnd.string(16, '0123456789abcdef');
		}

		if (options?.color) {
			this.color = options.color;
		} else {
			this.color = rnd.pick(this.#colors);
		}
	}

	play () {
		console.log('Played!');
	}
}

let rnd = new random();

createApp({
	data () {
		return {
			'deck': [],
			'originalDeck': [],
			'deckSize': 30,
			'handSize': 10,
			'cardCounter': 1,
			'yard': [],
			'hand': []
		}
	},
	mounted () {
		this.restart();
	},
	'methods': {
		restart () {

			// reset existing values
			this.deck = [];
			this.originalDeck = [];
			this.yard = [];
			this.hand = [];
			this.cardCounter = 1;

			// create deck
			for (let i=0; i<this.deckSize; i++) {
				const c = new Card({
					'id': this.cardCounter
				});
				this.cardCounter += 1;
				this.deck.push(c);
			}
			this.originalDeck = this.deck;

			// shuffle?
			// this.deck = rnd.shuffle(this.deck);

			// deal first hand
			const cards = this.draw(4);
		},
		draw (amount) {
			const result = [];
			for (let i=0; i<amount; i++) {

				if (this.deck.length > 0) {
					if (this.hand.length >= this.handSize) {
						console.error('your hand is full!');
						const card = this.deck.shift();
						this.yard.push(card);
						break;
					}

					const card = this.deck.shift();
					this.hand.push(card);
					result.push(card);
				} else {
					console.error('no cards left in deck!');
					break;
				}
			}
			return result;
		},
		play (card) {
			const index = this.hand.findIndex(function (c) {
				if (c.id === card.id) return true;
				return false;
			});

			// remove card from hand
			this.hand.splice(index, 1);

			// play card action
			card.play();

			console.log('played', card.id, card.color);

			// add to graveyard
			this.yard.unshift(card);
		}
	}
}).mount('#app');
