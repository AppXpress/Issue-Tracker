import {Component} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';


/**
 * A page for configuring which items should show in an issue list.
 * 
 * @export
 * @class FilterPage
 */
@Component({
	templateUrl: 'build/pages/index/filter.html'
})
export class FilterPage {
	private filter;

	/**
	 * Creates an instance of FilterPage.
	 * 
	 * @param {NavParams} params A parameter object with the list page this filter applies to
	 */
	constructor(params: NavParams, private view: ViewController) {
		// Initializes the filter and copies its data
		this.filter = new Filter(params.data.filter);
	}

	/**
	 * Saves the changes make to the filter and closes.
	 */
	save() {
		this.view.dismiss(this.filter);
	}

	/**
	 * Resets the filter to default and closes.
	 */
	reset() {
		this.view.dismiss(new Filter());
	}

	/**
	 * Cancels any changes to the filter and closes.
	 */
	cancel() {
		this.view.dismiss();
	}
}

/**
 * A class that stores filter data and has a method to convert to a string.
 * 
 * @export
 * @class Filter
 */
export class Filter {
	public data;

	/**
	 * Creates an instance of Filter.
	 * 
	 * @param {any} [filter={}] An optional existing filter to clone
	 */
	constructor(filter?) {
		// Set the data to the default values
		this.data = {
			subject: '',
			description: '',
			status: '',
			severity: '',
			sort: 'modifyTimestamp',
			order: true
		}

		// Copies data from the passed filter if given
		if (filter) {
			for (var property in filter.data) {
				this.data[property] = filter.data[property];
			}
		}
	}

	/**
	 * Escapes single quotes in text inputs to prevent users form injecting into OQL.
	 * 
	 * @param {any} string The string to escape single quotes in
	 * @returns The string with single quotes escaped
	 */
	private escape(string) {
		return string.replace(/'\'', 'g'/, '\\\'');
	}

	/**
	 * Converts the filter into an OQL query string.
	 * 
	 * @returns A string of OQL
	 */
	toString() {
		// Adds query strings for each set filter to an array of conditions
		let conditions = [];

		if (this.data.subject) {
			conditions.push('subject CONTAINS \'' + this.escape(this.data.subject) + '\'');
		}

		if (this.data.description) {
			conditions.push('description CONTAINS \'' + this.escape(this.data.description) + '\'');
		}

		if (this.data.status) {
			conditions.push('status = \'' + this.data.status + '\'');
		}

		if (this.data.severity) {
			if (this.data.severity == 0) {
				conditions.push('severity = NULL');
			} else {
				conditions.push('severity = \'' + this.data.severity + '\'');
			}
		}

		// Combines each set query condition into a single OQL query
		let query = '';
		conditions.forEach(condition => {
			if (query) {
				query += ' AND ';
			}
			query += condition;
		});

		// Adds the sort ordering to the query
		if (this.data.sort) {
			// Sets to a generic query if there are no conditions
			if (!query) {
				query = '1=1';
			}

			query += ' ORDER BY ' + this.data.sort;

			// Add descending if it was selected
			if (this.data.order) {
				query += ' DESC';
			}
		}

		return query;
	}
}