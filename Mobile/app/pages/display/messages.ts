import {Component} from '@angular/core';
import {NavController, NavParams, ActionSheet, Modal, Toast} from 'ionic-angular';

import {Attachments} from '../../components/attachments';
import {ImageService, QueryService} from '../../services';
import {MessageEditor} from '../update/message.ts';

/**
 * A page displaying a list of messages for an issue.
 * 
 * @export
 * @class MessagesPage
 */
@Component({
	templateUrl: 'build/pages/display/messages.html',
	providers: [ImageService],
	directives: [Attachments]
})
export class MessagesPage {
	private issue;
	private limit = 10;

	/**
	 * Creates an instance of MessagesPage.
	 * 
	 * @param {NavParams} params
	 * @param {NavController} nav
	 * @param {ImageService} image
	 * @param {QueryService} query
	 */
	constructor(
		params: NavParams,
		private nav: NavController,
		private image: ImageService,
		private query: QueryService
	) {
		this.issue = params.data.issue;

		// Only loads if the messages weren't stored already
		if (!this.issue.messages) {
			this.load();
		}
	}

	/**
	 * Opens a new message creation page.
	 */
	add() {
		let modal = Modal.create(MessageEditor, { issue: this.issue });
		this.nav.present(modal);
		modal.onDismiss(data => {
			if (data) {
				this.reload();
			}
		});
	}

	/**
	 * Reloads the messages on the page.
	 */
	reload() {
		// Clears the list, resets the has more flag, and loads
		delete this.issue.messages;
		delete this.issue.hasMore;
		this.load();
	}

	/**
	 * Loads the next set of messages from the system.
	 * 
	 * @param {any} [event] An optional event object for controller the infinite scroller
	 */
	load(event?) {
		// Gets the URL parameters for the request
		let keys = {
			oql: 'issue.rootId=' + this.issue.uid + ' ORDER BY createTimestamp',
			offset: (this.issue.messages || []).length,
			limit: this.limit
		};

		// Queries for issues and subscribes to the response
		this.query.get(['$MessageT4', 'query'], keys).subscribe(
			data => {
				// If data was returned, add it to the list
				this.issue.messages = (this.issue.messages || []).concat(data.result || []);

				// Set the has more flag from the response
				this.issue.hasMore = data.resultInfo.hasMore;

				// Mark the event as completed on the infinite scroller
				if (event) {
					event.complete();
				}

				// Load attachments for each message
				this.loadAttachments();
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

	/**
	 * A helper method for querying the attachments for each message.
	 */
	loadAttachments() {
		// Loops through each message in the list
		this.issue.messages.forEach(message => {
			if (!message.attachments) {
				// Creates and subscribes to an attachment query
				this.query.get(['$MessageT4', message.uid, 'attachment']).subscribe(
					data => {
						// Sets the message attachment list to the data or an empty array
						message.attachments = data.result || [];

						// Runs the image attachment loader on the message attachments
						this.image.loadImages(message.attachments);
					},
					error => {
						// If there was an error, show a toast message
						this.nav.present(Toast.create({
							message: 'Something went wrong.',
							duration: 3000
						}));
					}
				);
			}
		});
	}
}