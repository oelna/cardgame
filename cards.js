import { random } from './random.js';
const { createApp } = Vue;

class Card {
	instance;
	id;
	color;
	#colors = ['red', 'yellow', 'blue'];

	constructor(options) {
		if (options?.instance) {
			this.instance = options.instance;
		} else {
			// fatal!
			throw new Error('No Vue instance provided!');
		}
		
		if (options?.id) {
			this.id = options.id;
		} else {
			this.id = this.instance.random.string(16, '0123456789abcdef');
		}

		if (options?.color) {
			this.color = options.color;
		} else {
			this.color = this.instance.random.pick(this.#colors);
		}

		// console.log('Created card', this.id, this.color);
	}

	play () {
		console.log('Played!', this.id, this.color);
	}
}

const app = createApp({
	data () {
		return {
			'random': null,
			'seed': null,
			'card': Card,
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

		// todo: make seed random!
		this.random = new random();
		this.seed = this.random.getState();

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
				const c = new this.card({
					'instance': this,
					'id': this.cardCounter
				});
				this.cardCounter += 1;
				this.deck.push(c);
			}
			this.originalDeck = this.deck;

			// shuffle?
			// this.deck = rnd.shuffle(this.deck);

			// deal first hand
			const cards = this.draw(5);
		},
		draw (amount) {
			const result = [];
			for (let i=0; i<amount; i++) {

				if (this.deck.length > 0) {
					if (this.hand.length >= this.handSize) {
						console.error('your hand is full!');
						const card = this.deck.shift();
						this.yard.push(card);

						const alert = document.querySelector('.messages .hand-full');
						alert.show();

						break;
					}

					const card = this.deck.shift();
					this.hand.push(card);
					result.push(card);
				} else {
					console.error('no cards left in deck!');

					const alert = document.querySelector('.messages .deck-empty');
					alert.show();

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

			// add to graveyard
			this.yard.unshift(card);
		},
		getCardRotation (cardIndex, handSize) {
			const initialRotation = -20;
			const finalRotation = 20;

			const span = Math.abs(initialRotation) + Math.abs(finalRotation);
			const steps = span / (handSize-1);

			return initialRotation + (steps * cardIndex);
		},
		getCardShift (cardIndex, handSize) {
			// this should be improved by someone who knows their maths
			const lowestShift = 10;
			const highestShift = 20;

			// make fake indices for cards beyond the mid point
			if (cardIndex >= handSize/2) {
				cardIndex = (handSize-1) - cardIndex;
			}

			const span = Math.abs(lowestShift) + Math.abs(highestShift);
			const steps = span / handSize;

			const shift = lowestShift - (steps * cardIndex);

			/*
			const f = function (x) {
				return (Math.pow((x-0.5), 2) + 0.25);
			}
			*/

			return shift;
		},
		setSeed () {
			const input = document.querySelector('#seed-input');
			const seed = input.value;

			if (seed !== '') {
				this.random.setState(seed);
				this.seed = this.random.getState();
				input.value = '';
			} else { console.warn('Please no empty seed!'); }
			// todo: maybe restart() after this?
		}
	}
});

app.config.isCustomElement = tag => tag.startsWith('sl-'); // exclude shoelace components
app.mount('#app');
