import {Component, ViewChild} from '@angular/core';
import {NavController, ActionSheet, Modal, Toast} from 'ionic-angular';

import {QueryService} from '../../services';
import {LoginPage} from '../login/login';
import {IssuePage} from '../display/issue';
import {IssueEditor} from '../update/issue';
import {FilterPage, Filter} from './filter';


/**
 * A page displaying a list of issues, with options to filter items.
 * 
 * @export
 * @class ListPage
 */
@Component({
	templateUrl: 'build/pages/index/list.html'
})
export class ListPage {
	private list;
	private hasMore;
	private limit = 10;
	private filter;

	/**
	 * Creates an instance of ListPage.
	 * 
	 * @param {QueryService} query A service used for making API calls
	 * @param {NavController} nav Navigation system for controlling display
	 */
	constructor(private query: QueryService, private nav: NavController) {
		this.filter = new Filter();
		this.reload();
	}

	/**
	 * Returns to the login page.
	 */
	logout() {
		this.nav.setRoot(LoginPage);
	}

	/**
	 * Displays a detailed view for a specific issue.
	 * 
	 * @param {any} issue The issue to display details for
	 */
	viewIssue(issue) {
		this.nav.push(IssuePage, { issue: issue });
	}

	/**
	 * Shows a filter page for configuring the list items.
	 */
	changeFilter() {
		let modal = Modal.create(FilterPage, { filter: this.filter });
		this.nav.present(modal);
		modal.onDismiss(data => {
			if (data) {
				this.filter = data;
				this.reload();
			}
		})
	}

	/**
	 * Opens a new issue creation page.
	 */
	add() {
		let modal = Modal.create(IssueEditor);
		this.nav.present(modal);
		modal.onDismiss(data => {
			if (data) {
				this.reload();
			}
		});
	}

	/**
	 * Reloads the issues on the page.
	 */
	reload() {
		// Clears the list, resets the has more flag, and loads
		delete this.list;
		delete this.hasMore;
		this.load();
	}

	/**
	 * Loads the next set of issue from the system.
	 * 
	 * @param {any} [event] An optional event object for controlling the infinite scroller
	 */
	load(event?) {
		// Gets the URL parameters for the request
		let keys = {
			oql: this.filter.toString(),
			offset: (this.list || []).length,
			limit: this.limit
		};

		// Queries for issues and subscribes to the response
		this.query.get(['$IssueT3', 'query'], keys).subscribe(
			data => {
				// If data was returned, add it to the list
				this.list = (this.list || []).concat(data.result || []);

				// Set the has more flag from the response
				this.hasMore = data.resultInfo.hasMore;

				// Mark the event as completed on the infinite scroller
				if (event) {
					event.complete();
				}
			},
			error => {
				// If there was an error, show a toast message
				this.nav.present(Toast.create({
					message: 'Something went wrong, try again later.',
					duration: 3000
				}));
			}
		)
	}
}