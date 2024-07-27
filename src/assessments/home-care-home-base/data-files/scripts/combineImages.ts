import * as fs from 'fs';
import jimp from 'jimp';

async function main() {
	const directoryPath = 'src/assessments/home-care-home-base/data-files/choice/pathways-screenshots';
	const imagePaths = fs.readdirSync(directoryPath).map((path) => `${directoryPath}/${path}`);
	const images = await Promise.all(imagePaths.map((path) => jimp.read(path)));

	const [firstImage, ...restImages] = images;
	if (!firstImage) {
		console.log('No images found');
		return;
	}
	let totalHeight = firstImage.bitmap.height;

	const width = firstImage.bitmap.width;
	for (const image of restImages) {
		totalHeight += image.bitmap.height;
	}

	const baseImage = new jimp(width, totalHeight);
	let height = 0;

	for (const image of images) {
		baseImage.composite(image, 0, height);
		height += image.bitmap.height;
	}

	baseImage.write('combined.png');
}

main().catch(console.error);
