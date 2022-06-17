
class random {

	constructor () {
		this.crypto = (typeof window.crypto.getRandomValues === 'function');
	
		this.intMin = Number.MIN_VALUE;
		this.intMax = Number.MAX_VALUE;
	}	
	
	random () {
		if (this.crypto) {
			return window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
		}

		return Math.random();
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
