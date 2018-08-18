
/**
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 * @param name
 * @param url
 * @returns {*}
 */
function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function fromTemplate(templateSelector, data) {
	let template = document.querySelector(templateSelector).innerHTML;
	let populate = eval(`\n (data) => { try { return \` ${template} \`; }  catch(e) { console.log(\`TEMPLATE FAILED: ${templateSelector} \` , e); return ""; } }\n `);
	return populate(data);
}

function sourceMissing() {
	document.getElementsByTagName("body")[0].innerHTML = "expects URL parameter url<br>e.g. http://..../?url=https://raw.githubusercontent.com/afakes/resume/master/resume.json";
}

function getSourceData(templateID = "#body") {

	let templateURL = "basic.template.html";

	fetch(templateURL)
	.then(
		(templateResponse) => {
			if (templateResponse.status === 200) {

				templateResponse.text().then(
					(templateText) => {
						console.log("templateText = ",templateText);
						//document.getElementsByTagName("body")[0].innerHTML = fromTemplate(templateID, data); }

						document.getElementsByTagName("html")[0].appendChild(document.createRange().createContextualFragment(templateText));

						let dataSourceURL = getParameterByName('url');
						if (dataSourceURL == null) { sourceMissing(); return; }

						fetch(dataSourceURL)
						.then(
							(response) => {
								if (response.status === 200) {
									response.json().then( (data) => { document.getElementsByTagName("body")[0].innerHTML = fromTemplate(templateID, data); } );
								} else { document.getElementsByTagName("body")[0].innerHTML = `<pre>FAILED to load data from ${dataSourceURL}</pre>`; }
							}
						)
						.catch(
							(err) => {
								document.getElementsByTagName("body")[0].innerHTML = `<pre>${err.toString()}</pre>`;
							}
						);

					}
				);

			} else { document.getElementsByTagName("body")[0].innerHTML = `<pre>FAILED to load data from ${dataSourceURL}</pre>`; }
		}
	)
	.catch(
		(err) => {
			document.getElementsByTagName("body")[0].innerHTML = `<pre>${err.toString()}</pre>`;
		}
	);

}

function pre(data = {}, indent = 4) {
	return "<pre>" + JSON.stringify(data, null, indent) + "</pre>";
}

function rows(templateID, data) {

	let result = "";
	if (Array.isArray(data)) {
		data.forEach( (element,key) => { result += fromTemplate(templateID, element, key ) + "\n"; } );
	} else if (typeof data === "object") {
		Object.keys(data).forEach( (key) => { result += fromTemplate(templateID, {"key": key, "value": data[key] }) + "\n"; } );
	} else {
		result = "row source unknown";
	}
	return result;
}