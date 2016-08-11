import {Injectable} from '@angular/core';
import {Http, Response, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import {NavController, Alert, Loading} from 'ionic-angular';


/**
 * Class for making REST API calls to the GT Nexus platform.
 * 
 * @export
 * @class QueryService
 */
@Injectable()
export class QueryService {

	/**
	 * Creates an instance of QueryService.
	 * 
	 * @param {Http} http
	 */
	constructor(private http: Http) { }

	/**
	 * Sends a GET request to the system.
	 * 
	 * @param {any} [path=[]] An array containing the path to use in the request
	 * @param {any} [keys={}] Key value pairs of URL parameters to add to the request
	 * @param {any} [params={}] Key value pairs of headers to add to the request
	 * @returns An observable for the request
	 */
	get(path = [], keys = {}, params = {}) {
		return this.getRaw(path, keys, params).map(data => data.json());
	}

	/**
	 * Sends a GET request to the system but does not map the returned result.
	 * 
	 * @param {any} [path=[]] An array containing the path to use in the request
	 * @param {any} [keys={}] Key value pairs of URL parameters to add to the request
	 * @param {any} [params={}] Key value pairs of headers to add to the request
	 * @returns An observable for the request
	 */
	getRaw(path = [], keys = {}, params = {}) {
		return this.http.get(Query.URL(path, keys), Query.Options(params));
	}

	/**
	 * Sends a POST request to the system.
	 * 
	 * @param {any} data The data to send as the body of the post request
	 * @param {any} [path=[]] An array containing the path to use in the request
	 * @param {any} [keys={}] Key value pairs of URL parameters to add to the request
	 * @param {any} [params={}] Key value pairs of headers to add to the request
	 * @returns An observable for the request
	 */
	post(data, path = [], keys = {}, params = {}) {
		return this.http.post(Query.URL(path, keys), data, Query.Options(params)).map(data => data.json());
	}

	/**
	 * Sends the login request and handles user authentication.
	 * 
	 * @param {string} username The input username
	 * @param {string} password The input password
	 * @returns An observable for the request
	 */
	login(username: string, password: string) {
		let request = this.getRaw([], {}, { Authorization: 'Basic ' + btoa(username + ':' + password) });
		request.subscribe(data => Query.token = data.headers.get('Authorization'));
		return request;
	}

	/**
	 * Sends a GET request to the system but interprets teh response body as a blob instead of text/JSON.
	 * 
	 * @param {any} [path=[]] An array containing the path to use in the request
	 * @param {any} onLoad The function to call when the request has completed
	 */
	getBlob(path = [], onLoad) {

		// Angular's HTTP module doesn't work with blobs yet, so I'm making a manual XHR request
		// Files must be downloaded in blobs so that the binary is preserved and the files aren't corrupted

		let xhr = new XMLHttpRequest();
		xhr.open('GET', Query.URL(path));
		xhr.setRequestHeader('Authorization', Query.token);
		xhr.responseType = 'blob';
		xhr.onload = function () {
			onLoad(this.response);
		};
		xhr.send();
	}
}

/**
 * Helper class for parsing HTTP data for the queries.
 * 
 * @class Query
 */
class Query {

	// ██████████████████████████████████████████████████████████████
	// ██ Note: you MUST enter a data key for this app to work!    ██
	// ██ You should also change the URL base for your environment ██
	// ██████████████████████████████████████████████████████████████

	private static dataKey = 'YOUR DATA KEY HERE'; // ☛⚠➜ !❕❗ IMPORTANT ❗❕! ⇠⇽←⇐⇦ ☠☡☢☣☤ ⚑⚐⚑
	private static base = 'https://commerce-demo.gtnexus.com/rest/310';

	/**
	 * Generates a URL string based on path segments and parameter key/value pairs.
	 * 
	 * @static
	 * @param {*} [path=[]] An array of path segments to create a URL from
	 * @param {*} [keys={}] A set of key-value pairs to use as URL parameter
	 * @returns A string that can be used as a URL for a server request
	 */
	static URL(path: any = [], keys: any = {}) {
		let url = path.length == 0 ? this.base + '/' : this.base;

		path.forEach(dir => {
			url += '/' + dir;
		});

		url += '?dataKey=' + this.dataKey;

		for (var name in keys) {
			if (keys[name]) {
				url += '&' + name + '=' + encodeURIComponent(keys[name]);
			}
		}

		return url;
	}


	static token;

	/**
	 * Generates a combined header object with the auth token and additional passed headers.
	 * 
	 * @static
	 * @param {*} [params={}] A set of key-value pairs to add/overwrite the other headers with
	 * @returns A header object to be sent with requests from the server
	 */
	static Options(params: any = {}) {
		let headers = new Headers();
		headers.set('Content-Type', 'application/json');
		headers.set('Authorization', this.token);

		for (var header in params) {
			headers.set(header, params[header]);
		}

		return { headers: headers };
	}
}