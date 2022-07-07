#!.usr/bin/env node
const axios = require('axios');
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

class invisiFox {

	constructor(apiKey=null,proxyUsername=null,proxyPassword=null,attempts=20,logs=false) {
		this.apiString = "https://api.invisifox.com/"
		this.apiKey = apiKey;
		this.proxyUsername = proxyUsername
		this.proxyPassword = proxyPassword
		this.attempts = attempts
		this.logs = logs
		this.proxyCountriesList = ['Random', 'UnitedStates', 'Canada', 'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'BosniaandHerzegovina', 'Brazil', 'BritishVirginIslands', 'Brunei', 'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia', 'CostaRica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'DominicanRepublic', 'Ecuador', 'Egypt', 'ElSalvador', 'Estonia', 'Ethiopia', 'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guyana', 'HashemiteKingdomofJordan', 'HongKong', 'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Kazakhstan', 'Kenya', 'Kosovo', 'Kuwait', 'Latvia', 'Liechtenstein', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malaysia', 'Mauritius', 'Mexico', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Nepal', 'Netherlands', 'NewZealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'PapuaNewGuinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'PuertoRico', 'Qatar', 'RepublicofLithuania', 'RepublicofMoldova', 'Romania', 'Russia', 'SaudiArabia', 'Senegal', 'Serbia', 'Seychelles', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'SouthAfrica', 'SouthKorea', 'Spain', 'SriLanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'TrinidadandTobago', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine', 'UnitedArabEmirates', 'UnitedKingdom', 'UnitedStates', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Zambia']

	}

	pprint(content) {
		if (this.logs) {
			console.log(content)
		}
	}

	async solveHCaptcha(sitekey,pageurl,proxy,rqdata=null,useragent=null,cookies=null,invisible=false) {
		if (!this.apiKey) {
			throw new Error('No API key set');
		}
		else {
			let payload = {
				"token": this.apiKey,
				"siteKey": sitekey,
				"pageurl": pageurl,
				"proxy": proxy,
				"rqdata": rqdata,
				"useragent": useragent,
				"cookies": cookies,
				"invisible": invisible
			}
			try {
				let req = await axios.get(`${this.apiString}hcaptcha`, {params:payload});
				req = req.data;
				this.pprint(req)
				if (req['status'] == 'OK') {
					await sleep(25000);
					for (let i = 0; i < this.attempts; i++) {
						payload = {"token": this.apiKey,"taskId": req['taskId']}
						let sol = await axios.get(`${this.apiString}solution`, {params:payload})
						sol = sol.data;
						this.pprint(sol);
						if (sol['status'] == 'WAITING') {
							await sleep(10000);
						}
						else if (sol['status'] == 'OK') {
							return sol['solution'];
						}
						else {
							throw new Error(`Error ${sol['status']}`);
						}
					}
					throw new Error(`Error could not find solution in time`);
				}
				else {
					throw new Error(`Error ${req['status']}`);
				}
			} catch (error) {
				throw new Error(error);
			}
		}
	}

	makeProxy(country="Random",proxyType="random",protocol="http",count=1) {
		country = country.replace(' ','');
		if (!this.proxyUsername || !this.proxyPassword) {
			throw new Error(`No Proxy Username and / or Proxy Password set. You can set them on the invisiFox class init or directly onto the class object. If you do not have invisiFox proxy credentials please create an account on invisiFox.com to get them.`);
		}
		else {
			if (!['http','https'].includes(protocol)) {
				throw new Error(`Unsupported protocol, please use http or https only`);
			}
			else if (count <= 0) {
				throw new Error(`Please specific a count >0`);
			}
			else if (!this.proxyCountriesList.includes(country)) {
				throw new Error(`Country not supported, please check our country list in our API documentation for list of supported geos`);
			}
			else {
				let countryType = '_country-'+country
				if (countryType == '_country-Random') {
					countryType = '';
				}

				let ansArr = [];

				function generateRandomString(n) {
					let randomString = '';
					let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

					for ( let i = 0; i < n; i++ ) {
						randomString += characters.charAt(Math.floor(Math.random()*characters.length));
					}

					return randomString;
				}

				if (proxyType == 'random') {
					for (let i = 0; i < count; i++) {
						ansArr.push(`${protocol}://${this.proxyUsername}:${this.proxyPassword}${countryType}@proxy.invisifox.com:80`)
					}
				}
				else if (proxyType == 'sticky') {
					for (let i = 0; i < count; i++) {
						ansArr.push(`${protocol}://${this.proxyUsername}:${this.proxyPassword}${countryType}_session-${generateRandomString(8)}@proxy.invisifox.com:80`)
					}
				}
				else {
					throw new Error(`Unsupported proxy type, please use random or sticky only`);
				}

				return ansArr;
			}
		}
	}

}

module.exports.invisiFox = invisiFox;