import {Injectable} from '@angular/core';
import {File, Camera} from 'ionic-native';

import {QueryService} from './query.service';


/**
 * A service for handing image attachments on issues and messages.
 * 
 * @export
 * @class ImageService
 */
@Injectable()
export class ImageService {

	/**
	 * Creates an instance of ImageService.
	 * 
	 * @param {QueryService} query
	 */
	constructor(private query: QueryService) { }

	/**
	 * Adds a new image either by upload or from the camera.
	 * 
	 * @param {any} isNew Whether to take a new picture with the camera or upload an existing one
	 * @param {any} onAdd A function to call when a new picture has been added
	 */
	addImage(isNew, onAdd) {
		// Storing the Cordova camera plugin options
		let options = {
			targetWidth: 1920,
			targetHeight: 1080,
			correctOrientation: true,
			encodingType: Camera.EncodingType.JPEG,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: Camera.PictureSourceType.PHOTOLIBRARY
		};

		// Change it to use the camera instead of gallery
		if (isNew) {
			options.sourceType = Camera.PictureSourceType.CAMERA;
		}

		// Request the picture and add the URL to the attachments list
		Camera.getPicture(options).then(path => {
			onAdd({ url: path });
		});
	}

	/**
	 * Reads an added image from the file system.
	 * 
	 * @param {any} attachment The attachment object to read the image from
	 * @param {any} onSave A function to call with the data after reading
	 */
	readImage(attachment, onSave) {
		// Gets a file entry using the file uri from the camera
		window['resolveLocalFileSystemURI'](attachment.url, entry => {
			// Gets the file itself
			entry.file(file => {
				let reader = new FileReader();
				reader.onload = () => {
					// Runs the save callback with the array buffer
					onSave(reader.result);
				}
				// Uses the file reader to convert the file to an array buffer
				reader.readAsArrayBuffer(file);
			});
		});
	}

	/**
	 * Loads all images in a set of attachments.
	 * 
	 * @param {any} attachments The list of attachments to load images for
	 */
	loadImages(attachments) {
		attachments.forEach(attachment => {
			// Checks that the attachment is an image
			if (attachment.mimeType.startsWith('image/')) {
				attachment.isImage = true;

				// Downloads the attachment as a blob
				this.query.getBlob(['media', attachment.attachmentUid], blob => {
					// Sets the attachment's URL to an object URL pointing to the blob
					attachment.url = URL.createObjectURL(blob);
				});
			}
		});
	}

	/**
	 * Uploads a set of images to a given path.
	 * 
	 * @param {any} attachments The set of image attachments to upload
	 * @param {any} path A path representing where the images should be attached
	 * @param {any} onComplete A function to call when the uploads are complete
	 */
	uploadImages(attachments, path, onComplete) {
		let completed = 0;

		attachments.forEach(attachment => {
			// If it wasn't given a name, give it a generic 'Image X'
			if (!attachment.name) {
				attachment.name = 'Image ' + (attachments.indexOf(attachment) + 1);
			}

			// If it doesn't have the correct file extension, set it to .jpg
			if (!attachment.name.endsWith('.jpg')) {
				attachment.name += '.jpg';
			}

			this.readImage(attachment, buffer => {
				// Sets the headers for the specific attachment
				let headers = {
					'Content-Type': 'image/jpeg',
					'Content-Disposition': 'form-data; filename="' + attachment.name + '"'
				}

				// Post the array buffer to the attachment URL path using the headers
				this.query.post(buffer, path, {}, headers).subscribe(
					data => {
						// Increment the completed count
						completed++;
					},
					error => {
						// Still increases the completed count so it isn't stuck loading forever
						completed++;

						// Not sure what the best way to warn the user that an upload failed is
						// Just giving a basic alert temporarily
						alert('WARNING: UPLOAD FAILED. ' + attachment.name + ' encountered ' + error);
					}
				);
			});
		});

		// Wait method checks to see if all uploads completed
		let wait = () => {
			// If it isn't done yet, try again in 500 milliseconds
			if (completed < attachments.length) {
				setTimeout(wait, 500);
			} else {
				// Otherwise run the callback function
				onComplete();
			}
		}
		wait();
	}
}