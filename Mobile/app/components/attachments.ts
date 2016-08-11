import {Component, Input} from '@angular/core';
import {DomSanitizationService} from '@angular/platform-browser';
import {NavController, NavParams, ViewController, Modal} from 'ionic-angular';

import {ImageService} from '../services';


/**
 * A component used to display a list of attachments.
 * 
 * @export
 * @class Attachments
 */
@Component({
	templateUrl: 'build/components/attachments.html',
	selector: 'attachments-list',
	providers: [ImageService]
})
export class Attachments {
	@Input() data: Array<Object>;
	@Input() edit: Boolean;

	/**
	 * Creates an instance of Attachments.
	 * 
	 * @param {NavController} nav
	 * @param {ImageService} image
	 */
	constructor(private nav: NavController, private image: ImageService) { }

	/**
	 * Opens a larger image view for an attachment.
	 * 
	 * @param {any} image The image attachment to display
	 */
	view(image) {
		let modal = Modal.create(ImageViewer, { image: image });
		this.nav.present(modal);
	}

	/**
	 * Adds a new image as an attachment.
	 * 
	 * @param {any} isNew Whether the image should be taken from the camera or an existing picture
	 */
	add(isNew) {
		this.image.addImage(isNew, attachment => {
			this.data.push(attachment);
		});
	}

	/**
	 * Removes an image attachment from the list.
	 * 
	 * @param {any} image The image to remove
	 */
	remove(image) {
		this.data.splice(this.data.indexOf(image), 1);
	}
}

/**
 * This is a work around for the broken Ionic Scroller
 * Once pinching is fixed, replace it!
 * 
 * A large image viewer with pinch to zoom and panning.
 * 
 * @class ImageViewer
 */
@Component({
	template: `
<div class="imageview" (click)="close()"><img [src]="url" [style]="style" (pinch)="pinch($event)" (click)="close()" /></div>
	`
})
class ImageViewer {
	private url;
	private style;
	private timeout;
	private width = 100;
	private scale = 100;

	/**
	 * Creates an instance of ImageViewer.
	 * 
	 * @param {NavParams} params
	 * @param {DomSanitizationService} safe
	 * @param {ViewController} view
	 */
	constructor(params: NavParams, private safe: DomSanitizationService, private view: ViewController) {
		// Passes the image URL to the img element and sets the default style
		this.url = safe.bypassSecurityTrustUrl(params.data.image.url);
		this.style = this.safe.bypassSecurityTrustStyle('width: 100%;');
	}

	/**
	 * Closes the image view.
	 */
	close() {
		this.view.dismiss();
	}

	/**
	 * Handles when the user pinches the image to zoom.
	 * 
	 * @param {any} event The pinch event
	 */
	pinch(event) {
		// Sets the width to the width before starting to pinch (scale) times the event scale factor
		this.width = Math.min(Math.max(this.scale * event.scale, 50), 500);

		// Sets the stile of the img element using the new width value
		this.style = this.safe.bypassSecurityTrustStyle('width: ' + this.width + '%;');

		// The timeout is to make sure the scale isn't reset until after the user lets go
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		this.timeout = setTimeout(() => {
			this.timeout = null;
			this.scale = this.width;
		}, 250);
	}
}