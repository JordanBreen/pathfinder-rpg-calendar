const FILETYPE = "json";
const FILENAME = "./data/weather." + FILETYPE;
let   data;
function init_weather(event) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === this.DONE && this.status === 200) {
			data = this.response;
			let temp = random_temperature("cold", "highland", "winter");
			console.log(temp);
		}
	};
	xhr.responseType = FILETYPE;
	xhr.open("GET", FILENAME, true);
	xhr.send(null);
}
function roll(n, d, mod=0, log=false) {
	if(log) console.log("roll: " + n + "d" + d + (mod?"+"+mod:""));
	let sum = 0;
	for(let i = 0; i < n; i++)
		sum += Math.floor(Math.random() * d) + 1;
	if(log) console.log("result: (" + sum + ")" + (mod?"+"+mod:""));
	return sum + mod;
}
function random_hour() {
	return roll(1,24,-1);
}
function random_temperature(climate, elevation, season) {
	const CLIMATE     = data.climate[climate];
	const ELEVATION   = data.elevation[elevation];
	const SEASON_BASE = CLIMATE.temperature.seasonal_baseline[season];
	const ROLL_RES    = roll(1, /*d*/100);
	const INDEX       = roll_table_index(ROLL_RES, CLIMATE.temperature.variations["d%"]);
	const VAR         = CLIMATE.temperature.variations.variation [INDEX];
	const DUR         = CLIMATE.temperature.variations.duration  [INDEX];
	const VAR_RES     = VAR != null ? roll(VAR.n, VAR.d,          true) * VAR.sign : 0;
	const DUR_RES     = DUR != null ? roll(DUR.n, DUR.d, DUR.mod, true)            : 0;
	const RES         = SEASON_BASE + VAR_RES;
	console.log("[base:" + SEASON_BASE + "] + [variation:" + VAR_RES + "] = " + RES);
	return RES;
}
function roll_table_index(roll_result, roll_table) {
	const LOWER_BOUND = 0;
	const UPPER_BOUND = 1;
	for(let i = 0; i < roll_table.length; i++) {
		if      (roll_result <  roll_table[i][LOWER_BOUND]) continue;
		else if (roll_result <= roll_table[i][UPPER_BOUND]) return i;
	}
	return -1;
}
document.addEventListener("onload", init_weather());