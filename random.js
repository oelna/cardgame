
class random {

	constructor (seed) {
		this.crypto = (typeof window.crypto.getRandomValues === 'function');

		this.intMin = Number.MIN_VALUE;
		this.intMax = Number.MAX_VALUE;

		// prepare a valid seed from alphanumeric input
		this.seed = seed || this.makeSeed();
		this._seed = this.makeHash(this.seed);

		// fire up the generator
		this.random = this.mulberry32(this._seed);
	}

	mulberry32 (a) { // https://stackoverflow.com/a/47593316/3625228
		return function () {
			var t = a += 0x6D2B79F5;
			t = Math.imul(t ^ t >>> 15, t | 1);
			t ^= t + Math.imul(t ^ t >>> 7, t | 61);
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		}
	}

	makeHash (str) { // https://stackoverflow.com/a/8831937/3625228
		str = str.toString();
		let hash = 0;
		for (let i = 0, len = str.length; i < len; i++) {
			let chr = str.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}

	makeSeed () {
		// todo: verify this works properly
		if (this.crypto) {
			var o = new Uint32Array(1);
			window.crypto.getRandomValues(o);
			return o[0];
		} else {
			return Math.floor(Math.random() * Math.pow(2, 32));
		}
	}

	getState () {
		return this.seed;
	}

	setState (seed) {
		if (!seed) return;

		console.log('setting seed to', seed);
		this.seed = seed;
		this._seed = this.makeHash(this.seed);
		this.random = this.mulberry32(this._seed);
	}

	bool () {
		return this.random() < 0.5;
	}

	int (from, to) {
		return this.randinterval(from, to, true);
	}
	
	float (from, to) {
		return from + ((to - from) * this.random());
	}
	
	string (length, charactersToUse) {
		if (!charactersToUse) {
			const charactersToUse = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		}
		let str = "";
		for (let i = 0; i < length; i++) {
			str += charactersToUse.charAt(this.int(0, charactersToUse.length - 1));
		}
		return str;
	}

	pick (arr) {
		return arr[this.int(0, arr.length - 1)];
	}
	
	chance (n) {
		return this.float(0, 100) < n;
	}

	challenge (lower, upper, value) {
		let span = upper - lower;

		let chance = (value-lower)/(span/100);
		if (chance <= 0) chance = 0;
		if (chance >= 100) chance = 100;

		return this.chance(chance);
	}

	shuffle (arr) {
		let tmp, j, i = arr.length;
		while (--i > 0) {
			j = this.int(0, i);
			tmp = arr[i];
			arr[i] = arr[j];
			arr[j] = tmp;
		}
		
		return arr;
	}

	/* usage .weighted(['a', 'b'], [100, 1]); picks one of the options, with odds applied */
	weighted (options, odds) {
        if (options.length !== odds.length) {
            throw new RangeError("Chance: Length of array and odds must match");
        }

        let sum = 0;
        let val;
        for (let weightIndex = 0; weightIndex < odds.length; ++weightIndex) {
            val = odds[weightIndex];
            if (isNaN(val)) {
                throw new RangeError("Chance: All weights must be numbers");
            }

            if (val > 0) {
                sum += val;
            }
        }

        if (sum === 0) {
            throw new RangeError("Chance: No valid entries in array odds");
        }

        const selected = this.random() * sum;

        let total = 0;
        let lastGoodIdx = -1;
        let chosenIdx;
        for (let weightIndex = 0; weightIndex < odds.length; ++weightIndex) {
            val = odds[weightIndex];
            total += val;
            if (val > 0) {
                if (selected <= total) {
                    chosenIdx = weightIndex;
                    break;
                }
                lastGoodIdx = weightIndex;
            }

            if (weightIndex === (odds.length - 1)) {
                chosenIdx = lastGoodIdx;
            }
        }

        return options[chosenIdx];
    }
	
	randinterval (min, max, includeMax) {
		
		if (!includeMax) {
			const includeMax = false;
		}
		
		if (min == max) return min;
		if (max < min) return this.randinterval(max, min, includeMax);
		if (min < 0 || max < 1) {
			return this.rand((max - min) + (includeMax ? 1 : 0)) + min;
		}
		return min + this.rand(max - min + (includeMax ? 1 : 0));
	}

	rand (n) {
		if (n <= 0 || n > this.intMax) {
			console.error("n out of (0, INT_MAX]");
		}
		
		return Math.floor(this.random() * n);
	}
};

export { random };
