import {Component} from '@angular/core';
import {NavController, NavParams, ViewController, Loading, Toast} from 'ionic-angular';

import {Attachments} from '../../components/attachments';
import {ImageService, QueryService} from '../../services';


/**
 * A page for creating messages.
 * 
 * @export
 * @class MessageEditor
 */
@Component({
	templateUrl: 'build/pages/update/message.html',
	providers: [ImageService],
	directives: [Attachments]
})
export class MessageEditor {
	private message;
	private issue;
	private attachments;

	/**
	 * Creates an instance of MessageEditor.
	 * 
	 * @param {NavParams} params
	 * @param {NavController} nav
	 * @param {ViewController} view
	 * @param {ImageService} image
	 * @param {QueryService} query
	 */
	constructor(
		params: NavParams,
		private nav: NavController,
		private view: ViewController,
		private image: ImageService,
		private query: QueryService
	) {
		this.issue = params.data.issue;
		this.attachments = [];

		// Creates a new message object
		this.message = {
			type: '$MessageT4'
		};
	}

	/**
	 * Adds an attachment image.
	 * 
	 * @param {any} isNew Whether the camera should take a new picture or use an existing one
	 */
	add(isNew) {
		this.image.addImage(isNew, attachment => {
			this.attachments.push(attachment);
		});
	}

	/**
	 * Removes an attachment image.
	 * 
	 * @param {any} attachment The attachment to remove
	 */
	remove(attachment) {
		this.attachments = this.attachments.filter(item => {
			return item != attachment;
		});
	}

	/**
	 * Saves the new message to the system
	 */
	save() {
		// Displays a loading indicator to the user
		let loading = Loading.create({
			content: 'Loading...'
		});
		this.nav.present(loading);

		// Sets the issue pointer to the current issue
		this.message.issue = {
			reference: 'Issue',
			rootId: this.issue.uid,
			rootType: '$IssueT3',
			externalType: '$IssueT3'
		}

		// Copies the licensee from the issue
		this.message.licensee = this.issue.licensee;

		// Posts the message data to the system
		this.query.post(JSON.stringify(this.message), ['$MessageT4']).subscribe(
			data => {
				// Gets the path data for uploading attachments
				let path = ['$MessageT4', data.create.result.uid, 'attach'];

				// Uses the image service to upload and attach all images
				this.image.uploadImages(this.attachments, path, () => {
					// Once complete, dismiss the loading indicator and the editor view
					loading.dismiss().then(value => {
						// Passes true to indicate that the messages should be reloaded
						this.view.dismiss(true);
					});
				});
			},
			error => {
				// Otherwise dismiss the loading indicator and display an error toast
				loading.dismiss().then(value => {
					this.nav.present(Toast.create({
						message: 'Something went wrong, try again later',
						duration: 3000,
					}));
				});
			}
		);
	}

	/**
	 * Cancel the new message creation.
	 */
	cancel() {
		this.view.dismiss();
	}
}